import uuid, json, time
from django.http import HttpResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Profile
from main.ai import get_ai_response  # Import the ai module,
from django.http import StreamingHttpResponse

def login_view(request):
    form = AuthenticationForm(request, data=request.POST or None)
    if request.method == "POST" and form.is_valid():
        login(request, form.get_user())
        return redirect("main:progress")
    return render(request, "login.html", {"form": form})

def main(request):
  return render(request, 'index.html')    

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)   # session created here
            return redirect('main:questionnaire')
    else:
        form = UserCreationForm()
        
    return render(request, 'register.html', {'form': form})

def questionnaire(request):
    if not request.user.is_authenticated:
        return redirect('main:register')
    profile, _ = Profile.objects.get_or_create(user=request.user)
    if request.method == "POST":
        # Process the questionnaire data here
        profile.allergies = request.POST.get("allergies", "")
        profile.dietary_preferences = request.POST.get("dietary_preferences", "")
        profile.extra_information = request.POST.get("extra_info", "")
        profile.goals = request.POST.get("goals", "")
        profile.save()
        return JsonResponse({
            'status': 'success', 
            'message': 'Data saved successfully!',
            'redirect_url': '/preferences/' # Pass the destination here
        })
    return render(request, 'questionnaire.html')

def logout_view(request):
    logout(request)
    return redirect("main:login")

def scan(request):
    return HttpResponse("Scan Page")

# def progress(request):
#     return HttpResponse("Progress Page")

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

        profile.dietary_preferences = request.POST.get("dietary_preferences", "")
        profile.activity_level = request.POST.get("activity_level", "")
        profile.goals = request.POST.get("goals", "")

        profile.save()
        return redirect("main:scan")

    return render(request, "preferences.html", {
        "profile": profile
    })

def assistant(request):
    return render(request, 'assisstant.html')

def process(request):
    user_input = request.POST.get("message", "").strip()
    image_file = request.FILES.get("image")  # Get the uploaded image file, if any
    if not request.session.session_key:
        request.session.create()

    thread_id = request.session.session_key

    if not user_input and not image_file:
        return JsonResponse({"error": "Empty message"}, status=400)

    result = get_ai_response(user_input, thread_id, image_file)
    print("AI TEXT:", result["text"][:200])
    print("AI UI:", result["ui"][:200])

    return JsonResponse({
        "text": result["text"],
        "ui": result["ui"]
    })