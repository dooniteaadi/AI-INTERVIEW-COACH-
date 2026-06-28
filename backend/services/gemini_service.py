"""
Google Gemini Service
Handles AI-powered interview feedback analysis using Google's Gemini API
"""

import os
import json
import google.generativeai as genai
from typing import Dict, List
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class GeminiService:
    """
    Service for interacting with Google Gemini API
    """
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("WARNING: GEMINI_API_KEY not found in environment variables!")
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            print("Gemini Service initialized")

    def _get_mode_prompt(self, mode: str) -> str:
        """Get interviewer mode-specific prompt"""
        mode_prompts = {
            "friendly": "Act as Friendly Coach Fiona. Be warm, encouraging, highly supportive, and focus on helping the candidate build confidence.",
            "technical": "Act as Technical Lead Tyler. Focus on technical accuracy, edge cases, system design patterns, clean coding principles, and depth of knowledge.",
            "challenging": "Act as Savage Critic Sam. Point out clichés, weak descriptions, verbal crutches, lack of quantitative results, and be critical of structure.",
            "pressure": "Act as Pressure Tester Paula. Demand extremely concise answers, stress-test their quick thinking, and evaluate how they handle strict constraints."
        }
        return mode_prompts.get(mode, mode_prompts["friendly"])

    def _extract_json_from_text(self, text: str) -> Dict:
        """
        Extract JSON from text response
        """
        # Remove markdown code blocks if present
        text = text.replace("```json", "").replace("```", "").strip()
        
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try to find JSON object in the text
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass
            
            # Fallback
            return {
                "summary": text[:200],
                "score": 5,
                "tone": "neutral",
                "clarity": "moderate",
                "confidence": "moderate",
                "improvement_tips": ["Could not parse detailed feedback"],
                "star_rating": {
                    "situation": "good",
                    "task": "good",
                    "action": "good",
                    "result": "missing"
                },
                "star_feedback": "Ensure you structure your answer using Situation, Task, Action, and Result."
            }

    async def generate_questions_from_resume(self, resume_text: str, role: str, count: int = 5) -> List[str]:
        """
        Generate interview questions based on resume content
        """
        prompt = f"""
        You are an expert technical interviewer.
        I have a candidate applying for a {role} position.
        Here is their resume text:
        
        {resume_text[:4000]}  # Limit text length
        
        Generate {count} challenging and specific interview questions based on their actual experience, skills, and projects listed in the resume.
        Do not ask generic questions like "Tell me about yourself".
        Focus on the technologies and claims made in the resume.
        
        Return ONLY a JSON array of strings, like this:
        ["Question 1", "Question 2", "Question 3"]
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = self._extract_json_from_text(response.text)
            if isinstance(result, list):
                return result
            elif isinstance(result, dict) and "questions" in result:
                return result["questions"]
            else:
                # Fallback
                return [f"Tell me about your experience with {role}"] * count
        except Exception as e:
            print(f"Error generating questions: {e}")
            return [f"Could you describe your background in {role}?"] * count

    async def roast_resume(self, resume_text: str) -> str:
        """
        Roast the resume in a funny but constructive way
        """
        prompt = f"""
        You are a brutal but funny career coach.
        Read this resume and "roast" it. 
        Point out clichés, buzzwords, formatting issues (implied), or weak descriptions.
        Be savage but ultimately helpful.
        Keep it under 200 words.
        
        Resume Text:
        {resume_text[:4000]}
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error roasting resume: {e}")
            return "Your resume is so good I can't even roast it. (Just kidding, I encountered an error)."

    async def analyze_response(
        self,
        question: str,
        response: str,
        role: str,
        mode: str = "friendly",
        filler_count: int = 0
    ) -> Dict:
        """
        Analyze interview response using Gemini
        """
        if not os.getenv("GEMINI_API_KEY"):
            return {
                "summary": "Gemini API key is missing. Please add GEMINI_API_KEY to your .env file.",
                "score": 0,
                "tone": "neutral",
                "clarity": "needs_improvement",
                "confidence": "low",
                "improvement_tips": ["Configure GEMINI_API_KEY in backend/.env"]
            }

        mode_prompt = self._get_mode_prompt(mode)
        
        prompt = f"""
        You are a professional interview coach specializing in {role} positions.
        {mode_prompt}

        Analyze the user's interview response.
        The response contains {filler_count} filler words.

        Question: {question}
        Response: {response}

        Analyze if the response follows the STAR technique:
        - Situation (S): Sets the context.
        - Task (T): Identifies the problem/goal.
        - Action (A): Explains what they did and how.
        - Result (R): Shares quantifiable metrics/outcomes.

        Provide analysis as a JSON object with this exact structure:
        {{
            "summary": "Brief 2-3 sentence summary",
            "score": <number 1-10>,
            "tone": "confident" | "neutral" | "uncertain",
            "clarity": "excellent" | "good" | "moderate" | "needs_improvement",
            "confidence": "high" | "moderate" | "low",
            "improvement_tips": ["tip1", "tip2", "tip3"],
            "star_rating": {{
                "situation": "excellent" | "good" | "missing",
                "task": "excellent" | "good" | "missing",
                "action": "excellent" | "good" | "missing",
                "result": "excellent" | "good" | "missing"
            }},
            "star_feedback": "A short critique focused on their STAR method formatting."
        }}
        """

        try:
            response = self.model.generate_content(prompt)
            return self._extract_json_from_text(response.text)
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return {
                "summary": "Error generating feedback. Please check your API key and quota.",
                "score": 5,
                "tone": "neutral",
                "clarity": "moderate",
                "confidence": "moderate",
                "improvement_tips": ["Try again later"]
            }

    async def generate_next_question(
        self,
        history: List[Dict],
        last_response: str,
        role: str,
        resume_text: str = None
    ) -> str:
        """
        Generate the next interview question based on conversation history
        """
        # Construct context from history
        context = ""
        for item in history[-3:]: # Keep last 3 turns for context
            context += f"Q: {item['question']}\nA: {item['response']}\n\n"
            
        resume_context = f"\nCandidate Resume Context:\n{resume_text[:2000]}\n" if resume_text else ""
        
        prompt = f"""
        You are an expert technical interviewer for a {role} position.
        You are conducting a live interview.
        
        {resume_context}
        
        Recent Conversation History:
        {context}
        
        The candidate just answered: "{last_response}"
        
        Based on their answer and the history, generate the NEXT single follow-up question.
        - If the answer was vague, ask for clarification.
        - If the answer was good, move to a related advanced topic or a new relevant topic.
        - Keep the question concise and professional.
        - Do not repeat previous questions.
        
        Return ONLY the question text.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating next question: {e}")
            return "Could you elaborate more on that?"
