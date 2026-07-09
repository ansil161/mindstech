from django.contrib.auth import get_user_model
from django.urls import reverse
from django.conf import settings
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

User = get_user_model()

class CustomUserModelTests(APITestCase):
    def test_create_user_with_email(self):
        """
        Verify that a user can be successfully created with email as USERNAME_FIELD.
        """
        user = User.objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="SecurePassword123"
        )
        self.assertEqual(user.email, "testuser@example.com")
        self.assertEqual(user.username, "testuser")
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertIsNotNone(user.created_at)
        self.assertIsNotNone(user.updated_at)

    def test_create_superuser(self):
        """
        Verify that superuser can be created with email and username.
        """
        admin = User.objects.create_superuser(
            email="admin@example.com",
            username="adminuser",
            password="AdminPassword123"
        )
        self.assertEqual(admin.email, "admin@example.com")
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)


class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.login_url = reverse('accounts:login')
        self.logout_url = reverse('accounts:logout')
        self.refresh_url = reverse('accounts:refresh')
        self.profile_url = reverse('accounts:profile')

        # Admin user (staff)
        self.admin_password = "SecureAdmin123"
        self.admin_user = User.objects.create_user(
            email="admin@mindstec.com",
            username="admin_user",
            password=self.admin_password,
            is_staff=True
        )

        # Normal user (non-staff)
        self.normal_password = "SecureUser123"
        self.normal_user = User.objects.create_user(
            email="user@mindstec.com",
            username="normal_user",
            password=self.normal_password,
            is_staff=False
        )

        # Inactive Admin user
        self.inactive_admin = User.objects.create_user(
            email="inactive@mindstec.com",
            username="inactive_admin",
            password="SecureAdmin123",
            is_staff=True,
            is_active=False
        )

    def test_login_success_for_staff_user(self):
        """
        Verify that is_staff users can login successfully, receive correct success structure,
        and both JWT tokens are set as HttpOnly cookies.
        """
        data = {
            "email": "admin@mindstec.com",
            "password": self.admin_password
        }
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify standardized response structure
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["message"], "Login successful.")
        self.assertIn("user", response.data["data"])
        self.assertEqual(response.data["data"]["user"]["email"], "admin@mindstec.com")

        # Verify HttpOnly cookies
        access_cookie = response.cookies.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        refresh_cookie = response.cookies.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        
        self.assertIsNotNone(access_cookie)
        self.assertIsNotNone(refresh_cookie)
        self.assertTrue(access_cookie['httponly'])
        self.assertTrue(refresh_cookie['httponly'])
        
        if not settings.DEBUG:
            self.assertTrue(access_cookie['secure'])
            self.assertTrue(refresh_cookie['secure'])

    def test_login_rejects_non_staff_user(self):
        """
        Verify that login is rejected for non-staff users.
        """
        data = {
            "email": "user@mindstec.com",
            "password": self.normal_password
        }
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Access denied. Administrator privileges required.")
        self.assertIn("errors", response.data)

    def test_login_rejects_inactive_user(self):
        """
        Verify that login is rejected for inactive users.
        """
        data = {
            "email": "inactive@mindstec.com",
            "password": "SecureAdmin123"
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "User account is disabled.")

    def test_login_timing_and_non_existent_user(self):
        """
        Verify that logging in with non-existent user does not leak existence
        and returns the standard "Invalid email or password" error.
        """
        data = {
            "email": "nonexistent@mindstec.com",
            "password": "RandomPassword123"
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Invalid email or password.")

    def test_profile_retrieval_success_when_authenticated_via_cookie(self):
        """
        Verify that we can retrieve profile info only when access token cookie is present.
        """
        # Generate token
        refresh = RefreshToken.for_user(self.admin_user)
        access_token = str(refresh.access_token)

        # Attach cookie to request client
        self.client.cookies[settings.SIMPLE_JWT['AUTH_COOKIE']] = access_token

        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["email"], "admin@mindstec.com")
        self.assertTrue(response.data["data"]["is_staff"])
        self.assertIn("permissions", response.data["data"])

    def test_profile_retrieval_fails_when_unauthenticated(self):
        """
        Verify that profile endpoint rejects request with 401 when no cookie is sent.
        """
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data["success"])

    def test_token_refresh_rotation(self):
        """
        Verify token refresh rotation: old refresh token in cookie refreshes to new tokens in cookies,
        and old refresh token is blacklisted.
        """
        # Generate refresh token
        refresh = RefreshToken.for_user(self.admin_user)
        refresh_token_str = str(refresh)

        # Set refresh token cookie on client
        self.client.cookies[settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH']] = refresh_token_str

        response = self.client.post(self.refresh_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

        # Verify new cookies are set
        new_access_cookie = response.cookies.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        new_refresh_cookie = response.cookies.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])
        
        self.assertIsNotNone(new_access_cookie)
        self.assertIsNotNone(new_refresh_cookie)

        # Verify old refresh token is blacklisted
        self.assertTrue(
            OutstandingToken.objects.filter(token=refresh_token_str).exists()
        )
        self.assertTrue(
            BlacklistedToken.objects.filter(token__token=refresh_token_str).exists()
        )

    def test_logout_blacklists_token_and_deletes_cookies(self):
        """
        Verify that logging out blacklists the refresh token and clears all cookies.
        """
        refresh = RefreshToken.for_user(self.admin_user)
        refresh_token_str = str(refresh)

        self.client.cookies[settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH']] = refresh_token_str
        self.client.cookies[settings.SIMPLE_JWT['AUTH_COOKIE']] = str(refresh.access_token)

        response = self.client.post(self.logout_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

        # Check cookies cleared
        access_cookie = response.cookies.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        refresh_cookie = response.cookies.get(settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'])

        # In Django's test client, deleted cookies have value="" or max-age=0/empty
        self.assertEqual(access_cookie.value, "")
        self.assertEqual(refresh_cookie.value, "")

        # Check token is blacklisted
        self.assertTrue(
            BlacklistedToken.objects.filter(token__token=refresh_token_str).exists()
        )
