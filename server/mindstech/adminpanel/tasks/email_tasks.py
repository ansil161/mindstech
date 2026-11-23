import logging

from celery import shared_task
from django.apps import apps
from django.conf import settings
from django.core.cache import cache

from adminpanel.services import email_service

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=5, default_retry_delay=60)
def send_enquiry_notification_task(self, enquiry_id: int):
    """Email the team about a new enquiry. Retries on Graph/network errors."""
    if not email_service.is_configured():
        logger.warning('Enquiry %s saved but not emailed: Microsoft Graph is not configured.', enquiry_id)
        return

    Enquiry = apps.get_model('adminpanel', 'Enquiry')
    try:
        enquiry = Enquiry.objects.get(pk=enquiry_id)
    except Enquiry.DoesNotExist:
        return

    to = email_service.recipients_for_enquiry(enquiry)
    if not to:
        logger.warning('Enquiry %s not emailed: ENQUIRY_EMAIL_TO is empty.', enquiry_id)
        return

    subject, html = email_service.build_enquiry_email(enquiry)
    try:
        email_service.send_mail(to=to, subject=subject, html_body=html, reply_to=enquiry.email)
    except Exception as exc:
        logger.error('Enquiry %s email failed (attempt %s): %s', enquiry_id, self.request.retries + 1, exc)
        raise self.retry(exc=exc)
    logger.info('Enquiry %s emailed to %s', enquiry_id, ', '.join(to))


@shared_task(bind=True, max_retries=5, default_retry_delay=60)
def send_enquiry_acknowledgement_task(self, enquiry_id: int):
    """Thank the person who enquired. Replies go to their regional inbox."""
    if not settings.ENQUIRY_ACK_ENABLED or not email_service.is_configured():
        return

    Enquiry = apps.get_model('adminpanel', 'Enquiry')
    try:
        enquiry = Enquiry.objects.get(pk=enquiry_id)
    except Enquiry.DoesNotExist:
        return

    # The form is public, so anyone can type someone else's address. Cap the
    # thank-you at one per address per hour so the site can't be used to
    # flood an inbox. Only the first attempt claims the slot; retries reuse it.
    if self.request.retries == 0 and not cache.add(f'enquiry_ack:{enquiry.email.lower()}', 1, 3600):
        logger.info('Enquiry %s: acknowledgement skipped, one was sent to this address within the hour.', enquiry_id)
        return

    team_inbox = email_service.recipients_for_enquiry(enquiry)
    subject, html = email_service.build_acknowledgement_email(enquiry)
    try:
        email_service.send_mail(
            to=[enquiry.email], subject=subject, html_body=html,
            reply_to=team_inbox[0] if team_inbox else None,
        )
    except Exception as exc:
        logger.error('Enquiry %s acknowledgement failed (attempt %s): %s', enquiry_id, self.request.retries + 1, exc)
        raise self.retry(exc=exc)
    logger.info('Enquiry %s acknowledgement sent to %s', enquiry_id, enquiry.email)
