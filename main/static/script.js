// Page load fade-in
window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
});

// Dark mode toggle functionality (enhanced to actually work)
(function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;

    // Check localStorage for saved preference
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(darkModeToggle, true);
    }

    darkModeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('darkMode', isDarkMode);
        updateDarkModeIcon(darkModeToggle, isDarkMode);
    });

    function updateDarkModeIcon(toggle, isDark) {
        if (isDark) {
            toggle.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            `;
        } else {
            toggle.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            `;
        }
    }
})();

// Add animation on scroll (only if those sections exist)
const featureCards = document.querySelectorAll('.feature-card');
const statItems = document.querySelectorAll('.stat-item');

if (featureCards.length || statItems.length) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    statItems.forEach(stat => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(20px)';
        stat.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(stat);
    });
}

// Help button functionality
const helpButton = document.querySelector('.help-button');
if (helpButton) {
    helpButton.addEventListener('click', () => {
        alert('Need help? Contact our support team for assistance with using the food intelligence features.');
    });
}

// Simple page transition for links with class "page-link"
document.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        document.body.classList.remove('page-loaded');
        setTimeout(() => {
            window.location.href = href;
        }, 350);
    });
});

// ---------------- Questionnaire Wizard Logic ----------------
(function setupWizard() {
    const steps = document.querySelectorAll('.wizard-step');
    if (!steps.length) return; // not on questionnaire page

    let currentStep = 1;
    const totalSteps = steps.length;

    const stepNumberEl = document.getElementById('wizard-step-number');
    const progressBar = document.getElementById('wizard-progress-bar');
    const nextBtn = document.getElementById('wizard-next');
    const nextLabel = document.getElementById('wizard-next-label');
    const backBtn = document.getElementById('wizard-back');

    function updateStep() {
        steps.forEach(step => {
            const stepIndex = Number(step.getAttribute('data-step'));
            step.classList.toggle('wizard-step-active', stepIndex === currentStep);
        });

        if (stepNumberEl) stepNumberEl.textContent = String(currentStep);

        if (progressBar) {
            const pct = (currentStep - 0.5) / totalSteps * 100;
            progressBar.style.width = `${pct}%`;
        }

        if (currentStep === totalSteps) {
            nextLabel.textContent = 'Complete Setup';
            nextBtn.classList.add('wizard-complete');
        } else {
            nextLabel.textContent = 'Next';
            nextBtn.classList.remove('wizard-complete');
        }

        // Enable/disable Next based on selection (for step 1 and 2)
        let enableNext = true;
        if (currentStep === 1) {
            enableNext = !!document.querySelector('input[name="consumer_type"]:checked');
        } else if (currentStep === 2) {
            enableNext = !!document.querySelector('input[name="fitness_goal"]:checked');
        }

        if (enableNext) {
            nextBtn.classList.add('wizard-next-active');
        } else {
            nextBtn.classList.remove('wizard-next-active');
        }

        backBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }

    // Watch for radio changes to enable Next
    ['consumer_type', 'fitness_goal'].forEach(name => {
        document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
            input.addEventListener('change', updateStep);
        });
    });

    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            // guard against moving on without selection
            if (currentStep === 1 && !document.querySelector('input[name="consumer_type"]:checked')) return;
            if (currentStep === 2 && !document.querySelector('input[name="fitness_goal"]:checked')) return;

            currentStep += 1;
            updateStep();
        } else {
            // Final step completed – save data and redirect to dashboard
            const allergies = document.getElementById('allergies')?.value || '';
            const consumerType = document.querySelector('input[name="consumer_type"]:checked')?.value || '';
            const fitnessGoal = document.querySelector('input[name="fitness_goal"]:checked')?.value || '';
            
            // Save to localStorage for profile display
            localStorage.setItem('consumerType', consumerType);
            localStorage.setItem('fitnessGoal', fitnessGoal);
            localStorage.setItem('allergies', allergies);
            
            // In a real app, you would send this data to the server here
            console.log('Setup data:', { consumerType, fitnessGoal, allergies });
            
            // Redirect to dashboard after a brief delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        }
    });

    backBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep -= 1;
            updateStep();
        }
    });

    updateStep();
})();

