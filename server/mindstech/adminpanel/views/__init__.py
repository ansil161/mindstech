# Re-export all view classes so that `from .views import ...` in urls.py
# continues to work without any modifications.

from .dashboard import DashboardStatsView
from .enquiries import EnquirySubmitView, EnquiryAdminListView, EnquiryAdminDetailView
from .fieldwork import FieldworkListCreateView, FieldworkDetailView
from .solutions import SolutionListCreateView, SolutionDetailView
from .blogs import BlogListCreateView, BlogDetailView
from .collection_centres import CollectionCentreListCreateView, CollectionCentreDetailView
from .documents import DocumentListCreateView, DocumentDetailView, DocumentParseView, DocumentIndexView
from .chatbot import ChatBotView, ChatHistoryView
from .gallery import GalleryListCreateView, GalleryDetailView
from .events import (
    EventNewsListCreateView, EventNewsDetailView,
    PublicUpcomingEventsView, PublicNewsView,
)
from .region import (
    RegionListCreateView, RegionDetailView,
    RegionContactView, PublicRegionDataView, PublicRegionSolutionBrandsView, PublicRegionListView,
    RegionBrandListCreateView, RegionBrandDetailView,
    TestimonialListCreateView, TestimonialDetailView,
    RegionContactListCreateView, RegionContactDetailView,
)
from .team import TeamMemberListCreateView, TeamMemberDetailView, PublicTeamMembersView

__all__ = [
    "DashboardStatsView",
    "EnquirySubmitView",
    "EnquiryAdminListView",
    "EnquiryAdminDetailView",
    "FieldworkListCreateView",
    "FieldworkDetailView",
    "SolutionListCreateView",
    "SolutionDetailView",
    "BlogListCreateView",
    "BlogDetailView",
    "CollectionCentreListCreateView",
    "CollectionCentreDetailView",
    "DocumentListCreateView",
    "DocumentDetailView",
    "DocumentParseView",
    "DocumentIndexView",
    "ChatBotView",
    "ChatHistoryView",
    "GalleryListCreateView",
    "GalleryDetailView",
    "RegionListCreateView",
    "RegionDetailView",
    "RegionContactView",
    "PublicRegionDataView",
    "PublicRegionListView",
    "PublicRegionSolutionBrandsView",
    "RegionContactListCreateView",
    "RegionContactDetailView",
    "EventNewsListCreateView",
    "EventNewsDetailView",
    "PublicUpcomingEventsView",
    "PublicNewsView",
    "TeamMemberListCreateView",
    "TeamMemberDetailView",
    "PublicTeamMembersView",
]
