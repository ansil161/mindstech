from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework import status
from adminpanel.services.translation_service import translation_service

class TranslateDynamicContentView(APIView):
    """
    API endpoint for dynamic frontend translation.
    Expects payload:
    {
        "data": [...] or {...},
        "fields": ["title", "description"],
        "target_lang": "fr"
    }
    """
    permission_classes = [AllowAny] # Since this is used by frontend for unauthenticated pages too
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'translation'

    def post(self, request, *args, **kwargs):
        data = request.data.get('data')
        fields = request.data.get('fields')
        target_lang = request.data.get('target_lang')

        if not data or not target_lang:
            return Response({'error': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        # Fallback fields if not provided
        if not fields:
            fields = ['title', 'description', 'content', 'summary']

        try:
            if isinstance(data, list):
                translated_data = translation_service.translate_list(data, fields, target_lang)
            elif isinstance(data, dict):
                translated_data = translation_service.translate_object(data, fields, target_lang)
            elif isinstance(data, str):
                translated_data = translation_service.translate_text(data, target_lang)
            else:
                return Response({'error': 'Invalid data format.'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({'translated_data': translated_data}, status=status.HTTP_200_OK)
        except Exception as e:
            # Fallback to returning original data to avoid breaking frontend
            return Response({'translated_data': data, 'error_logged': str(e)}, status=status.HTTP_200_OK)
