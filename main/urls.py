from django.urls import path
from . import views
app_name = 'main'
urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('', views.main, name='main'),
    path('register/', views.register, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('scan/', views.scan, name='scan'),
    path('progress/', views.progress, name='progress'),
    path('preferences/', views.preferences, name='preferences'),
    path('assistant/', views.assistant, name='assistant'),
    path('questionnaire/', views.questionnaire, name='questionnaire'),
]