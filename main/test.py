# Simple test to prove the Key is fine, but your History is too big
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview",
                             google_api_key="your_api_key_here",)
response = llm.invoke("Hi, are you working?")
print(response.content)