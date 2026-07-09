from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from django.conf import settings

from accounts.serializers import LoginSerializer, UserProfileSerializer
from accounts.services import AuthService
from accounts.utils import StandardResponse
from accounts.permissions import IsAdminUserOnly

class LoginView(APIView):
    """
    Handle admin user login. Rate-limited via ScopedRateThrottle.
    Authenticates email & password, sets secure HttpOnly cookies.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = AuthService.authenticate_admin(email, password)

        response = StandardResponse(
            message="Login successful.",
            data={
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_staff": user.is_staff
                }
            }
        )
        AuthService.login_user(response, user)
        return response


class LogoutView(APIView):
    """
    Handle user logout. Blacklists the refresh token and clears auth cookies.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
        refresh_token = request.COOKIES.get(refresh_cookie_name)

        response = StandardResponse(message="Logout successful.")
        AuthService.logout_user(response, refresh_token)
        return response


class TokenRefreshView(APIView):
    """
    Handle token refresh. Reads refresh token from HttpOnly cookie,
    rotates it, and sets updated access and refresh cookies.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
        refresh_token = request.COOKIES.get(refresh_cookie_name)

        response = StandardResponse(message="Token refreshed successfully.")
        AuthService.refresh_user_tokens(response, refresh_token)
        return response


class UserProfileView(APIView):
    """
    Retrieve current authenticated user's profile details.
    Restricted only to active, authenticated admin users.
    """
    permission_classes = [IsAdminUserOnly]

    def get(self, request, *args, **kwargs):
        serializer = UserProfileSerializer(request.user)
        return StandardResponse(
            data=serializer.data,
            message="Profile retrieved successfully."
        )
