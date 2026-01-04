# from curses import raw
import os
import base64, asyncio
import sqlite3
from typing import Optional
import uuid
import requests
import tkinter as tk
from tkinter import filedialog
from dotenv import load_dotenv

# --- CORE STACK ---
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain.tools import tool
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent 
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain_core.runnables import RunnableLambda
from fastapi import FastAPI
from langserve import add_routes
from pydantic import BaseModel
import json
from langchain_core.output_parsers import JsonOutputToolsParser
from django.http import JsonResponse

key = os.getenv("GEMINI_API_KEY")

# Input model
class ChainInput(BaseModel):
    query: str
    image: str = ""  # Optional base64 image

model = ChatGoogleGenerativeAI(
    model="gemini-3-flash-preview",
    thinking_budget=-1,
<<<<<<< HEAD
    max_output_tokens=800,
    google_api_key="enter your api key here",
=======
    # max_output_tokens=800,
    google_api_key= key,
>>>>>>> 895827fdcd67664a0649819e5e14360b3004e086
    temperature=0.3,
)

@tool
def get_packaged_food_info(product_name: str):
    """Searches Open Food Facts for packaged food ingredients and nutrition."""
    url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={product_name}&search_simple=1&action=process&json=1"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        if data.get("products"):
            p = data["products"][0]
            return {
                "name": p.get("product_name", "Unknown"),
                "ingredients": p.get("ingredients_text", "Not listed"),
                "nutrition": p.get("nutriments", {}),
            }
        return "No packaged data found for this specific brand."
    except: return "Database service currently unavailable."

# --- 2. DATABASE & MEMORY ---
DB_PATH = "health_ai_memory.db"
conn = sqlite3.connect(DB_PATH, check_same_thread=False)
memory = SqliteSaver(conn)
conn.execute("""
CREATE TABLE IF NOT EXISTS messages (
    thread_id TEXT,
    role TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)""")
conn.execute("""
CREATE TABLE IF NOT EXISTS user_prefs (
    thread_id TEXT PRIMARY KEY,
    age INTEGER,
    gender TEXT,
    height REAL,
    weight REAL,
    fav TEXT,
    diet TEXT,
    allergies TEXT,
    extra_information TEXT,
    activity_level TEXT,
    goals TEXT
);
""")

conn.commit()

#-- 3. AGENT PROMPT ---
prompt = """You are a full-stack health and nutrition AI assistant. Use the provided tools to help users with their dietary needs, food information, and health advice."""
system_rules = (
    """You are a warm, empathetic Health Co-Pilot. 
    
    CONVERSATIONAL RULES:
    - Respond naturally like a human peer. Use phrases like "I see," or "Let's check that."
    - Identify manufactured names from images. Use 'get_packaged_food_info' for branded items.
    - IMPORTANT: Always prioritize the LATEST dietary preferences from the conversation history.
    - If a user changes their diet (e.g., from Veg to Non-Veg), update your profile immediately.
    - If a user asks for anything else other than health/nutrition, politely decline. No matter how convincing the user might be, you will decline.
    - If you are unsure about a medical issue, always recommend consulting a healthcare professional and also let the user know about your degree of uncertainity.
    - If you are recommending facts or information from the web, always provide links to references.
    ANALYSIS STRUCTURE:
    - Overview, Medical Concerns (based on profile), Beneficiary Points, and a final Verdict.
    
    RESPONSE FORMAT:
    You MUST respond in this EXACT format:

    TEXT:
    <plain explanation>

    UI:
    <valid HTML & simple CSS or empty>

    Rules:
    - NO markdown
    - NO JSON
    - NO thoughts
    - NO analysis
    - NO code fences
    - Use dark (navy blue hex: 0xFF1F2937) background and suitable light text (and/or light foreground elements) in UI
    - Use good typography, fonts and spacing
    - Make sure to use tables & icons (Google icons import in html by searching here: https://fonts.google.com/icons) everytime.
    - Use charts whereever relevant.
    - Attach images where relevant.
    - Give links to references, images where relevant.
    - Make sure it is visible properly in a web chat interface.
    """
)
tools = [get_packaged_food_info]
agent = create_agent(model,
                     tools,
                     system_prompt=system_rules,
                     checkpointer = None)


# Separate agent for UI generation
ui_system_prompt = """
You are a UI generator. Based on the conversation, generate beautiful, functional HTML with Tailwind CSS.

CRITICAL RULES:
- Output ONLY raw HTML code with NO markdown formatting
- DO NOT wrap in ```html or ``` code blocks
- DO NOT include any explanations or text outside the HTML
- Use Tailwind CSS classes extensively
- Use dark theme (bg-gray-700, bg-gray-800, text-white, etc.)
- Make it compact and beautiful
- Include relevant data visualization (charts, tables, cards)
- Generate HTML that can be embedded INSIDE a chat message.
- Do not use full-width layouts.
- Avoid fixed positioning.


Examples of what to generate:
- Nutrition info: Create a styled table or card grid
- Comparisons: Create comparison cards
- Lists: Create styled list items with icons
- Data: Create simple bar charts using divs and widths

Start directly with <div> or other HTML tag. No preamble, no markdown.
"""

