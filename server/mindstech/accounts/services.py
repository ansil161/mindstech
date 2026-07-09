from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import TokenError

User = get_user_model()

class AuthService:
    @staticmethod
    def authenticate_admin(email, password):
        """
        Authenticate user credentials and verify they have active admin (staff) status.
        Uses manual checks to ensure correct timing-attack protection while yielding
        403 Forbidden responses (instead of 401) for authenticated but unauthorized accounts.
        """
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                # Credentials are correct - check permissions
                if not user.is_active:
                    raise PermissionDenied("User account is disabled.")
                if not user.is_staff:
                    raise PermissionDenied("Access denied. Administrator privileges required.")
                return user
            else:
                # Incorrect password
                raise AuthenticationFailed("Invalid email or password.")
        except User.DoesNotExist:
            # Perform dummy password check to protect against timing attacks/user enumeration
            User().set_password(password)
            raise AuthenticationFailed("Invalid email or password.")

    @staticmethod
    def login_user(response, user):
        """
        Generate access and refresh tokens, set cookies, and update last_login.
        """
        # Generate Simple JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Set cookies on response
        AuthService._set_token_cookie(
            response=response,
            key=settings.SIMPLE_JWT['AUTH_COOKIE'],
            value=access_token,
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
        )

        AuthService._set_token_cookie(
            response=response,
            key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
            value=refresh_token,
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()
        )

        # Update last login timestamp in db
        update_last_login(None, user)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token
        }

    @staticmethod
    def logout_user(response, refresh_token):
        """
        Blacklist refresh token if provided, and delete authentication cookies.
        """
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (TokenError, ValueError):
                # Ignore invalid or already blacklisted tokens to allow safe logout
                pass

        # Clear cookies on response
        response.delete_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE'],
            path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
        )
        response.delete_cookie(
            key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
            path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
        )

    @staticmethod
    def refresh_user_tokens(response, refresh_token):
        """
        Validate, rotate, blacklist old refresh token, and set updated cookie tokens.
        """
        if not refresh_token:
            raise AuthenticationFailed("Refresh token is required.")

        try:
            # Leverage Simple JWT TokenRefreshSerializer for built-in rotation and blacklisting
            serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
            serializer.is_valid(raise_exception=True)
            tokens = serializer.validated_data

            new_access_token = tokens.get('access')
            new_refresh_token = tokens.get('refresh', refresh_token)

            # Set new cookies
            AuthService._set_token_cookie(
                response=response,
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=new_access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
            )

            AuthService._set_token_cookie(
                response=response,
                key=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH'],
                value=new_refresh_token,
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()
            )

            return {
                "access_token": new_access_token,
                "refresh_token": new_refresh_token
            }
        except Exception:
            raise AuthenticationFailed("Invalid or expired refresh token.")

    @staticmethod
    def _set_token_cookie(response, key, value, max_age):
        """
        Helper method to apply common cookie properties.
        """
        # Determine secure dynamically from settings.DEBUG at runtime (e.g. True in tests and prod)
        secure_cookie = not settings.DEBUG
        
        response.set_cookie(
            key=key,
            value=value,
            max_age=max_age,
            secure=secure_cookie,
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH']
        )
