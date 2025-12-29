from django.contrib.auth.models import User
from django.db import models

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    height = models.FloatField(null=True, blank=True)  # in centimeters
    weight = models.FloatField(null=True, blank=True)  # in kilograms
    fav = models.JSONField(default=list, blank=True)
    allergies = models.JSONField(default=list, blank=True)
    dietary_preferences = models.JSONField(default=list, blank=True)
    activity_level = models.CharField(max_length=50, blank=True)
    goals = models.TextField(blank=True)