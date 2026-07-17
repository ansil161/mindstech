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
    RegionListCreateView, RegionDetailView,
    TeamMemberListCreateView, TeamMemberDetailView,
    RegionContactView, PublicRegionDataView, PublicRegionSolutionBrandsView,
    RegionBrandListCreateView, RegionBrandDetailView,
    TestimonialListCreateView, TestimonialDetailView,
    RegionContactListCreateView, RegionContactDetailView,
    EventNewsListCreateView, EventNewsDetailView,
    PublicUpcomingEventsView, PublicNewsView,
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

    # Regions
    path('regions/', RegionListCreateView.as_view(), name='region-list-create'),
    path('regions/<int:pk>/', RegionDetailView.as_view(), name='region-detail'),
    path('regions/<int:region_id>/team/', TeamMemberListCreateView.as_view(), name='region-team-list-create'),
    path('team-members/<int:pk>/', TeamMemberDetailView.as_view(), name='team-member-detail'),
    path('regions/<int:region_id>/contact/', RegionContactView.as_view(), name='region-contact'),
    path('regions/<int:region_id>/contacts/', RegionContactListCreateView.as_view(), name='region-contact-list-create'),
    path('contacts/<int:pk>/', RegionContactDetailView.as_view(), name='region-contact-detail'),

    # Public region data (no auth)
    path('public/region/<slug:slug>/', PublicRegionDataView.as_view(), name='public-region-data'),
    path('public/region/<slug:region_slug>/solution/<slug:solution_slug>/brands/', PublicRegionSolutionBrandsView.as_view(), name='public-region-solution-brands'),

    # Brands
    path('regions/<int:region_id>/brands/', RegionBrandListCreateView.as_view(), name='region-brand-list-create'),
    path('brands/<int:pk>/', RegionBrandDetailView.as_view(), name='brand-detail'),

    # Testimonials
    path('regions/<int:region_id>/testimonials/', TestimonialListCreateView.as_view(), name='region-testimonial-list-create'),
    path('testimonials/<int:pk>/', TestimonialDetailView.as_view(), name='testimonial-detail'),

    # Events & News (admin CRUD)
    path('event-news/', EventNewsListCreateView.as_view(), name='eventnews-list-create'),
    path('event-news/<int:pk>/', EventNewsDetailView.as_view(), name='eventnews-detail'),

    # Events & News (public — no auth)
    path('public/events/', PublicUpcomingEventsView.as_view(), name='public-upcoming-events'),
    path('public/news/', PublicNewsView.as_view(), name='public-news'),
]
