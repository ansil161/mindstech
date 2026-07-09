from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
        error_messages={
            'required': 'Email is required.',
            'invalid': 'Please enter a valid email address.'
        }
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        error_messages={
            'required': 'Password is required.'
        }
    )


class UserProfileSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'permissions', 'is_staff')
        read_only_fields = ('id', 'email', 'permissions', 'is_staff')

    def get_permissions(self, obj):
        """
        Returns a list of all permission codenames assigned to the user.
        """
        return list(obj.get_all_permissions())
