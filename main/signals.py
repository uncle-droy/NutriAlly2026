# app/signals.py
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from .models import Profile

@receiver(user_logged_in)
def create_profile(sender, user, request, **kwargs):
    Profile.objects.get_or_create(user=user)
