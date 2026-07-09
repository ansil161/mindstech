from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.throttling import AnonRateThrottle
from django.shortcuts import get_object_or_404
from .models import Enquiry
from .serializers import EnquirySerializer, EnquiryStatusUpdateSerializer

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
