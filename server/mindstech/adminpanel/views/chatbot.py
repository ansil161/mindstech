from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from ..services.ai_client import AIClient, AIClientError


class ChatBotView(APIView):
    """
    Public chatbot query endpoint that retrieves context and invokes LLM generation.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        message = request.data.get("message")
        conversation_id = request.data.get("conversation_id", "default")
        category = request.data.get("category")
        tenant_id = request.data.get("tenant_id", "default")

        if not message:
            return Response({"error": "Message parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        ai_client = AIClient()
        try:
            response_data = ai_client.chat_query(
                message=message,
                conversation_id=conversation_id,
                category=category,
                tenant_id=tenant_id
            )
            return Response(response_data, status=status.HTTP_200_OK)
        except AIClientError as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatHistoryView(APIView):
    """
    Public endpoint to retrieve the session's conversational logs.
    """
    permission_classes = [AllowAny]

    def get(self, request, conversation_id):
        ai_client = AIClient()
        try:
            history = ai_client.get_chat_history(conversation_id)
            return Response(history, status=status.HTTP_200_OK)
        except AIClientError as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