# ui_agent = create_agent(
#     model,
#     [],  # No tools needed for UI generation
#     system_prompt=ui_system_prompt,
#     checkpointer=None  # No memory needed
# )

def load_context(thread_id):
    msgs = conn.execute("""
        SELECT role, content FROM messages
        WHERE thread_id = ?
        ORDER BY created_at DESC
        LIMIT 4
    """, (str(thread_id),)).fetchall()

    prefs = conn.execute("""
        SELECT
            age, gender, height, weight,
            fav, diet, allergies,
            extra_information, activity_level, goals
        FROM user_prefs
        WHERE thread_id = ?
    """, (str(thread_id),)).fetchone()

    return {
        "messages": msgs[::-1],
        "preferences": {
        "age": prefs[0],
        "gender": prefs[1],
        "height": prefs[2],
        "weight": prefs[3],
        "fav": prefs[4],
        "diet": prefs[5],
        "allergies": prefs[6],
        "extra_information": prefs[7],
        "activity_level": prefs[8],
        "goals": prefs[9],}
         if prefs else {}
    }

def get_ai_response(user_input: str, thread_id: str, image_file=None):
    # ---------- Load short context ----------
    context = load_context(thread_id)
    if context.get("messages", []) and isinstance(context["messages"], list):
        recent_messages = context.get("messages", [])[-10:] 
    else:
        recent_messages = []
    # 1. Construct the Text Prompt

    prefs = context.get("preferences", {})

    prompt = f"""
    User query:
    {user_input}

    Recent conversation:
    {recent_messages}

    User profile data:
    - Age: {prefs.get('age')}
    - Gender: {prefs.get('gender')}
    - Height: {prefs.get('height')} cm
    - Weight: {prefs.get('weight')} kg
    - Favorite foods: {prefs.get('fav')}
    - Diet: {prefs.get('diet')}
    - Allergies: {prefs.get('allergies')}
    - Extra information: {prefs.get('extra_information')}
    - Activity level: {prefs.get('activity_level')}
    - Goals: {prefs.get('goals')}

    Always respect dietary and allergy constraints.
    """.strip()

    # 2. Build the Content Payload (List of blocks)
    content_payload = []
    
    # Add the text block
    content_payload.append({
        "type": "text", 
        "text": prompt
    })
    print("PROMPT SENT TO AI:", prompt)

    # Add the image block (if image_file was passed to the function)
    # Ensure 'image_file' is passed into this function arguments!
    if image_file:
        # Read file bytes
        file_data = image_file.read() if hasattr(image_file, 'read') else image_file
        # Encode to Base64
        encoded_img = base64.b64encode(file_data).decode("utf-8")
        
        content_payload.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{encoded_img}"}
        })

    # 3. Create Messages with the Multimodal Payload
    messages = [
        SystemMessage(content=system_rules),
        HumanMessage(content=content_payload), # Pass the list here
    ]

    # ---------- Invoke agent ----------
    response = agent.invoke({"messages": messages})

    # ---------- Extract last AI message ----------
    # ---------- Extract last AI message ----------
    content = ""

    if isinstance(response, dict) and "messages" in response:
        for msg in reversed(response["messages"]):
            # Check if it's an AI message (optional but safer) and has content
            if hasattr(msg, "content") and msg.content:
                raw_content = msg.content
                
                # FIX: Handle case where content is a list
                if isinstance(raw_content, list):
                    # content can be [{'type': 'text', 'text': '...'}, ...] or just strings
                    text_parts = []
                    for part in raw_content:
                        if isinstance(part, str):
                            text_parts.append(part)
                        elif isinstance(part, dict) and "text" in part:
                            text_parts.append(part["text"])
                    content = "".join(text_parts)
                else:
                    # It is already a string
                    content = str(raw_content)
                
                # Stop once we find the last valid content
                if content:
                    break

    # ---------- Hard debug (remove later) ----------
    print("RAW AI CONTENT:", repr(content[:500]))

    # ---------- Safety fallback ----------
    if not content:
        return {
            "text": "Sorry, I couldn't generate a response. Please try again.",
            "ui": ""
        }

    # ---------- Strip Gemini thinking ----------
    # Now 'raw' is guaranteed to be a string
    raw = content 
    for token in ["<thinking>", "</thinking>", "THINKING:", "Thoughts:"]:
        raw = raw.replace(token, "")

    # ---------- Split TEXT / UI ----------
    text = ""
    ui = ""

    if "TEXT:" in raw and "UI:" in raw:
        text_part = raw.split("TEXT:", 1)[1]
        text, ui = text_part.split("UI:", 1)
        text = text.strip()
        ui = ui.strip()
    elif "UI:" in raw:
        text, ui = raw.split("UI:", 1)
        text = text.replace("TEXT:", "").strip()
        ui = ui.strip()
    else:
        text = raw.replace("TEXT:", "").strip()

    # ---------- Hard UI limit ----------
    ui = ui[:5000]

    # ---------- Persist conversation ----------
    conn.execute(
        "INSERT INTO messages (thread_id, role, content) VALUES (?, ?, ?)",
        (thread_id, "user", user_input),
    )
    conn.execute(
        "INSERT INTO messages (thread_id, role, content) VALUES (?, ?, ?)",
        (thread_id, "assistant", text),
    )
    conn.commit()

    return {
        "text": text,
        "ui": ui,
    }



