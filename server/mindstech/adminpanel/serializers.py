from rest_framework import serializers
from django.utils.html import strip_tags
from .models import Enquiry, Fieldwork

class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

    def validate_name(self, value):
        return strip_tags(value).strip()

    def validate_subject(self, value):
        return strip_tags(value).strip()

    def validate_message(self, value):
        return strip_tags(value).strip()

    def validate_phone(self, value):
        cleaned = strip_tags(value).strip()
        if not any(char.isdigit() for char in cleaned):
            raise serializers.ValidationError("Phone number must contain digits.")
        return cleaned


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

