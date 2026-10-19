from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from ..models import HomeHighlight
from ..serializers import HomeHighlightSerializer


class HomeHighlightListCreateView(APIView):
    """
    GET  — admin only: every card, including inactive ones.
    POST — admin only: add a card (multipart/form-data for the image).
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        serializer = HomeHighlightSerializer(
            HomeHighlight.objects.all(), many=True, context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = HomeHighlightSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HomeHighlightDetailView(APIView):
    """PATCH / DELETE — admin only."""
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, pk):
        item = get_object_or_404(HomeHighlight, pk=pk)
        serializer = HomeHighlightSerializer(item, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        item = get_object_or_404(HomeHighlight, pk=pk)
        if item.image:
            try:
                item.image.delete(save=False)
            except Exception:
                pass
        item.delete()
        return Response({'message': 'Item deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class PublicHomeHighlightsView(APIView):
    """Public endpoint — active cards for the home page, in display order."""
    permission_classes = [AllowAny]

    def get(self, request):
        qs = HomeHighlight.objects.filter(is_active=True)
        serializer = HomeHighlightSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
