"""
Test script to verify OpenAI API key is loaded correctly
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

print(f"API Key loaded: {'Yes' if api_key else 'No'}")
print(f"API Key length: {len(api_key) if api_key else 0}")
print(f"API Key starts with: {api_key[:10] if api_key else 'N/A'}...")
print(f"Model: {model}")

if api_key:
    print("\nOpenAI API key is configured correctly!")
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        print("OpenAI client initialized successfully!")
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
else:
    print("\nOpenAI API key not found!")
    print("Make sure .env file exists in the backend directory with OPENAI_API_KEY set")