// ---------------- Registration -> Questionnaire redirect ----------------
(function setupRegistrationRedirect() {
    const registerForm = document.querySelector('form.login-form');
    if (!registerForm) return;

    const registerButton = registerForm.querySelector('.btn');
    if (!registerButton || registerButton.textContent.trim() !== 'Register') return;

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real app, you would send the data to the server here.
        // For now, after "Register" we take the user to the Food Scanner Setup questionnaire.
        window.location.href = 'questionnaire.html';
    });
})();

// ---------------- Dashboard Functionality ----------------
(function setupDashboard() {
    // Profile Sidebar
    const profileButton = document.getElementById('profileButton');
    const profileSidebar = document.getElementById('profileSidebar');
    const profileOverlay = document.getElementById('profileOverlay');
    const profileCloseBtn = document.getElementById('profileCloseBtn');

    function openProfileSidebar() {
        if (profileSidebar && profileOverlay) {
            profileSidebar.classList.add('active');
            profileOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    function closeProfileSidebar() {
        if (profileSidebar && profileOverlay) {
            profileSidebar.classList.remove('active');
            profileOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    // Open sidebar when profile button is clicked
    if (profileButton) {
        profileButton.addEventListener('click', openProfileSidebar);
    }

    // Close sidebar when close button is clicked
    if (profileCloseBtn) {
        profileCloseBtn.addEventListener('click', closeProfileSidebar);
    }

    // Close sidebar when overlay is clicked
    if (profileOverlay) {
        profileOverlay.addEventListener('click', closeProfileSidebar);
    }

    // Load profile data from localStorage (set during questionnaire)
    function loadProfileData() {
        const consumerType = localStorage.getItem('consumerType') || 'Non-Vegetarian';
        const fitnessGoal = localStorage.getItem('fitnessGoal') || 'Maintaining Overall Body';
        const allergies = localStorage.getItem('allergies') || 'onions';
        const favouriteFoods = localStorage.getItem('favouriteFoods') || '';

        const dietEl = document.getElementById('profileDiet');
        const goalEl = document.getElementById('profileGoal');
        const allergiesEl = document.getElementById('profileAllergies');

        if (dietEl) dietEl.textContent = consumerType;
        if (goalEl) goalEl.textContent = fitnessGoal;
        if (allergiesEl) allergiesEl.textContent = allergies;

        // Load into preferences form
        const prefDiet = document.getElementById('prefDiet');
        const prefGoal = document.getElementById('prefGoal');
        const prefAllergies = document.getElementById('prefAllergies');
        const prefFavouriteFoods = document.getElementById('prefFavouriteFoods');

        if (prefDiet) prefDiet.value = consumerType;
        if (prefGoal) prefGoal.value = fitnessGoal;
        if (prefAllergies) prefAllergies.value = allergies;
        if (prefFavouriteFoods) prefFavouriteFoods.value = favouriteFoods;
    }

    loadProfileData();

    // Fullscreen Windows Navigation
    const trackerWindow = document.getElementById('trackerWindow');
    const preferencesWindow = document.getElementById('preferencesWindow');
    const aiAssistantWindow = document.getElementById('aiAssistantWindow');
    const scanWindow = document.getElementById('scanWindow');
    const menuItems = document.querySelectorAll('.profile-menu-item[data-view]');
    const closeButtons = document.querySelectorAll('.fullscreen-close-btn');

    function openFullscreenWindow(windowName) {
        // Close sidebar first
        closeProfileSidebar();
        
        // Hide all windows
        if (trackerWindow) trackerWindow.classList.remove('active');
        if (preferencesWindow) preferencesWindow.classList.remove('active');
        if (aiAssistantWindow) aiAssistantWindow.classList.remove('active');
        if (scanWindow) scanWindow.classList.remove('active');
        
        // Show selected window
        if (windowName === 'tracker' && trackerWindow) {
            trackerWindow.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else if (windowName === 'preferences' && preferencesWindow) {
            preferencesWindow.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else if (windowName === 'aiAssistant' && aiAssistantWindow) {
            aiAssistantWindow.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else if (windowName === 'scan' && scanWindow) {
            scanWindow.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeFullscreenWindow(windowName) {
        if (windowName === 'tracker' && trackerWindow) {
            trackerWindow.classList.remove('active');
        } else if (windowName === 'preferences' && preferencesWindow) {
            preferencesWindow.classList.remove('active');
        } else if (windowName === 'aiAssistant' && aiAssistantWindow) {
            aiAssistantWindow.classList.remove('active');
        } else if (windowName === 'scan' && scanWindow) {
            scanWindow.classList.remove('active');
        }
        document.body.style.overflow = '';
    }

    function closeAllFullscreenWindows() {
        closeFullscreenWindow('tracker');
        closeFullscreenWindow('preferences');
        closeFullscreenWindow('aiAssistant');
        closeFullscreenWindow('scan');
    }

    // Menu item clicks - open fullscreen windows
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            if (view === 'scan' || view === 'tracker' || view === 'preferences' || view === 'aiAssistant') {
                openFullscreenWindow(view);
            }
        });
    });

    // Close button clicks
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const windowName = btn.getAttribute('data-close');
            closeFullscreenWindow(windowName);
        });
    });

    // Close windows when clicking outside (on overlay)
    [trackerWindow, preferencesWindow, aiAssistantWindow, scanWindow].forEach(window => {
        if (window) {
            window.addEventListener('click', (e) => {
                if (e.target === window) {
                    window.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    });

    // Save Preferences
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', () => {
            const diet = document.getElementById('prefDiet')?.value || '';
            const goal = document.getElementById('prefGoal')?.value || '';
            const allergies = document.getElementById('prefAllergies')?.value || '';
            const favouriteFoods = document.getElementById('prefFavouriteFoods')?.value || '';

            // Save to localStorage
            localStorage.setItem('consumerType', diet);
            localStorage.setItem('fitnessGoal', goal);
            localStorage.setItem('allergies', allergies);
            localStorage.setItem('favouriteFoods', favouriteFoods);

            // Update profile summary
            loadProfileData();

            // Show success message
            alert('Preferences saved successfully!');
        });
    }

    // AI Assistant
    const aiInput = document.getElementById('aiInput');
    const aiSendBtn = document.getElementById('aiSendBtn');
    const aiChat = document.getElementById('aiChat');
    const aiSuggestions = document.querySelectorAll('.ai-suggestion-card');

    function addAIMessage(text, isUser) {
        if (!aiChat) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${isUser ? 'user-message' : 'assistant-message'}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;
        
        messageDiv.appendChild(bubble);
        aiChat.appendChild(messageDiv);
        aiChat.scrollTop = aiChat.scrollHeight;
    }

    function sendAIMessage(message) {
        if (!message.trim()) return;

        addAIMessage(message, true);
        aiInput.value = '';

        // Simulate AI response (in a real app, this would call an API)
        setTimeout(() => {
            const responses = {
                'suggest-meal-plan': 'Based on your preferences, here\'s a personalized meal plan:\n\nBreakfast: Oatmeal with berries and nuts\nLunch: Grilled chicken salad with mixed vegetables\nDinner: Baked salmon with quinoa and steamed broccoli\n\nThis plan provides balanced nutrition while respecting your dietary preferences.',
                'analyze-diet': 'Based on your recent scans, your diet shows:\n\n✅ Good protein intake\n✅ Adequate fiber\n⚠️ Consider adding more leafy greens\n\nYour weekly calorie average is 2,100 calories, which aligns well with your fitness goals.',
                'explain-nutrition': 'Nutrition facts help you understand:\n\n• Calories: Energy your body uses\n• Protein: Builds and repairs muscles\n• Carbs: Primary energy source\n• Fats: Essential for hormone production\n• Vitamins & Minerals: Support body functions\n\nAlways read labels to make informed choices!'
            };

            let response = 'I\'m here to help with nutrition questions, meal suggestions, and dietary analysis. How can I assist you today?';
            
            if (message.toLowerCase().includes('meal') || message.toLowerCase().includes('recipe')) {
                response = 'Here\'s a healthy recipe suggestion: Grilled Chicken with Roasted Vegetables. Ingredients: chicken breast, bell peppers, zucchini, olive oil, herbs. Instructions: Season chicken, grill for 6-8 mins per side, roast vegetables at 400°F for 20 mins.';
            } else if (message.toLowerCase().includes('analyze') || message.toLowerCase().includes('diet')) {
                response = 'Based on your recent scans, your diet shows good protein intake and adequate fiber. Consider adding more leafy greens. Your weekly calorie average aligns well with your fitness goals.';
            }

            addAIMessage(response, false);
        }, 1000);
    }

    // AI input send
    if (aiSendBtn && aiInput) {
        aiSendBtn.addEventListener('click', () => {
            sendAIMessage(aiInput.value);
        });

        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendAIMessage(aiInput.value);
            }
        });
    }

    // AI suggestion cards
    aiSuggestions.forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            const prompts = {
                'suggest-meal-plan': 'Can you suggest a personalized meal plan for me?',
                'analyze-diet': 'Can you analyze my current diet?',
                'explain-nutrition': 'Can you explain nutrition facts to me?'
            };
            if (prompts[prompt] && aiInput) {
                aiInput.value = prompts[prompt];
                sendAIMessage(prompts[prompt]);
            }
        });
    });

    // Upload Area
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const useCameraBtn = document.getElementById('useCameraBtn');
    const uploadImageBtn = document.getElementById('uploadImageBtn');

    if (uploadArea && fileInput) {
        // Click on upload area
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });
    }

    // Camera button
    if (useCameraBtn) {
        useCameraBtn.addEventListener('click', () => {
            // Check if browser supports camera
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // In a real app, you would open camera here
                alert('Camera feature coming soon! For now, please use "Upload Image" button.');
            } else {
                alert('Camera not supported in this browser. Please use "Upload Image" instead.');
            }
        });
    }

    // Upload button
    if (uploadImageBtn && fileInput) {
        uploadImageBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // Fullscreen Scan Window Upload Functionality
    const uploadAreaFullscreen = document.getElementById('uploadAreaFullscreen');
    const fileInputFullscreen = document.getElementById('fileInputFullscreen');
    const useCameraBtnFullscreen = document.getElementById('useCameraBtnFullscreen');
    const uploadImageBtnFullscreen = document.getElementById('uploadImageBtnFullscreen');

    if (uploadAreaFullscreen && fileInputFullscreen) {
        uploadAreaFullscreen.addEventListener('click', () => {
            fileInputFullscreen.click();
        });

        uploadAreaFullscreen.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadAreaFullscreen.classList.add('dragover');
        });

        uploadAreaFullscreen.addEventListener('dragleave', () => {
            uploadAreaFullscreen.classList.remove('dragover');
        });

        uploadAreaFullscreen.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadAreaFullscreen.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        fileInputFullscreen.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });
    }

    if (useCameraBtnFullscreen) {
        useCameraBtnFullscreen.addEventListener('click', () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                alert('Camera feature coming soon! For now, please use "Upload Image" button.');
            } else {
                alert('Camera not supported in this browser. Please use "Upload Image" instead.');
            }
        });
    }

    if (uploadImageBtnFullscreen && fileInputFullscreen) {
        uploadImageBtnFullscreen.addEventListener('click', () => {
            fileInputFullscreen.click();
        });
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        // In a real app, you would upload the file to a server here
        // For now, we'll just show a preview
        const reader = new FileReader();
        reader.onload = (e) => {
            // Show preview or process image
            alert('Image uploaded! In a real app, this would be sent to the server for analysis.');
            // You could show a preview here:
            // uploadArea.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; border-radius: 12px;">`;
        };
        reader.readAsDataURL(file);
    }
})();

