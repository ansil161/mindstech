from rest_framework import status
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import TeamMember
from ..serializers import TeamMemberSerializer


# ──────────────────────────────────────────────
# Admin: Team Member CRUD
# ──────────────────────────────────────────────

class TeamMemberListCreateView(APIView):
    """List all team members or add a new one (admin only)."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        members = TeamMember.objects.all()
        serializer = TeamMemberSerializer(members, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = TeamMemberSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
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
        # Delete the photo file if present
        if member.photo:
            try:
                member.photo.delete(save=False)
            except Exception:
                pass
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────
# Public: Team data (no auth required)
# ──────────────────────────────────────────────

class PublicTeamMembersView(APIView):
    """
    Public endpoint that returns the shared team member list shown on the About page,
    identical for every region.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        members = TeamMember.objects.filter(is_active=True).order_by('display_order', 'created_at')
        serializer = TeamMemberSerializer(members, many=True, context={'request': request})
        return Response(serializer.data)
