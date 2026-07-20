import os

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from ..models import EventNews
from ..serializers import EventNewsSerializer


class EventNewsListCreateView(APIView):
    """
    GET  — public: returns all active items (optionally filtered by ?type=event or ?type=news).
    POST — admin only: create a new event or news item (multipart/form-data for image upload).
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get(self, request):
        qs = EventNews.objects.all()
        item_type = request.query_params.get('type')
        if item_type in ('event', 'news'):
            qs = qs.filter(type=item_type)
        # For events: order upcoming first (soonest event_date), past events last
        # For news: order by latest created_at
        serializer = EventNewsSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = EventNewsSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventNewsDetailView(APIView):
    """
    GET    — public: single item detail.
    PATCH  — admin only: update item.
    DELETE — admin only: delete item and its image.
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get(self, request, pk):
        item = get_object_or_404(EventNews, pk=pk)
        serializer = EventNewsSerializer(item, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        item = get_object_or_404(EventNews, pk=pk)
        serializer = EventNewsSerializer(item, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        item = get_object_or_404(EventNews, pk=pk)
        # Remove image file from disk if it exists
        if item.image:
            try:
                if os.path.isfile(item.image.path):
                    os.remove(item.image.path)
            except OSError:
                pass
        item.delete()
        return Response({'message': 'Item deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class PublicUpcomingEventsView(APIView):
    """Public endpoint — returns active upcoming events (event_date >= now), sorted soonest first. Fallbacks to all events if no future events scheduled."""
    permission_classes = [AllowAny]

    def get(self, request):
        now = timezone.now()
        events = EventNews.objects.filter(
            type='event',
            event_date__gte=now,
        ).order_by('event_date')
        if not events.exists():
            events = EventNews.objects.filter(
                type='event',
            ).order_by('-event_date', '-created_at')
        serializer = EventNewsSerializer(events, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class PublicNewsView(APIView):
    """Public endpoint — returns active news items, latest first."""
    permission_classes = [AllowAny]

    def get(self, request):
        news = EventNews.objects.filter(
            type='news',
        ).order_by('-created_at')
        serializer = EventNewsSerializer(news, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
