import os

from rest_framework import status
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Region, TeamMember, RegionContact, RegionBrand, ClientTestimonial
from ..serializers import (
    RegionSerializer, TeamMemberSerializer,
    RegionContactSerializer, RegionDetailSerializer, RegionBrandSerializer,
    TestimonialSerializer,
)


# ──────────────────────────────────────────────
# Admin: Region CRUD
# ──────────────────────────────────────────────

class RegionListCreateView(APIView):
    """List all regions or create a new one (admin only)."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        regions = Region.objects.all()
        serializer = RegionSerializer(regions, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = RegionSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RegionDetailView(APIView):
    """Retrieve, update, or delete a specific region (admin only)."""
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        try:
            return Region.objects.get(pk=pk)
        except Region.DoesNotExist:
            return None

    def get(self, request, pk):
        region = self.get_object(pk)
        if region is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RegionSerializer(region, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        region = self.get_object(pk)
        if region is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RegionSerializer(region, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        region = self.get_object(pk)
        if region is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RegionSerializer(region, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        region = self.get_object(pk)
        if region is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        region.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────
# Admin: Team Member CRUD
# ──────────────────────────────────────────────

class TeamMemberListCreateView(APIView):
    """List team members for a region or add a new one (admin only)."""
    permission_classes = [IsAdminUser]

    def get(self, request, region_id):
        members = TeamMember.objects.filter(region_id=region_id)
        serializer = TeamMemberSerializer(members, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, region_id):
        region = Region.objects.get(pk=region_id)
        serializer = TeamMemberSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(region=region)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TeamMemberDetailView(APIView):
    """Update or delete a specific team member (admin only)."""
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        try:
            return TeamMember.objects.get(pk=pk)
        except TeamMember.DoesNotExist:
            return None

    def get(self, request, pk):
        member = self.get_object(pk)
        if member is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TeamMemberSerializer(member, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        member = self.get_object(pk)
        if member is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TeamMemberSerializer(member, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        member = self.get_object(pk)
        if member is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TeamMemberSerializer(member, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        member = self.get_object(pk)
        if member is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Delete the photo file from disk
        if member.photo:
            if os.path.isfile(member.photo.path):
                try:
                    os.remove(member.photo.path)
                except OSError:
                    pass
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
        serializer = RegionContactSerializer(contact, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# Admin: Region Brand CRUD
# ──────────────────────────────────────────────

class RegionBrandListCreateView(APIView):
    """List brands for a region or add a new one (admin only)."""
    permission_classes = [IsAdminUser]

    def get(self, request, region_id):
        brands = RegionBrand.objects.filter(region_id=region_id)
        serializer = RegionBrandSerializer(brands, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, region_id):
        region = Region.objects.get(pk=region_id)
        serializer = RegionBrandSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(region=region)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RegionBrandDetailView(APIView):
    """Update or delete a specific brand (admin only)."""
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        try:
            return RegionBrand.objects.get(pk=pk)
        except RegionBrand.DoesNotExist:
            return None

    def get(self, request, pk):
        brand = self.get_object(pk)
        if brand is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RegionBrandSerializer(brand, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        brand = self.get_object(pk)
        if brand is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RegionBrandSerializer(brand, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        brand = self.get_object(pk)
        if brand is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RegionBrandSerializer(brand, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        brand = self.get_object(pk)
        if brand is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Delete the logo file from disk if it exists
        if brand.logo:
            if os.path.isfile(brand.logo.path):
                try:
                    os.remove(brand.logo.path)
                except OSError:
                    pass
        brand.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────
# Admin: Testimonial CRUD
# ──────────────────────────────────────────────

class TestimonialListCreateView(APIView):
    """List testimonials for a region or add a new one (admin only)."""
    permission_classes = [IsAdminUser]

    def get(self, request, region_id):
        testimonials = ClientTestimonial.objects.filter(region_id=region_id)
        serializer = TestimonialSerializer(testimonials, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, region_id):
        region = Region.objects.get(pk=region_id)
        serializer = TestimonialSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(region=region)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TestimonialDetailView(APIView):
    """Update or delete a specific testimonial (admin only)."""
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        try:
            return ClientTestimonial.objects.get(pk=pk)
        except ClientTestimonial.DoesNotExist:
            return None

    def get(self, request, pk):
        testimonial = self.get_object(pk)
        if testimonial is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TestimonialSerializer(testimonial, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        testimonial = self.get_object(pk)
        if testimonial is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TestimonialSerializer(testimonial, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        testimonial = self.get_object(pk)
        if testimonial is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TestimonialSerializer(testimonial, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        testimonial = self.get_object(pk)
        if testimonial is None:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if testimonial.photo:
            if os.path.isfile(testimonial.photo.path):
                try:
                    os.remove(testimonial.photo.path)
                except OSError:
                    pass
        testimonial.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────
# Public: Region data (no auth required)
# ──────────────────────────────────────────────

class PublicRegionDataView(APIView):
    """
    Public endpoint that returns a region's team members, contact info, and brands.
    Used by the About and Contact pages when the user switches region.
    """
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            region = Region.objects.get(slug=slug, is_active=True)
        except Region.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RegionDetailSerializer(region, context={'request': request})
        return Response(serializer.data)
