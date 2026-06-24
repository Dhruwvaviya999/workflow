"""Workspace + membership serializers."""
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer

from .models import Membership, Workspace


class MembershipSerializer(serializers.ModelSerializer):
    """A member of a workspace, with the nested user profile."""

    user = UserSerializer(read_only=True)

    class Meta:
        model = Membership
        fields = ("id", "user", "role", "created_at")
        read_only_fields = fields


class WorkspaceSerializer(serializers.ModelSerializer):
    """
    Read representation of a workspace, annotated with data the current user
    cares about: their own role and the member count.
    """

    owner = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()
    my_role = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "owner",
            "member_count",
            "my_role",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "owner", "created_at", "updated_at")

    def get_member_count(self, obj):
        return obj.memberships.count()

    def get_my_role(self, obj):
        user = self.context["request"].user
        membership = next(
            (m for m in obj.memberships.all() if m.user_id == user.id), None
        )
        return membership.role if membership else None


class WorkspaceCreateSerializer(serializers.ModelSerializer):
    """Write serializer for creating a workspace (slug + owner are derived)."""

    class Meta:
        model = Workspace
        fields = ("id", "name", "description")
        read_only_fields = ("id",)

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Name cannot be empty.")
        return value
