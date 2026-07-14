"""
URL configuration for mindstech project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from .views import (
    EnquirySubmitView, EnquiryAdminListView, EnquiryAdminDetailView,
    FieldworkListCreateView, FieldworkDetailView,
    SolutionListCreateView, SolutionDetailView,
    BlogListCreateView, BlogDetailView,
    CollectionCentreListCreateView, CollectionCentreDetailView,
    ChatBotView, ChatHistoryView,
    DocumentListCreateView, DocumentDetailView, DocumentParseView, DocumentIndexView
)

urlpatterns = [
    path('enquiries/submit/', EnquirySubmitView.as_view(), name='enquiry-submit'),
    path('enquiries/', EnquiryAdminListView.as_view(), name='enquiry-list'),
    path('enquiries/<int:pk>/', EnquiryAdminDetailView.as_view(), name='enquiry-detail'),
    path('fieldwork/', FieldworkListCreateView.as_view(), name='fieldwork-list-create'),
    path('fieldwork/<int:pk>/', FieldworkDetailView.as_view(), name='fieldwork-detail'),
    path('solutions/', SolutionListCreateView.as_view(), name='solution-list-create'),
    path('solutions/<int:pk>/', SolutionDetailView.as_view(), name='solution-detail'),
    path('blogs/', BlogListCreateView.as_view(), name='blog-list-create'),
    path('blogs/<int:pk>/', BlogDetailView.as_view(), name='blog-detail'),
    path('collection-centres/', CollectionCentreListCreateView.as_view(), name='collection-centre-list-create'),
    path('collection-centres/<int:pk>/', CollectionCentreDetailView.as_view(), name='collection-centre-detail'),
    path('documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    path('documents/<int:pk>/parse/', DocumentParseView.as_view(), name='document-parse'),
    path('documents/<int:pk>/index/', DocumentIndexView.as_view(), name='document-index'),
    path('chatbot/', ChatBotView.as_view(), name='admin-chatbot'),
    path('chat/history/<str:conversation_id>/', ChatHistoryView.as_view(), name='admin-chat-history'),
]

