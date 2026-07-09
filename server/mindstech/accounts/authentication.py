from django.conf import settings
from rest_framework.authentication import CSRFCheck
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication

class HttpOnlyCookieJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class that reads the access token from an HttpOnly cookie
    and performs CSRF validation if cookie authentication is successfully matched.
    """
    def authenticate(self, request):
        cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
        raw_token = request.COOKIES.get(cookie_name)
        
        # If the access token is not present in the cookies, delegate/return None
        if raw_token is None:
            return None

        # Validate the token using Simple JWT's base validation
        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        # Enforce CSRF check if user is authenticated via cookie
        # to protect against Cross-Site Request Forgery (CSRF)
        self.enforce_csrf(request)

        return user, validated_token

    def enforce_csrf(self, request):
        """
        Enforce CSRF validation for state-changing requests.
        """
        check = CSRFCheck(request)
        # Populates request.META['CSRF_COOKIE']
        check.process_request(request)
        
        # Runs the standard Django CSRF checks
        reason = check.process_view(request, None, (), {})
        if reason:
            raise PermissionDenied(f"CSRF Failed: {reason}")
