from django.urls import path
from .views import (
    DashboardStatsView,
    EnquirySubmitView, EnquiryAdminListView, EnquiryAdminDetailView,
    FieldworkListCreateView, FieldworkDetailView,
    SolutionListCreateView, SolutionDetailView,
    BlogListCreateView, BlogDetailView,
    CollectionCentreListCreateView, CollectionCentreDetailView,
    DocumentListCreateView, DocumentDetailView, DocumentParseView, DocumentIndexView,
    ChatBotView, ChatHistoryView,
    GalleryListCreateView, GalleryDetailView,
)

urlpatterns = [
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # Enquiries
    path('enquiries/submit/', EnquirySubmitView.as_view(), name='enquiry-submit'),
    path('enquiries/', EnquiryAdminListView.as_view(), name='enquiry-list'),
    path('enquiries/<int:pk>/', EnquiryAdminDetailView.as_view(), name='enquiry-detail'),

    # Fieldwork
    path('fieldwork/', FieldworkListCreateView.as_view(), name='fieldwork-list-create'),
    path('fieldwork/<int:pk>/', FieldworkDetailView.as_view(), name='fieldwork-detail'),

    # Solutions
    path('solutions/', SolutionListCreateView.as_view(), name='solution-list-create'),
    path('solutions/<int:pk>/', SolutionDetailView.as_view(), name='solution-detail'),

    # Blogs
    path('blogs/', BlogListCreateView.as_view(), name='blog-list-create'),
    path('blogs/<int:pk>/', BlogDetailView.as_view(), name='blog-detail'),

    # Collection Centres
    path('collection-centres/', CollectionCentreListCreateView.as_view(), name='collection-centre-list-create'),
    path('collection-centres/<int:pk>/', CollectionCentreDetailView.as_view(), name='collection-centre-detail'),

    # Documents
    path('documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    path('documents/<int:pk>/parse/', DocumentParseView.as_view(), name='document-parse'),
    path('documents/<int:pk>/index/', DocumentIndexView.as_view(), name='document-index'),

    # Chatbot
    path('chatbot/', ChatBotView.as_view(), name='admin-chatbot'),
    path('chat/history/<str:conversation_id>/', ChatHistoryView.as_view(), name='admin-chat-history'),

    # Gallery
    path('gallery/', GalleryListCreateView.as_view(), name='gallery-list-create'),
    path('gallery/<int:pk>/', GalleryDetailView.as_view(), name='gallery-detail'),
]
