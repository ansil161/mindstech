from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Region, TeamMember, RegionContact, RegionBrand
from ..serializers import (
    RegionSerializer, TeamMemberSerializer,
    RegionContactSerializer, RegionDetailSerializer, RegionBrandSerializer,
)


# ──────────────────────────────────────────────
# Admin: Region CRUD
# ──────────────────────────────────────────────

class RegionListCreateView(generics.ListCreateAPIView):
    """List all regions or create a new one (admin only)."""
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsAdminUser]


class RegionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific region (admin only)."""
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsAdminUser]


# ──────────────────────────────────────────────
# Admin: Team Member CRUD
# ──────────────────────────────────────────────

class TeamMemberListCreateView(generics.ListCreateAPIView):
    """List team members for a region or add a new one (admin only)."""
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return TeamMember.objects.filter(region_id=self.kwargs['region_id'])

    def perform_create(self, serializer):
        region = Region.objects.get(pk=self.kwargs['region_id'])
        serializer.save(region=region)


class TeamMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Update or delete a specific team member (admin only)."""
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAdminUser]

    def perform_destroy(self, instance):
        # Delete the photo file from disk
        if instance.photo:
            import os
            if os.path.isfile(instance.photo.path):
                try:
                    os.remove(instance.photo.path)
                except OSError:
                    pass
        instance.delete()


# ──────────────────────────────────────────────
# Admin: Region Contact CRUD
# ──────────────────────────────────────────────

class RegionContactView(APIView):
    """Get or create/update contact info for a region (admin only)."""
    permission_classes = [IsAdminUser]

    def get(self, request, region_id):
        try:
            contact = RegionContact.objects.get(region_id=region_id)
            serializer = RegionContactSerializer(contact, context={'request': request})
            return Response(serializer.data)
        except RegionContact.DoesNotExist:
            return Response(None, status=status.HTTP_204_NO_CONTENT)

    def put(self, request, region_id):
        region = Region.objects.get(pk=region_id)
        contact, created = RegionContact.objects.get_or_create(region=region)
        serializer = RegionContactSerializer(contact, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# Admin: Region Brand CRUD
# ──────────────────────────────────────────────

class RegionBrandListCreateView(generics.ListCreateAPIView):
    """List brands for a region or add a new one (admin only)."""
    serializer_class = RegionBrandSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return RegionBrand.objects.filter(region_id=self.kwargs['region_id'])

    def perform_create(self, serializer):
        region = Region.objects.get(pk=self.kwargs['region_id'])
        serializer.save(region=region)


class RegionBrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Update or delete a specific brand (admin only)."""
    queryset = RegionBrand.objects.all()
    serializer_class = RegionBrandSerializer
    permission_classes = [IsAdminUser]

    def perform_destroy(self, instance):
        # Delete the logo file from disk if it exists
        if instance.logo:
            import os
            if os.path.isfile(instance.logo.path):
                try:
                    os.remove(instance.logo.path)
                except OSError:
                    pass
        instance.delete()


# ──────────────────────────────────────────────
# Public: Region data (no auth required)
# ──────────────────────────────────────────────

class PublicRegionDataView(generics.RetrieveAPIView):
    """
    Public endpoint that returns a region's team members, contact info, and brands.
    Used by the About and Contact pages when the user switches region.
    """
    serializer_class = RegionDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Region.objects.filter(is_active=True)
