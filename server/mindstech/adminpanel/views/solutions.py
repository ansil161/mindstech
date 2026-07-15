from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from ..models import Solution
from ..serializers import SolutionSerializer


class SolutionListCreateView(APIView):
    """
    Endpoint for Solutions.
    GET: Publicly accessible list.
    POST: Restricted to staff, supports image uploads.
    """
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get(self, request):
        solutions = Solution.objects.all()
        # Pass request in context so image URLs are fully qualified absolute URLs
        serializer = SolutionSerializer(solutions, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SolutionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SolutionDetailView(APIView):
    """
    Admin-only endpoint to delete a solution.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, pk):
        solution = get_object_or_404(Solution, pk=pk)
        # Clean up physical file on disk first
        if solution.image:
            solution.image.delete(save=False)
        solution.delete()
        return Response(
            {"message": "Solution deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
