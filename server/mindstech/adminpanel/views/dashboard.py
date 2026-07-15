from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from ..models import Enquiry, Fieldwork, Solution, Blog, CollectionCentre, Document


class DashboardStatsView(APIView):
    """
    Admin-only endpoint that returns aggregate counts for the dashboard overview.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        stats = {
            "enquiries": Enquiry.objects.count(),
            "fieldwork_projects": Fieldwork.objects.count(),
            "solutions": Solution.objects.count(),
            "blogs": Blog.objects.count(),
            "collection_centres": CollectionCentre.objects.filter(is_active=True).count(),
            "documents": Document.objects.count(),
        }
        return Response(stats, status=status.HTTP_200_OK)
