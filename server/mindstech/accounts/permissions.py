from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUserOnly(BasePermission):
    """
    Allows access only to authenticated, active admin users (is_staff=True).
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_active and
            request.user.is_staff
        )


class AdminOrReadOnly(BasePermission):
    """
    Allows read-only access to anyone, but restricts write operations
    exclusively to authenticated, active admin users.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
            
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_active and
            request.user.is_staff
        )
