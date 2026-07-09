from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

class StandardResponse(Response):
    """
    Standardized response format for successful API calls:
    {
        "success": true,
        "message": "...",
        "data": {}
    }
    """
    def __init__(self, data=None, message="Success", status=None, **kwargs):
        formatted_data = {
            "success": True,
            "message": message,
            "data": data if data is not None else {}
        }
        super().__init__(data=formatted_data, status=status, **kwargs)


def custom_exception_handler(exc, context):
    """
    Standardized error response format for exceptions/validation errors:
    {
        "success": false,
        "message": "...",
        "errors": {}
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        errors = response.data
        message = "An error occurred"

        # If it's a detail message (like AuthenticationFailed, PermissionDenied, NotFound)
        if isinstance(errors, dict) and 'detail' in errors:
            message = errors.pop('detail')
            if not errors:
                errors = {}
        
        # If it's a dictionary of validation errors (e.g. Serializer errors)
        elif isinstance(errors, dict):
            message = "Validation failed."
        
        # If it's a list of errors
        elif isinstance(errors, list):
            message = "Validation failed."
            errors = {"non_field_errors": errors}

        response.data = {
            "success": False,
            "message": message,
            "errors": errors
        }
    else:
        # Handle unhandled server-side errors (500)
        from django.conf import settings
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Unhandled Exception: {exc}", exc_info=True)

        message = str(exc) if settings.DEBUG else "An unexpected error occurred."
        errors = {"detail": str(exc)} if settings.DEBUG else {}

        response = Response(
            {
                "success": False,
                "message": message,
                "errors": errors
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
