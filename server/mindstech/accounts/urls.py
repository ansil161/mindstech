from django.urls import path
from accounts.views import (
    LoginView, LogoutView, TokenRefreshView, UserProfileView,
    AdminUserListCreateView, AdminUserDetailView,
)

app_name = 'accounts'

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('admins/', AdminUserListCreateView.as_view(), name='admin-list-create'),
    path('admins/<int:pk>/', AdminUserDetailView.as_view(), name='admin-detail'),
]
