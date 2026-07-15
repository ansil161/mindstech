from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404

from ..models import Document
from ..serializers import DocumentSerializer
from ..tasks.ai_tasks import parse_document_task, index_document_task


class DocumentListCreateView(APIView):
    """
    Endpoint for Documents.
    GET: List all documents (with optional category filter and search, paginated).
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
    Endpoint for Document details — retrieve, update (full/partial), or delete.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self, pk):
        return get_object_or_404(Document, pk=pk)

    def get(self, request, pk):
        serializer = DocumentSerializer(self.get_object(pk))
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
        self.get_object(pk).delete()
        return Response({"message": "Document deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


class DocumentParseView(APIView):
    """
    Endpoint to trigger async parsing of a document.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        parse_document_task.delay(doc.id)
        return Response({"message": "Document parsing started.", "status": "Processing"}, status=status.HTTP_200_OK)


class DocumentIndexView(APIView):
    """
    Endpoint to trigger async indexing of a document into Qdrant.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        index_document_task.delay(doc.id)
        return Response({"message": "Document indexing started.", "status": "Processing"}, status=status.HTTP_200_OK)
