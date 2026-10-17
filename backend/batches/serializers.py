from rest_framework import serializers

from .models import Batch


class BatchSerializer(serializers.ModelSerializer):

    class Meta:
        model = Batch

        fields = (
            "id",
            "batch_code",
            "batch_name",
            "center",
            "course",
            "start_date",
            "end_date",
            "capacity",
            "status",
        )