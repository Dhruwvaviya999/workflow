"""Serializers for registration, the current-user profile, and JWT login."""
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Public-facing user/profile shape returned to the frontend."""

    class Meta:
        model = User
        fields = ("id", "email", "full_name", "is_staff", "created_at")
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """Validates and creates a new user. Password is write-only + validated."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        validators=[validate_password],
    )

    class Meta:
        model = User
        fields = ("id", "email", "full_name", "password")
        read_only_fields = ("id",)

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Login serializer that also returns the user object alongside the tokens,
    so the frontend gets everything it needs in a single round-trip.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Embed a couple of harmless claims for convenience.
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
