from rest_framework import serializers
from .models import Batch


class BatchSerializer(serializers.ModelSerializer):
    center_name = serializers.CharField(source="center.center_name", read_only=True)
    course_name = serializers.CharField(source="course.course_name", read_only=True)

    class Meta:
        model = Batch
        fields = (
            "id", "batch_code", "batch_name", "center", "center_name",
            "course", "course_name", "start_date", "end_date", "capacity",
            "status", "created_at", "updated_at",
        )
        read_only_fields = ("id", "batch_code", "created_at", "updated_at")

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        capacity = attrs.get("capacity", getattr(self.instance, "capacity", 30))
        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError({"end_date": "End date must be after start date."})
        if capacity is not None and capacity < 1:
            raise serializers.ValidationError({"capacity": "Capacity must be at least 1."})
        return attrs
