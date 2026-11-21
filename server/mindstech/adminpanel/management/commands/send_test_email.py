from django.core.management.base import BaseCommand, CommandError

from adminpanel.services import email_service


class Command(BaseCommand):
    help = 'Send a test email through Microsoft Graph to check the email settings.'

    def add_arguments(self, parser):
        parser.add_argument('to', nargs='?', help='Recipient (defaults to ENQUIRY_EMAIL_TO)')

    def handle(self, *args, **opts):
        if not email_service.is_configured():
            raise CommandError('MS_GRAPH_TENANT_ID / CLIENT_ID / CLIENT_SECRET / SENDER are not all set.')
        to = opts['to'] or email_service.recipients_for_subject('')
        if not to:
            raise CommandError('No recipient: pass one or set ENQUIRY_EMAIL_TO.')
        try:
            email_service.send_mail(
                to=to,
                subject='Mindstec website: email test',
                html_body='<p>This is a test from the Mindstec website. Enquiry emails are working.</p>',
            )
        except Exception as exc:
            raise CommandError(str(exc))
        self.stdout.write(self.style.SUCCESS(f'Sent to {to}'))
