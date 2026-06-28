"""
Interview API Routes
Handles interview session management and feedback generation
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
import json
import os

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from services.gemini_service import GeminiService
from utils.audio_analysis import analyze_audio_tone
from utils.filler_words import detect_filler_words
from utils.resume_parser import extract_text_from_pdf

router = APIRouter()

# Load sample questions
QUESTIONS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "sample_questions.json")

with open(QUESTIONS_FILE, "r") as f:
    SAMPLE_QUESTIONS = json.load(f)


class InterviewRequest(BaseModel):
    """Request model for interview feedback"""
    role: str
    question: str
    response: str
    mode: Optional[str] = "friendly"  # friendly, technical, challenging
    audio_data: Optional[str] = None  # Base64 encoded audio (optional)


class InterviewSession(BaseModel):
    """Interview session model"""
    role: str
    questions: List[str]
    responses: List[dict] = []


# In-memory storage for sessions (replace with SQLite in production)
sessions = {}


@router.get("/roles")
async def get_roles():
    """Get available interview roles"""
    return {"roles": list(SAMPLE_QUESTIONS.keys())}


@router.get("/questions/{role}")
async def get_questions(role: str, count: int = 5):
    """
    Get interview questions for a specific role
    Args:
        role: Job role (e.g., 'Software Engineer')
        count: Number of questions to return (default: 5)
    """
    if role not in SAMPLE_QUESTIONS:
        raise HTTPException(status_code=404, detail=f"Role '{role}' not found")
    
    questions = SAMPLE_QUESTIONS[role]
    # Return random questions (for simplicity, return first N)
    # In production, use random.sample()
    selected = questions[:min(count, len(questions))]
    
    return {
        "role": role,
        "questions": selected,
        "total": len(selected)
    }


@router.post("/feedback")
async def get_feedback(request: InterviewRequest):
    """
    Get AI-powered feedback on interview response
    Analyzes clarity, tone, filler words, and provides improvement tips
    """
    try:
        # Detect filler words using regex
        filler_count, filler_words = detect_filler_words(request.response)
        
        # Initialize Gemini service
        gemini_service = GeminiService()
        
        # Get AI feedback
        ai_feedback = await gemini_service.analyze_response(
            question=request.question,
            response=request.response,
            role=request.role,
            mode=request.mode,
            filler_count=filler_count
        )
        
        # Audio analysis (if provided)
        audio_analysis = None
        if request.audio_data:
            try:
                audio_analysis = analyze_audio_tone(request.audio_data)
            except Exception as e:
                print(f"Audio analysis error: {e}")
        
        # Combine feedback
        feedback = {
            "summary": ai_feedback.get("summary", ""),
            "score": ai_feedback.get("score", 5),
            "tone": ai_feedback.get("tone", "neutral"),
            "filler_words_count": filler_count,
            "filler_words": filler_words,
            "improvement_tips": ai_feedback.get("improvement_tips", []),
            "audio_analysis": audio_analysis,
            "clarity": ai_feedback.get("clarity", "moderate"),
            "confidence": ai_feedback.get("confidence", "moderate")
        }
        
        return feedback
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in get_feedback: {error_details}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Error generating feedback: {str(e)}")


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    role: str = Form(...),
    roast_mode: bool = Form(False)
):
    """
    Upload resume, extract text, and optionally roast it or generate questions
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        content = await file.read()
        text = extract_text_from_pdf(content)
        
        gemini_service = GeminiService()
        
        result = {
            "text_preview": text[:500] + "...",
            "roast": None,
            "questions": []
        }
        
        if roast_mode:
            result["roast"] = await gemini_service.roast_resume(text)
            
        # Generate questions based on resume
        result["questions"] = await gemini_service.generate_questions_from_resume(text, role)
        
        return result
        
    except Exception as e:
        print(f"Error processing resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to process resume")


class SessionCreate(BaseModel):
    role: str
    question_count: int = 5
    custom_questions: Optional[List[str]] = None
    strategy: str = "static"  # static, adaptive
    resume_text: Optional[str] = None


