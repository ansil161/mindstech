from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404

from ..models import CollectionCentre
from ..serializers import CollectionCentreSerializer


class CollectionCentreListCreateView(APIView):
    """Public list of active collection centres; staff can create centres."""

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get(self, request):
        centres = (
            CollectionCentre.objects.all()
            if request.user.is_authenticated and request.user.is_staff
            else CollectionCentre.objects.filter(is_active=True)
        )
        return Response(CollectionCentreSerializer(centres, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CollectionCentreSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CollectionCentreDetailView(APIView):
    """Staff-only update and delete endpoint for collection centres."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self, pk):
        return get_object_or_404(CollectionCentre, pk=pk)

    def patch(self, request, pk):
        serializer = CollectionCentreSerializer(self.get_object(pk), data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        self.get_object(pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
