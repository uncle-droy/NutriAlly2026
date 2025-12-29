from django.http import HttpResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Profile

def login_view(request):
    form = AuthenticationForm(request, data=request.POST or None)
    if request.method == "POST" and form.is_valid():
        login(request, form.get_user())
        return redirect("main:progress")
    return render(request, "login.html", {"form": form})

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}!')
            return redirect('main:login')
    else:
        form = UserCreationForm()
    return render(request, 'register.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect("main:login")

def scan(request):
    return HttpResponse("Scan Page")

def progress(request):
    return HttpResponse("Progress Page")

@login_required
def preferences(request):
    profile = Profile.objects.get(user=request.user)

    if request.method == "POST":
        profile.name = request.POST.get("name", "")
        profile.age = request.POST.get("age") or None
        profile.gender = request.POST.get("gender", "")

        profile.height = request.POST.get("height") or None
        profile.weight = request.POST.get("weight") or None

        profile.fav = request.POST.get("fav", "")
        profile.allergies = request.POST.get("allergies", "")

        profile.dietary_preferences = request.POST.getlist("dietary_preferences")
        profile.activity_level = request.POST.get("activity_level", "")
        profile.goals = request.POST.get("goals", "")

        profile.save()
        return redirect("main:scan")

    return render(request, "preferences.html", {
        "profile": profile
    })
       

def assistant(request):
    return HttpResponse("Assistant Page")