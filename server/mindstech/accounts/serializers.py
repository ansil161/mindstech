from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

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
        fields = ('id', 'email', 'first_name', 'last_name', 'permissions', 'is_staff', 'is_superuser')
        read_only_fields = ('id', 'email', 'permissions', 'is_staff', 'is_superuser')

    def get_permissions(self, obj):
        """
        Returns a list of all permission codenames assigned to the user.
        """
        return list(obj.get_all_permissions())


class AdminUserSerializer(serializers.ModelSerializer):
    """Read shape for listing admin accounts in the admin-management screen."""

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login')
        read_only_fields = fields


def _generate_unique_username(email):
    base = email.split('@')[0][:150] or 'admin'
    candidate = base
    suffix = 1
    while User.objects.filter(username=candidate).exists():
        suffix_str = str(suffix)
        candidate = f'{base[:150 - len(suffix_str) - 1]}-{suffix_str}'
        suffix += 1
    return candidate


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """
    Creates a new admin (is_staff=True) account. is_staff/is_superuser are
    always forced server-side — never taken from client input — so this
    endpoint can never be used to mint another superuser.
    """
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name')

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        username = _generate_unique_username(validated_data['email'])
        return User.objects.create_user(
            username=username,
            password=password,
            is_staff=True,
            is_superuser=False,
            **validated_data,
        )
