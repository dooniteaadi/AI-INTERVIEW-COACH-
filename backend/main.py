"""
AI Interview Coach - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
import os
from pathlib import Path

# Load environment variables from .env file in backend directory
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# Verify API key is loaded
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY not found in environment variables!")
    print(f"   Looking for .env file at: {env_path}")
    print(f"   .env file exists: {env_path.exists()}")
else:
    print(f"Gemini API key loaded")

from routes import interview

app = FastAPI(
    title="AI Interview Coach API",
    description="Backend API for AI-powered interview practice",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(interview.router, prefix="/api", tags=["interview"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AI Interview Coach API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

