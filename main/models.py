from django.contrib.auth.models import User
from django.db import models

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    height = models.FloatField(null=True, blank=True)  # in centimeters
    weight = models.FloatField(null=True, blank=True)  # in kilograms
    fav = models.CharField(max_length=200, blank=True)
    allergies = models.CharField(max_length=200, blank=True)
    dietary_preferences = models.JSONField(default=list, blank=True)
    activity_level = models.CharField(max_length=50, blank=True)
    goals = models.TextField(blank=True)

    def __str__(self):

        return f"{self.user.username} Name: {self.name}"
