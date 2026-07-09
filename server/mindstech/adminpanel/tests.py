from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Enquiry, Fieldwork

User = get_user_model()

class EnquiryAPITests(APITestCase):
    def setUp(self):
        self.submit_url = reverse('enquiry-submit')
        self.list_url = reverse('enquiry-list')

        # Admin user
        self.admin_user = User.objects.create_user(
            email="admin@mindstec.com",
            username="admin_user",
            password="AdminPassword123",
            is_staff=True
        )

        # Normal user
        self.normal_user = User.objects.create_user(
            email="user@mindstec.com",
            username="normal_user",
            password="UserPassword123",
            is_staff=False
        )

        # Pre-populate an enquiry
        self.enquiry = Enquiry.objects.create(
            name="Original Name",
            email="original@example.com",
            phone="12345678",
            subject="Original Subject",
            message="Original Message"
        )
        self.detail_url = reverse('enquiry-detail', kwargs={'pk': self.enquiry.pk})

    def test_submit_enquiry_success(self):
        """
        Verify that a public user can successfully submit an enquiry and it is sanitized.
        """
        data = {
            "name": "<script>alert('xss')</script>John Doe",
            "email": "john@example.com",
            "phone": "+91 9988776655",
            "subject": "<b>Partnership Opportunity</b>",
            "message": "Let's work together. <i>Please call me.</i>"
        }
        response = self.client.post(self.submit_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Enquiry submitted successfully.")
        
        # Verify sanitization in response & DB
        db_enquiry = Enquiry.objects.get(email="john@example.com")
        self.assertEqual(db_enquiry.name, "alert('xss')John Doe")
        self.assertEqual(db_enquiry.subject, "Partnership Opportunity")
        self.assertEqual(db_enquiry.message, "Let's work together. Please call me.")
        self.assertEqual(db_enquiry.phone, "+91 9988776655")

    def test_submit_enquiry_invalid_email(self):
        """
        Verify that invalid email formats are rejected.
        """
        data = {
            "name": "Jane Doe",
            "email": "not-an-email",
            "phone": "123456",
            "subject": "Test",
            "message": "Test message"
        }
        response = self.client.post(self.submit_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_submit_enquiry_invalid_phone(self):
        """
        Verify that phone numbers without digits are rejected.
        """
        data = {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "phone": "abc-def",
            "subject": "Test",
            "message": "Test message"
        }
        response = self.client.post(self.submit_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("phone", response.data)

    def test_list_enquiries_anonymous_denied(self):
        """
        Verify that anonymous users cannot retrieve inquiries.
        """
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_enquiries_normal_user_denied(self):
        """
        Verify that authenticated non-staff users cannot retrieve inquiries.
        """
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_enquiries_admin_success(self):
        """
        Verify that authenticated admin users can retrieve inquiries.
        """
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["email"], "original@example.com")

    def test_update_enquiry_status_admin_success(self):
        """
        Verify that admins can patch enquiry status.
        """
        self.client.force_authenticate(user=self.admin_user)
        data = {"status": "Resolved"}
        response = self.client.patch(self.detail_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "Resolved")
        
        self.enquiry.refresh_from_db()
        self.assertEqual(self.enquiry.status, "Resolved")

    def test_delete_enquiry_admin_success(self):
        """
        Verify that admins can delete an enquiry.
        """
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Enquiry.objects.filter(pk=self.enquiry.pk).exists())


import io
import shutil
import tempfile
from PIL import Image
from django.test import override_settings

TEMP_MEDIA_ROOT = tempfile.mkdtemp()

@override_settings(MEDIA_ROOT=TEMP_MEDIA_ROOT)
class FieldworkAPITests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA_ROOT, ignore_errors=True)

    def setUp(self):
        self.list_create_url = reverse('fieldwork-list-create')
        
        # Admin user
        self.admin_user = User.objects.create_user(
            email="admin@mindstec.com",
            username="admin_user",
            password="AdminPassword123",
            is_staff=True
        )

        # Normal user
        self.normal_user = User.objects.create_user(
            email="user@mindstec.com",
            username="normal_user",
            password="UserPassword123",
            is_staff=False
        )

        # Generate dummy image
        file = io.BytesIO()
        image = Image.new('RGB', (100, 100), 'red')
        image.save(file, 'jpeg')
        file.seek(0)
        self.dummy_image = SimpleUploadedFile('test_image.jpg', file.read(), content_type='image/jpeg')

        # Pre-populate fieldwork
        self.project = Fieldwork.objects.create(
            title="Pre-populated Project",
            location_meta="Location meta description",
            category="Control room",
            image=self.dummy_image
        )
        self.detail_url = reverse('fieldwork-detail', kwargs={'pk': self.project.pk})

    def test_list_fieldwork_public_allowed(self):
        """
        Verify that anyone can retrieve fieldwork projects list without authentication.
        """
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Pre-populated Project")
        self.assertTrue(response.data[0]["image"].startswith("http"))

    def test_create_fieldwork_anonymous_denied(self):
        """
        Verify anonymous users cannot create projects.
        """
        data = {
            "title": "New Project",
            "location_meta": "Metatags",
            "category": "Corporate",
            "image": self.dummy_image
        }
        response = self.client.post(self.list_create_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_fieldwork_normal_user_denied(self):
        """
        Verify non-staff authenticated users cannot create projects.
        """
        self.client.force_authenticate(user=self.normal_user)
        data = {
            "title": "New Project",
            "location_meta": "Metatags",
            "category": "Corporate",
            "image": self.dummy_image
        }
        response = self.client.post(self.list_create_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_fieldwork_admin_success(self):
        """
        Verify admins can successfully upload images and create fieldwork projects.
        """
        self.client.force_authenticate(user=self.admin_user)
        
        file = io.BytesIO()
        image = Image.new('RGB', (100, 100), 'blue')
        image.save(file, 'jpeg')
        file.seek(0)
        new_image_file = SimpleUploadedFile('new_image.jpg', file.read(), content_type='image/jpeg')

        data = {
            "title": "Admin Created Project",
            "location_meta": "Nairobi, Kenya",
            "category": "Broadcast",
            "image": new_image_file
        }
        response = self.client.post(self.list_create_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Admin Created Project")
        
        db_project = Fieldwork.objects.get(title="Admin Created Project")
        self.assertEqual(db_project.category, "Broadcast")
        self.assertTrue(db_project.image.name.endswith(".jpg"))

    def test_delete_fieldwork_admin_success(self):
        """
        Verify admins can delete fieldwork records.
        """
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Fieldwork.objects.filter(pk=self.project.pk).exists())