@router.post("/session")
async def create_session(data: SessionCreate):
    """Create a new interview session"""
    role = data.role
    
    # Initialize questions list
    questions = []
    
    if data.custom_questions:
        questions = data.custom_questions
    elif data.strategy == "adaptive":
        # For adaptive, we start with one question (optionally from resume)
        if data.resume_text:
            gemini_service = GeminiService()
            # Generate just 1 starter question based on resume
            initial_qs = await gemini_service.generate_questions_from_resume(data.resume_text, role, count=1)
            questions = initial_qs
        else:
            # Generic starter
            questions = [f"Tell me about your experience as a {role}."]
    elif role in SAMPLE_QUESTIONS:
        questions = SAMPLE_QUESTIONS[role][:min(data.question_count, len(SAMPLE_QUESTIONS[role]))]
    else:
        # Fallback for unknown roles
        questions = [
            f"Tell me about your experience as a {role}",
            "What are your greatest strengths?",
            "Describe a challenge you faced in a previous role",
            "Where do you see yourself in 5 years?",
            "Do you have any questions for us?"
        ]
    
    import uuid
    session_id = str(uuid.uuid4())
    
    sessions[session_id] = {
        "role": role,
        "questions": questions,
        "responses": [],
        "current_question": 0,
        "strategy": data.strategy,
        "resume_text": data.resume_text,
        "target_questions": data.question_count
    }
    
    return {
        "session_id": session_id,
        "role": role,
        "questions": questions,
        "total_questions": len(questions) if data.strategy == "static" else data.question_count,
        "strategy": data.strategy
    }


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get interview session details"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return sessions[session_id]


class ResponseSubmission(BaseModel):
    """Model for submitting interview response"""
    question: str
    response: str
    mode: Optional[str] = "friendly"


@router.post("/session/{session_id}/response")
async def add_response(session_id: str, submission: ResponseSubmission):
    """Add a response to the interview session"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    # Get feedback for this response
    feedback_request = InterviewRequest(
        role=session["role"],
        question=submission.question,
        response=submission.response,
        mode=submission.mode
    )
    
    feedback = await get_feedback(feedback_request)
    
    # Add response to session
    session["responses"].append({
        "question": submission.question,
        "response": submission.response,
        "feedback": feedback
    })
    
    next_question = None
    is_completed = False
    
    # Handle Adaptive Strategy
    if session.get("strategy") == "adaptive":
        # Check if we reached target
        if len(session["responses"]) < session.get("target_questions", 5):
            # Generate next question
            gemini_service = GeminiService()
            next_q = await gemini_service.generate_next_question(
                history=session["responses"],
                last_response=submission.response,
                role=session["role"],
                resume_text=session.get("resume_text")
            )
            session["questions"].append(next_q)
            next_question = next_q
        else:
            is_completed = True
    else:
        # Static strategy
        if session["current_question"] + 1 >= len(session["questions"]):
            is_completed = True
    
    session["current_question"] += 1
    
    return {
        "session_id": session_id,
        "current_question": session["current_question"],
        "total_questions": len(session["questions"]),
        "feedback": feedback,
        "next_question": next_question,
        "is_completed": is_completed
    }


@router.get("/session/{session_id}/report")
async def get_report(session_id: str):
    """Get final interview report"""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    
    if not session["responses"]:
        raise HTTPException(status_code=400, detail="No responses found in session")
    
    # Calculate overall statistics
    scores = [r["feedback"]["score"] for r in session["responses"]]
    total_filler_words = sum(r["feedback"]["filler_words_count"] for r in session["responses"])
    
    avg_score = sum(scores) / len(scores) if scores else 0
    
    # Determine overall tone
    tones = [r["feedback"]["tone"] for r in session["responses"]]
    most_common_tone = max(set(tones), key=tones.count) if tones else "neutral"
    
    # Generate overall improvement tips
    all_tips = []
    for r in session["responses"]:
        all_tips.extend(r["feedback"]["improvement_tips"])
    
    # Remove duplicates while preserving order
    unique_tips = list(dict.fromkeys(all_tips))
    
    report = {
        "session_id": session_id,
        "role": session["role"],
        "total_questions": len(session["questions"]),
        "answered_questions": len(session["responses"]),
        "average_score": round(avg_score, 2),
        "overall_tone": most_common_tone,
        "total_filler_words": total_filler_words,
        "responses": session["responses"],
        "improvement_tips": unique_tips[:5],  # Top 5 unique tips
        "score_breakdown": {
            "min": min(scores) if scores else 0,
            "max": max(scores) if scores else 0,
            "average": round(avg_score, 2)
        }
    }
    
    return report

