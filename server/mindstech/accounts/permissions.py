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


class IsSuperAdminUser(BasePermission):
    """
    Allows access only to authenticated, active superusers — used to gate
    admin-account management (create/block/delete other admins) so that
    regular staff admins can't escalate privileges or lock each other out.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_active and
            request.user.is_staff and
            request.user.is_superuser
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
