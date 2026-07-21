from django.conf import settings
from rest_framework.authentication import CSRFCheck
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication

class HttpOnlyCookieJWTAuthentication(JWTAuthentication):
    """
    Custom DRF authentication class that extracts the SimpleJWT access token
    from an HttpOnly cookie ('access_token'). Falls back to the Authorization header if missing.
    """
    def authenticate(self, request):
        cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
        raw_token = request.COOKIES.get(cookie_name)
        
        # If cookie is absent, fall back to default Authorization header checking
        if raw_token is None:
            return super().authenticate(request)

        # Validate token using Simple JWT's base validation
        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        # Enforce CSRF check for state-changing requests (POST, PUT, PATCH, DELETE)
        self.enforce_csrf(request)

        return user, validated_token

    def enforce_csrf(self, request):
        """
        Enforce CSRF validation for state-changing requests when authenticated via cookies.
        Safe HTTP methods (GET, HEAD, OPTIONS, TRACE) skip CSRF checks.
        """
        if request.method in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            return

        check = CSRFCheck(request)
        check.process_request(request)
        
        reason = check.process_view(request, None, (), {})
        if reason:
            raise PermissionDenied(f"CSRF Failed: {reason}")
