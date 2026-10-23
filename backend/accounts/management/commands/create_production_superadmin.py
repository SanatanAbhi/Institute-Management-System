
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create the initial production Super Admin once."

    def handle(self, *args, **options):
        if os.getenv("ENABLE_SUPERADMIN_BOOTSTRAP") != "true":
            raise CommandError("Bootstrap is not enabled.")

        username = os.getenv("BOOTSTRAP_SUPERADMIN_USERNAME")
        password = os.getenv("BOOTSTRAP_SUPERADMIN_PASSWORD")
        email = os.getenv("BOOTSTRAP_SUPERADMIN_EMAIL", "")

        if not username or not password:
            raise CommandError("Bootstrap credentials are missing.")

        User = get_user_model()

        if User.objects.filter(role="SUPER_ADMIN", is_active=True).exists():
            self.stdout.write("An active Super Admin already exists. No changes made.")
            return

        if User.objects.filter(username=username).exists():
            raise CommandError("The requested username already exists.")

        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            role="SUPER_ADMIN",
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Production Super Admin '{user.username}' created."
            )
        )
