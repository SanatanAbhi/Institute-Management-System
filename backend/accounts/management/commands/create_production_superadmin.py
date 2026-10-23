
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Safely initialize the production Super Admin account."

    def handle(self, *args, **options):
        if os.getenv("ENABLE_SUPERADMIN_BOOTSTRAP") != "true":
            raise CommandError(
                "Super Admin bootstrap is not enabled."
            )

        username = os.getenv("BOOTSTRAP_SUPERADMIN_USERNAME")
        password = os.getenv("BOOTSTRAP_SUPERADMIN_PASSWORD")
        email = os.getenv("BOOTSTRAP_SUPERADMIN_EMAIL", "")

        if not username or not password:
            raise CommandError(
                "Required bootstrap environment variables are missing."
            )

        User = get_user_model()

        if User.objects.filter(role="SUPER_ADMIN", is_active=True).exists():
            self.stdout.write(
                self.style.WARNING(
                    "An active Super Admin already exists. No changes made."
                )
            )
            return

        if User.objects.filter(username=username).exists():
            raise CommandError(
                "That username already exists. Choose a different username."
            )

        user = User(
            username=username,
            email=email,
            role="SUPER_ADMIN",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        user.set_password(password)
        user.save()

        self.stdout.write(
            self.style.SUCCESS(
                "Production Super Admin created successfully."
            )
        )
