from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.throttling import AnonRateThrottle
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Enquiry, Fieldwork, Solution, Blog, CollectionCentre, Document
from .serializers import (
    EnquirySerializer, EnquiryStatusUpdateSerializer, FieldworkSerializer, 
    SolutionSerializer, BlogSerializer, CollectionCentreSerializer, DocumentSerializer
)

class EnquirySubmitView(APIView):
    """
    Public endpoint to submit an inquiry. Rate limited to prevent spam.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        serializer = EnquirySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Enquiry submitted successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EnquiryAdminListView(APIView):
    """
    Protected endpoint for admins to list all inquiries.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        enquiries = Enquiry.objects.all()
        serializer = EnquirySerializer(enquiries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EnquiryAdminDetailView(APIView):
    """
    Protected endpoint for admins to update status or delete an inquiry.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        enquiry = get_object_or_404(Enquiry, pk=pk)
        serializer = EnquiryStatusUpdateSerializer(enquiry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Return full serializer for UI updates
            return Response(EnquirySerializer(enquiry).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        enquiry = get_object_or_404(Enquiry, pk=pk)
        enquiry.delete()
        return Response(
            {"message": "Enquiry deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


class FieldworkListCreateView(APIView):
    """
    Endpoint for Fieldwork projects.
    GET: Publicly accessible list.
    POST: Restricted to staff, supports image uploads.
    """
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get(self, request):
        projects = Fieldwork.objects.all()
        # Pass request in context so image URLs are fully qualified absolute URLs
        serializer = FieldworkSerializer(projects, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = FieldworkSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FieldworkDetailView(APIView):
    """
    Admin-only endpoint to update or delete a fieldwork project.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, pk):
        project = get_object_or_404(Fieldwork, pk=pk)
        # partial=True allows text modifications without requiring re-uploading the image file
        serializer = FieldworkSerializer(project, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = get_object_or_404(Fieldwork, pk=pk)
        # Clean up physical file on disk first
        if project.image:
            project.image.delete(save=False)
        project.delete()
        return Response(
            {"message": "Project deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


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


class BlogListCreateView(APIView):
    """
    Endpoint for Blogs.
    GET: Publicly accessible list.
    POST: Restricted to staff.
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get(self, request):
        blogs = Blog.objects.all()
        serializer = BlogSerializer(blogs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BlogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BlogDetailView(APIView):
    """
    Admin-only endpoint to delete a blog post.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, pk):
        blog = get_object_or_404(Blog, pk=pk)
        blog.delete()
        return Response(
            {"message": "Blog post deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


class CollectionCentreListCreateView(APIView):
    """Public list of active collection centres; staff can create centres."""

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get(self, request):
        centres = CollectionCentre.objects.all() if request.user.is_authenticated and request.user.is_staff else CollectionCentre.objects.filter(is_active=True)
        return Response(CollectionCentreSerializer(centres, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CollectionCentreSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CollectionCentreDetailView(APIView):
    """Staff-only update and delete endpoint for collection centres."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self, pk):
        return get_object_or_404(CollectionCentre, pk=pk)

    def patch(self, request, pk):
        serializer = CollectionCentreSerializer(self.get_object(pk), data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        self.get_object(pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


from .services.ai_client import AIClient, AIClientError
from .tasks.ai_tasks import parse_document_task, index_document_task

class ChatBotView(APIView):
    """
    Public chatbot query endpoint that retrieves context and invokes LLM generation.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        message = request.data.get("message")
        conversation_id = request.data.get("conversation_id", "default")
        category = request.data.get("category")
        tenant_id = request.data.get("tenant_id", "default")

        if not message:
            return Response({"error": "Message parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        ai_client = AIClient()
        try:
            response_data = ai_client.chat_query(
                message=message,
                conversation_id=conversation_id,
                category=category,
                tenant_id=tenant_id
            )
            return Response(response_data, status=status.HTTP_200_OK)
        except AIClientError as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatHistoryView(APIView):
    """
    Public endpoint to retrieve the session's conversational logs.
    """
    permission_classes = [AllowAny]

    def get(self, request, conversation_id):
        ai_client = AIClient()
        try:
            history = ai_client.get_chat_history(conversation_id)
            return Response(history, status=status.HTTP_200_OK)
        except AIClientError as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DocumentListCreateView(APIView):
    """
    Endpoint for Documents.
    GET: List all documents.
    POST: Upload a new document.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        documents = Document.objects.all()
        # Filtering by category
        category = request.query_params.get('category')
        if category:
            documents = documents.filter(category=category)
            
        # Searching by title
        search_query = request.query_params.get('search')
        if search_query:
            documents = documents.filter(title__icontains=search_query)

        # Standard Pagination
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = 15
        paginated_queryset = paginator.paginate_queryset(documents, request, view=self)
        
        serializer = DocumentSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DocumentDetailView(APIView):
    """
    Endpoint for Document details.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self, pk):
        return get_object_or_404(Document, pk=pk)

    def get(self, request, pk):
        instance = self.get_object(pk)
        serializer = DocumentSerializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        instance = self.get_object(pk)
        serializer = DocumentSerializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        instance = self.get_object(pk)
        serializer = DocumentSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        instance = self.get_object(pk)
        instance.delete()
        return Response({"message": "Document deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


class DocumentParseView(APIView):
    """
    Endpoint to trigger parsing of a document.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        parse_document_task.delay(doc.id)
        return Response({"message": "Document parsing started.", "status": "Processing"}, status=status.HTTP_200_OK)


class DocumentIndexView(APIView):
    """
    Endpoint to trigger indexing of a document into Qdrant.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        index_document_task.delay(doc.id)
        return Response({"message": "Document indexing started.", "status": "Processing"}, status=status.HTTP_200_OK)
