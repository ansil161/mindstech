import logging

from celery import shared_task
from django.apps import apps

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

    to = email_service.recipients_for_subject(enquiry.subject)
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
