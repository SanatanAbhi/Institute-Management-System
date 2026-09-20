from rest_framework import serializers
from .models import Center

class CenterSerializer(serializers.ModelSerializer):

    def validate(self, attrs):
        request = self.context.get("request")

        print("Context Request: ", request)
        print("Request Method: ", request.method)
        print("Logged in user: ", request.user)
        print("User Type: ", type(request.user))

        return attrs

    class Meta:
        model = Center
        fields = "__all__"