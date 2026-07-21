from django.conf import settings

class JWTAuthCookieMiddleware:
    """
    Middleware that inspects incoming HTTP requests for an HttpOnly JWT access token cookie.
    If present and HTTP_AUTHORIZATION header is missing, it injects the token into META['HTTP_AUTHORIZATION']
    as a Bearer token so standard DRF SimpleJWT authentication can process it seamlessly.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        cookie_name = getattr(settings, 'SIMPLE_JWT', {}).get('AUTH_COOKIE', 'access_token')
        token = request.COOKIES.get(cookie_name)

        # If token exists in cookie and Authorization header is missing, inject Bearer header
        if token and 'HTTP_AUTHORIZATION' not in request.META:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'

        response = self.get_response(request)
        return response
