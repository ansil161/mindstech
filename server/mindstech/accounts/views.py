from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token

from accounts.serializers import (
    LoginSerializer, UserProfileSerializer,
    AdminUserSerializer, AdminUserCreateSerializer,
)
from accounts.services import AuthService
from accounts.utils import StandardResponse
from accounts.permissions import IsAdminUserOnly, IsSuperAdminUser

User = get_user_model()

@method_decorator(ensure_csrf_cookie, name='dispatch')
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
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser
                },
                "csrf_token": get_token(request)
            }
        )
        tokens = AuthService.login_user(response, user)
        if tokens:
            response.data['data']['access_token'] = tokens.get('access_token')
            response.data['data']['refresh_token'] = tokens.get('refresh_token')
        return response


class LogoutView(APIView):
    """
    Handle user logout. Blacklists the refresh token and clears auth cookies.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
        refresh_token = request.COOKIES.get(refresh_cookie_name) or request.data.get('refresh') or request.data.get('refresh_token')

        response = StandardResponse(message="Logout successful.")
        AuthService.logout_user(response, refresh_token)
        return response


class TokenRefreshView(APIView):
    """
    Handle token refresh. Reads refresh token from HttpOnly cookie or request payload,
    rotates it, and sets updated access and refresh cookies.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE_REFRESH', 'refresh_token')
        refresh_token = request.COOKIES.get(refresh_cookie_name) or request.data.get('refresh') or request.data.get('refresh_token')

        response = StandardResponse(
            message="Token refreshed successfully.",
            data={
                "csrf_token": get_token(request)
            }
        )
        tokens = AuthService.refresh_user_tokens(response, refresh_token)
        if tokens:
            response.data['data']['access_token'] = tokens.get('access_token')
            response.data['data']['refresh_token'] = tokens.get('refresh_token')
        return response


@method_decorator(ensure_csrf_cookie, name='dispatch')
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


class AdminUserListCreateView(APIView):
    """
    List all admin (is_staff) accounts, or create a new one.
    Restricted to superusers so regular admins can't mint or enumerate
    other admin accounts.
    """
    permission_classes = [IsSuperAdminUser]

    def get(self, request):
        admins = User.objects.filter(is_staff=True).order_by('-date_joined')
        serializer = AdminUserSerializer(admins, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AdminUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)


class AdminUserDetailView(APIView):
    """
    Block/unblock (is_active) or delete a specific admin account.
    Restricted to superusers. A superuser can never change or delete their
    own row here (self-lockout guard) — since acting on any OTHER admin
    always leaves the acting superuser themselves active, this alone rules
    out the system ever being left with zero active superusers.
    """
    permission_classes = [IsSuperAdminUser]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk, is_staff=True)
        except User.DoesNotExist:
            return None

    def patch(self, request, pk):
        target = self.get_object(pk)
        if target is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if target.pk == request.user.pk:
            return Response({'detail': 'You cannot change your own admin status.'}, status=status.HTTP_400_BAD_REQUEST)
        if 'is_active' not in request.data:
            return Response({'detail': 'is_active is required.'}, status=status.HTTP_400_BAD_REQUEST)

        target.is_active = bool(request.data['is_active'])
        target.save(update_fields=['is_active'])
        return Response(AdminUserSerializer(target).data)

    def delete(self, request, pk):
        target = self.get_object(pk)
        if target is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if target.pk == request.user.pk:
            return Response({'detail': 'You cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)

        target.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
