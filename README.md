# 🥗 NutriAlly

> **An AI-Native Consumer Health Co-Pilot designed for Encode 2026 Hackathon.**

**NutriAlly** is an intelligent, conversational assistant that bridges the gap between complex food labels and human understanding. It doesn't just look up data; it reasons about food based on your specific health profile, allergies, and goals.

---

## 📖 The Problem
**Track:** Designing AI-Native Consumer Health Experiences

Modern food labels are optimized for regulatory compliance, not human clarity. Consumers are forced to interpret:
* Long, confusing ingredient lists.
* Unfamiliar chemical names.
* Conflicting health guidance.

Existing apps act as "database browsers," requiring high-friction manual input. **NutriAlly** shifts the paradigm from *data lookup* to *intent-driven reasoning*, reducing cognitive load at the exact moment a decision matters.

## 🚀 The Solution
NutriAlly is a **multimodal reasoning engine**. By integrating personalized user profiles with real-time food data, it acts as a true co-pilot.

* **Intent-First:** No complex forms. The AI infers if a food is safe based on your profile (e.g., "Is this safe for my peanut allergy?").
* **Multimodal Intelligence:** Upload a picture of a label or product, and NutriAlly analyzes it using Google Gemini.
* **Reasoning Over Raw Data:** Instead of just dumping stats, it explains *why* a food fits or breaks your diet.
* **Contextual Continuity:** Unlike static search bars, NutriAlly remembers previous turns in the conversation, allowing you to refine meal plans or ask follow-up questions naturally.

## ✨ Key Features

* **🧠 Personalized Health Profiles:** Tailors advice based on allergies (e.g., Peanut), dietary goals (e.g., Muscle Gain), and cultural preferences.
* **🎨 Generative UI:** The AI doesn't just return text; it generates answers in a proper UI format, creating interactive HTML cards (tables, recipe lists, nutrition breakdowns) directly within the chat for better readability.
* **🛡️ Safety & Risk Assessment:** Proactively identifies harmful ingredients based on your profile and suggests safe substitutes (e.g., suggesting almonds instead of peanuts)
* **🌐 Intelligent Web Search:** Beyond standard databases, it can automatically search the web to find information on obscure ingredients, recent health studies, or local food items not found in OpenFoodFacts.
* **🔍 OpenFoodFacts Integration:** Live API lookups to verify standardized ingredients and nutritional values of packaged goods.
* **📸 Multimodal Input:** Powered by **Google Gemini**, capable of analyzing food images and text queries simultaneously.
* **⚡ Lightweight Architecture:** Powered by local SQLite for rapid prototyping and easy deployment.

## 🛠️ Tech Stack

| Component | Technology Used |
| :--- | :--- |
| **Backend** | Python 3, Django |
| **AI Model** | Google Gemini (via `google-genai`) |
| **Orchestration** | LangChain (Tools: OpenFoodFacts, Web Search) |
| **Frontend** | Django Templates, JavaScript, Tailwind CSS |
| **Database** | SQLite (App DB & Memory DB) |

## 📸 Screenshots
A simple example case:
<p align="center">
  <img src="https://github.com/user-attachments/assets/f5b8f335-08b7-47c9-8657-76b9ff378460" alt="NutriAlly AI Chat" width = "1650">
</p>
Answer generated based on saved custom user preferences:<br>
<br><p align="center">
  <img src="https://github.com/user-attachments/assets/96582dfe-b426-4259-a9f8-7417e03e6f44" alt="NutriAlly Preferences" width="400">
</p>

## ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/uncle-droy/NutriAlly2026.git](https://github.com/uncle-droy/NutriAlly2026.git)
    cd NutriAlly2026
    ```

2.  **Create a virtual environment:**
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows use `venv\Scripts\Activate.ps1`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up Environment Variables:**
    You must set the `GEMINI_API_KEY` before running the server. You can do this temporarily in your terminal, or permanently in your system settings.

    **Option A: Temporary (Current Session Only)**
    * **Mac/Linux:**
        ```bash
        export GEMINI_API_KEY=your_actual_api_key_here
        ```
    * **Windows (Command Prompt):**
        ```cmd
        set GEMINI_API_KEY=your_actual_api_key_here
        ```
    * **Windows (PowerShell):**
        ```powershell
        $env:GEMINI_API_KEY="your_actual_api_key_here"
        ```

    **OR**

    **Option B: Permanent (Windows GUI)**
    1.  Press **Windows Key** and search for **"Edit the system environment variables"**.
    2.  Click **"Environment Variables"** (bottom right).
    3.  Under **User variables**, click **"New..."**.
    4.  **Variable name:** `GEMINI_API_KEY`
    5.  **Variable value:** Paste your API key.
    6.  **Important:** Restart your terminal or VS Code/IDE for the change to take effect.

5.  **Run Migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **Start the Server:**
    ```bash
    python manage.py runserver
    ```
## 👥 Team FoodBug

| Name | Role |
| :--- | :--- |
| **Daiwik Roy** | Backend Development |
| **Parth Sharma** | Frontend Development |
| **Ritabbrata** | AI Integration |
| **Harsh Jaiswal** | AI Optimization |

---
*Built with ❤️ from the FoodBug team for Encode 2026*
