from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import UserSerializer


User = get_user_model()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def technicians_list(request):
    role = getattr(getattr(request.user, "profile", None), "role", None)

    if role not in ["ADMIN", "MANAGER"]:
        return Response(
            {"detail": "Only admin and manager users can view technicians."},
            status=status.HTTP_403_FORBIDDEN,
        )

    technicians = User.objects.filter(profile__role="TECHNICIAN")
    serializer = UserSerializer(technicians, many=True)
    return Response(serializer.data)