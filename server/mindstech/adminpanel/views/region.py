import os

from rest_framework import status
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Region, RegionContact, RegionBrand, ClientTestimonial, Solution
from ..serializers import (
    RegionSerializer,
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
# Admin: Region Contact CRUD
# ──────────────────────────────────────────────

class RegionContactView(APIView):
    """Get or create/update contact info for a region (admin only)."""
    permission_classes = [IsAdminUser]

    def get(self, request, region_id):
        contacts = RegionContact.objects.filter(region_id=region_id)
        if contacts.exists():
            serializer = RegionContactSerializer(contacts.first(), context={'request': request})
            return Response(serializer.data)
        else:
            return Response(None, status=status.HTTP_204_NO_CONTENT)

    def put(self, request, region_id):
        region = Region.objects.get(pk=region_id)
        contacts = RegionContact.objects.filter(region=region)
        if contacts.exists():
            contact = contacts.first()
            created = False
        else:
            contact = RegionContact(region=region)
            created = True
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
        # Delete the logo file if present
        if brand.logo:
            try:
                brand.logo.delete(save=False)
            except Exception:
                pass
        brand.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────
# Admin: Testimonial CRUD
# ──────────────────────────────────────────────

class TestimonialListCreateView(APIView):
    """List all testimonials or add a new one (admin only)."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        testimonials = ClientTestimonial.objects.all()
        serializer = TestimonialSerializer(testimonials, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = TestimonialSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
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
        # Delete the photo file if present
        if testimonial.photo:
            try:
                testimonial.photo.delete(save=False)
            except Exception:
                pass
        testimonial.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────
# Public: Region data (no auth required)
# ──────────────────────────────────────────────

class PublicRegionListView(APIView):
    """
    Public endpoint that returns all active top-level regions and their sub_regions.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        regions = Region.objects.filter(parent__isnull=True).prefetch_related('sub_regions').order_by('display_order', 'name')
        serializer = RegionSerializer(regions, many=True, context={'request': request})
        return Response(serializer.data)


class PublicRegionDataView(APIView):
    """
    Public endpoint that returns a region's contact info and brands.
    Used by the About and Contact pages when the user switches region.
    """
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            region = Region.objects.prefetch_related('contacts', 'brands').get(slug=slug)
        except Region.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RegionDetailSerializer(region, context={'request': request})
        return Response(serializer.data)


class PublicTestimonialsView(APIView):
    """
    Public endpoint that returns the shared client testimonial list shown on the Home page,
    identical for every region.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        testimonials = ClientTestimonial.objects.filter(is_active=True).order_by('display_order', 'created_at')
        serializer = TestimonialSerializer(testimonials, many=True, context={'request': request})
        return Response(serializer.data)


class PublicRegionSolutionBrandsView(APIView):
    """
    Public endpoint that returns only the active brands associated with a specific region and solution vertical.
    """
    permission_classes = [AllowAny]

    def get(self, request, region_slug, solution_slug):
        try:
            region = Region.objects.get(slug=region_slug)
        except Region.DoesNotExist:
            return Response({'detail': 'Region not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            solution = Solution.objects.get(slug=solution_slug)
        except Solution.DoesNotExist:
            return Response({'detail': 'Solution not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Filter active brands for the region that are linked to this solution
        brands = RegionBrand.objects.filter(
            region=region,
            solutions=solution
        ).order_by('display_order', 'created_at')

        serializer = RegionBrandSerializer(brands, many=True, context={'request': request})
        return Response(serializer.data)


class RegionContactListCreateView(APIView):
    """List contacts for a region or add a new one (admin only)."""
    permission_classes = [IsAdminUser]

    def get(self, request, region_id):
        contacts = RegionContact.objects.filter(region_id=region_id)
        serializer = RegionContactSerializer(contacts, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, region_id):
        region = Region.objects.get(pk=region_id)
        serializer = RegionContactSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(region=region)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RegionContactDetailView(APIView):
    """Update or delete a region contact (admin only)."""
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        contact = RegionContact.objects.get(pk=pk)
        serializer = RegionContactSerializer(contact, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        contact = RegionContact.objects.get(pk=pk)
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
