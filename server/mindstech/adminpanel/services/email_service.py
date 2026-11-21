"""
Outbound email through Microsoft Graph (Microsoft 365 / Exchange Online).

Uses the OAuth2 client-credentials flow with an Entra ID app registration that
holds the *application* permission Mail.Send (admin-consented). The message is
sent from MS_GRAPH_SENDER's mailbox via POST /users/{sender}/sendMail, so it
appears in that mailbox's Sent Items like any normal mail.

Configuration (all from the environment, see settings.py):
    MS_GRAPH_TENANT_ID      Directory (tenant) ID, or the tenant's domain name
    MS_GRAPH_CLIENT_ID      Application (client) ID
    MS_GRAPH_CLIENT_SECRET  Client secret *value* (not the secret ID)
    MS_GRAPH_SENDER         Mailbox to send from, e.g. info@example.com
    ENQUIRY_EMAIL_TO        Comma-separated default recipients for enquiries
    ENQUIRY_EMAIL_ROUTES    Optional JSON {"<form subject>": "a@x.com,b@x.com"}
                            sending specific subjects to different inboxes
"""

import json
import logging
from html import escape

import requests
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

GRAPH_BASE = 'https://graph.microsoft.com/v1.0'
TOKEN_CACHE_KEY = 'ms_graph_access_token'
TIMEOUT = 20


class EmailNotConfigured(Exception):
    """Raised when the Graph settings needed to send are missing."""


class EmailSendError(Exception):
    """Raised when Graph rejects the token request or the send."""


def _split(value):
    return [a.strip() for a in (value or '').split(',') if a.strip()]


def is_configured():
    return all([
        settings.MS_GRAPH_TENANT_ID,
        settings.MS_GRAPH_CLIENT_ID,
        settings.MS_GRAPH_CLIENT_SECRET,
        settings.MS_GRAPH_SENDER,
    ])


def _get_token():
    token = cache.get(TOKEN_CACHE_KEY)
    if token:
        return token

    resp = requests.post(
        f'https://login.microsoftonline.com/{settings.MS_GRAPH_TENANT_ID}/oauth2/v2.0/token',
        data={
            'client_id': settings.MS_GRAPH_CLIENT_ID,
            'client_secret': settings.MS_GRAPH_CLIENT_SECRET,
            'scope': 'https://graph.microsoft.com/.default',
            'grant_type': 'client_credentials',
        },
        timeout=TIMEOUT,
    )
    if resp.status_code != 200:
        # error_description is safe to log; it never echoes the secret.
        try:
            detail = resp.json().get('error_description', resp.text)
        except ValueError:
            detail = resp.text
        raise EmailSendError(f'Token request failed ({resp.status_code}): {detail[:500]}')

    data = resp.json()
    token = data['access_token']
    # Refresh a few minutes before Microsoft's expiry.
    cache.set(TOKEN_CACHE_KEY, token, max(int(data.get('expires_in', 3600)) - 300, 60))
    return token


def send_mail(to, subject, html_body, reply_to=None, cc=None):
    """Send one HTML email from MS_GRAPH_SENDER. Raises on failure."""
    if not is_configured():
        raise EmailNotConfigured('Microsoft Graph email settings are incomplete.')
    to = to if isinstance(to, list) else _split(to)
    if not to:
        raise EmailNotConfigured('No recipients given.')

    def addr(a):
        return {'emailAddress': {'address': a}}

    message = {
        'subject': subject,
        'body': {'contentType': 'HTML', 'content': html_body},
        'toRecipients': [addr(a) for a in to],
    }
    if cc:
        message['ccRecipients'] = [addr(a) for a in (cc if isinstance(cc, list) else _split(cc))]
    if reply_to:
        message['replyTo'] = [addr(reply_to)]

    resp = requests.post(
        f'{GRAPH_BASE}/users/{settings.MS_GRAPH_SENDER}/sendMail',
        headers={'Authorization': f'Bearer {_get_token()}', 'Content-Type': 'application/json'},
        data=json.dumps({'message': message, 'saveToSentItems': True}),
        timeout=TIMEOUT,
    )
    if resp.status_code == 401:
        cache.delete(TOKEN_CACHE_KEY)
    if resp.status_code != 202:
        raise EmailSendError(f'sendMail failed ({resp.status_code}): {resp.text[:500]}')


def recipients_for_subject(subject):
    """Inbox(es) for an enquiry: a subject-specific route if set, else the default."""
    raw = settings.ENQUIRY_EMAIL_ROUTES
    if raw:
        try:
            routes = json.loads(raw)
        except ValueError:
            logger.error('ENQUIRY_EMAIL_ROUTES is not valid JSON; using ENQUIRY_EMAIL_TO.')
            routes = {}
        key = (subject or '').strip().lower()
        for route_subject, addresses in routes.items():
            if route_subject.strip().lower() == key and _split(addresses):
                return _split(addresses)
    return _split(settings.ENQUIRY_EMAIL_TO)


def build_enquiry_email(enquiry):
    """(subject, html) for the internal notification about a new enquiry."""
    source = 'Chatbot' if enquiry.source == 'chatbot' else 'Website form'
    rows = [
        ('Name', enquiry.name),
        ('Email', enquiry.email),
        ('Phone', enquiry.phone),
        ('Company', enquiry.company),
        ('Subject', enquiry.subject),
        ('Source', source),
        ('Received', enquiry.created_at.strftime('%d %b %Y, %H:%M UTC') if enquiry.created_at else ''),
    ]
    table = ''.join(
        f'<tr><td style="padding:6px 14px 6px 0;color:#666;vertical-align:top;white-space:nowrap">{escape(k)}</td>'
        f'<td style="padding:6px 0;color:#111">{escape(str(v))}</td></tr>'
        for k, v in rows if v
    )
    message = escape(enquiry.message).replace('\n', '<br>')
    html = (
        '<div style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;line-height:1.5;color:#111">'
        f'<h2 style="font-size:18px;margin:0 0 12px">New enquiry from the website</h2>'
        f'<table style="border-collapse:collapse;margin-bottom:16px">{table}</table>'
        f'<div style="padding:12px 14px;background:#f5f5f5;border-radius:6px">{message}</div>'
        '<p style="color:#888;font-size:12px;margin-top:16px">Reply to this email to respond directly to the sender.</p>'
        '</div>'
    )
    subject = f'Website enquiry: {enquiry.subject} — {enquiry.name}'
    return subject, html
