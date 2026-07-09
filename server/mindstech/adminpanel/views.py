from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.throttling import AnonRateThrottle
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Enquiry, Fieldwork
from .serializers import EnquirySerializer, EnquiryStatusUpdateSerializer, FieldworkSerializer

class EnquirySubmitView(APIView):
    """
    Public endpoint to submit an inquiry. Rate limited to prevent spam.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        serializer = EnquirySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Enquiry submitted successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EnquiryAdminListView(APIView):
    """
    Protected endpoint for admins to list all inquiries.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        enquiries = Enquiry.objects.all()
        serializer = EnquirySerializer(enquiries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EnquiryAdminDetailView(APIView):
    """
    Protected endpoint for admins to update status or delete an inquiry.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        enquiry = get_object_or_404(Enquiry, pk=pk)
        serializer = EnquiryStatusUpdateSerializer(enquiry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Return full serializer for UI updates
            return Response(EnquirySerializer(enquiry).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        enquiry = get_object_or_404(Enquiry, pk=pk)
        enquiry.delete()
        return Response(
            {"message": "Enquiry deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


class FieldworkListCreateView(APIView):
    """
    Endpoint for Fieldwork projects.
    GET: Publicly accessible list.
    POST: Restricted to staff, supports image uploads.
    """
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get(self, request):
        projects = Fieldwork.objects.all()
        # Pass request in context so image URLs are fully qualified absolute URLs
        serializer = FieldworkSerializer(projects, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = FieldworkSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FieldworkDetailView(APIView):
    """
    Admin-only endpoint to update or delete a fieldwork project.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, pk):
        project = get_object_or_404(Fieldwork, pk=pk)
        # partial=True allows text modifications without requiring re-uploading the image file
        serializer = FieldworkSerializer(project, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = get_object_or_404(Fieldwork, pk=pk)
        # Clean up physical file on disk first
        if project.image:
            project.image.delete(save=False)
        project.delete()
        return Response(
            {"message": "Project deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )

