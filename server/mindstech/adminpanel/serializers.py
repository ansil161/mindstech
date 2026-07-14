from rest_framework import serializers
from django.utils.html import strip_tags
from .models import Enquiry, Fieldwork, Solution, Blog, CollectionCentre, Document

class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = [
            'id', 'name', 'email', 'phone', 'company',
            'subject', 'message', 'source', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']

    def validate_name(self, value):
        value = strip_tags(value).strip()
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value

    def validate_subject(self, value):
        return strip_tags(value).strip()

    def validate_message(self, value):
        value = strip_tags(value).strip()
        if len(value) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters.")
        return value

    def validate_company(self, value):
        return strip_tags(value).strip()

    def validate_phone(self, value):
        cleaned = strip_tags(value).strip()
        if not any(char.isdigit() for char in cleaned):
            raise serializers.ValidationError("Phone number must contain digits.")
        return cleaned

    def validate_source(self, value):
        if value not in dict(Enquiry.SOURCE_CHOICES):
            raise serializers.ValidationError("Invalid source value.")
        return value


class EnquiryStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = ['status']

    def validate_status(self, value):
        if value not in dict(Enquiry.STATUS_CHOICES):
            raise serializers.ValidationError("Invalid status choice.")
        return value


class FieldworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fieldwork
        fields = ['id', 'title', 'location_meta', 'category', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_title(self, value):
        return strip_tags(value).strip()

    def validate_location_meta(self, value):
        return strip_tags(value).strip()

    def validate_category(self, value):
        return strip_tags(value).strip()


class SolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Solution
        fields = ['id', 'title', 'desc', 'slug', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_title(self, value):
        return strip_tags(value).strip()

    def validate_desc(self, value):
        return strip_tags(value).strip()

    def validate_slug(self, value):
        return strip_tags(value).strip()


class BlogSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    dateStr = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = ['id', 'title', 'desc', 'href', 'cat', 'publish_date', 'date', 'dateStr', 'is_featured', 'created_at']
        read_only_fields = ['id', 'created_at', 'date', 'dateStr']

    def get_date(self, obj):
        return obj.publish_date.strftime("%d %b %Y") if obj.publish_date else ""

    def get_dateStr(self, obj):
        return obj.publish_date.strftime("%Y-%m-%d") if obj.publish_date else ""

    def validate_title(self, value):
        return strip_tags(value).strip()

    def validate_desc(self, value):
        return strip_tags(value).strip()

    def validate_href(self, value):
        return strip_tags(value).strip()

    def validate_cat(self, value):
        return strip_tags(value).strip()


class CollectionCentreSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionCentre
        fields = ['id', 'operator', 'city', 'address', 'contact_name', 'phone', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def _clean(self, value):
        return strip_tags(value).strip()

    validate_operator = _clean
    validate_city = _clean
    validate_address = _clean
    validate_contact_name = _clean

    def validate_phone(self, value):
        value = self._clean(value)
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError('Phone number must contain digits.')
        return value


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'category', 'status', 'extracted_text', 'metadata', 'version', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'extracted_text', 'version', 'created_at', 'updated_at']

    def validate_title(self, value):
        return strip_tags(value).strip()

    def validate_category(self, value):
        return strip_tags(value).strip()
