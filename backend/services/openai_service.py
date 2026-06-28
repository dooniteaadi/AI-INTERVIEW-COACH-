"""
Hugging Face Service (replaces OpenAI)
Handles AI-powered interview feedback analysis using Hugging Face Inference API
"""

import os
import json
import requests
from typing import Dict, List
import time
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class OpenAIService:
    """
    Service for interacting with Hugging Face Inference API
    Kept the same class name to maintain compatibility with existing code
    """
    
    def __init__(self):
        api_key = os.getenv("HUGGINGFACE_API_KEY")
        if not api_key:
            raise ValueError("HUGGINGFACE_API_KEY environment variable is not set")
        
        # Clean the API key (remove any whitespace or newlines)
        api_key = api_key.strip()
        self.api_key = api_key
        
        # Get model from environment or use default
        self.model = os.getenv("HUGGINGFACE_MODEL", "mistralai/Mistral-7B-Instruct-v0.2")
        # Use the new router endpoint (replaces deprecated api-inference.huggingface.co)
        # Format: https://router.huggingface.co/hf-inference/models/{model}
        # Alternative format if above doesn't work: https://router.huggingface.co/hf-inference/{model}
        self.api_url = f"https://router.huggingface.co/hf-inference/models/{self.model}"
        print(f"Using API endpoint: {self.api_url}")  # Debug log
        
        print(f"Hugging Face Service initialized with model: {self.model}")  # Debug log
    
    def _get_mode_prompt(self, mode: str) -> str:
        """Get interviewer mode-specific prompt"""
        mode_prompts = {
            "friendly": "Be encouraging and supportive in your feedback.",
            "technical": "Focus on technical accuracy and depth of knowledge.",
            "challenging": "Be more critical and point out areas that need significant improvement."
        }
        return mode_prompts.get(mode, mode_prompts["friendly"])
    
    def _call_huggingface_api(self, prompt: str, max_retries: int = 3) -> str:
        """
        Call Hugging Face Inference API with retry logic
        Uses the new router endpoint: https://router.huggingface.co/hf-inference
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    self.api_url,
                    headers=headers,
                    json=payload,
                    timeout=30
                )
                
                # Handle model loading (503 error)
                if response.status_code == 503:
                    wait_time = response.headers.get("Retry-After", 10)
                    if isinstance(wait_time, str):
                        wait_time = int(wait_time)
                    print(f"Model is loading, waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
                
                # Handle rate limiting (429 error)
                if response.status_code == 429:
                    wait_time = 10 * (attempt + 1)  # Exponential backoff
                    print(f"Rate limited, waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
                
                # Handle other errors
                if response.status_code != 200:
                    error_msg = response.text
                    raise Exception(f"API error {response.status_code}: {error_msg}")
                
                # Parse response
                result = response.json()
                
                # Handle different response formats
                if isinstance(result, list) and len(result) > 0:
                    if "generated_text" in result[0]:
                        return result[0]["generated_text"]
                    elif "summary_text" in result[0]:
                        return result[0]["summary_text"]
                    else:
                        # Try to get text from first element
                        text = result[0].get("text", str(result[0]))
                        return text
                elif isinstance(result, dict):
                    if "generated_text" in result:
                        return result["generated_text"]
                    elif "summary_text" in result:
                        return result["summary_text"]
                    else:
                        return str(result)
                else:
                    return str(result)
                    
            except requests.exceptions.Timeout:
                if attempt < max_retries - 1:
                    print(f"Request timeout, retrying... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(5)
                    continue
                else:
                    raise Exception("Request timeout after multiple attempts")
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    print(f"Request error: {e}, retrying... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(5)
                    continue
                else:
                    raise Exception(f"Request failed: {str(e)}")
        
        raise Exception("Failed to get response after multiple attempts")
    
    def _extract_json_from_text(self, text: str) -> Dict:
        """
        Extract JSON from text response, handling cases where JSON is embedded in text
        """
        # Try to find JSON object in the text
        import re
        
        # Look for JSON object pattern
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # If no JSON found, try parsing the whole text
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # If still not JSON, create a structured response from the text
            return {
                "summary": text[:200] if len(text) > 200 else text,
                "score": 5,
                "tone": "neutral",
                "clarity": "moderate",
                "confidence": "moderate",
                "improvement_tips": [
                    "Practice speaking more clearly",
                    "Reduce filler words",
                    "Be more specific in your answers"
                ]
            }
    
    async def analyze_response(
        self,
        question: str,
        response: str,
        role: str,
        mode: str = "friendly",
        filler_count: int = 0
    ) -> Dict:
        """
        Analyze interview response using Hugging Face Inference API
        Returns feedback on clarity, tone, and provides improvement tips
        """
        mode_prompt = self._get_mode_prompt(mode)
        
        # Create a single prompt for the model
        full_prompt = f"""You are a professional interview coach specializing in {role} positions.
{mode_prompt}

Analyze the user's interview response and provide constructive feedback.
The response contains {filler_count} filler words (um, like, uh, etc.).

Question: {question}

Response: {response}

Provide your analysis as a JSON object with the following structure:
{{
    "summary": "Brief 2-3 sentence summary of the response quality",
    "score": <number between 1-10>,
    "tone": "confident" | "neutral" | "uncertain",
    "clarity": "excellent" | "good" | "moderate" | "needs_improvement",
    "confidence": "high" | "moderate" | "low",
    "improvement_tips": ["tip1", "tip2", "tip3"]
}}

Be specific and actionable in your feedback. Return only valid JSON."""

        try:
            print(f"Calling Hugging Face API with model: {self.model}")  # Debug log
            
            # Call Hugging Face API
            generated_text = self._call_huggingface_api(full_prompt)
            print("Hugging Face API call successful")  # Debug log
            
            # Extract and parse JSON from response
            feedback = self._extract_json_from_text(generated_text)
            
            # Validate and set defaults
            feedback.setdefault("summary", "Response analyzed successfully.")
            feedback.setdefault("score", 5)
            feedback.setdefault("tone", "neutral")
            feedback.setdefault("clarity", "moderate")
            feedback.setdefault("confidence", "moderate")
            feedback.setdefault("improvement_tips", [])
            
            # Ensure score is between 1-10
            if isinstance(feedback.get("score"), (int, float)):
                feedback["score"] = max(1, min(10, int(feedback["score"])))
            else:
                feedback["score"] = 5
            
            # Ensure improvement_tips is a list
            if not isinstance(feedback.get("improvement_tips"), list):
                feedback["improvement_tips"] = [
                    "Practice speaking more clearly",
                    "Reduce filler words"
                ]
            
            return feedback
            
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            # Return default feedback if JSON parsing fails
            return {
                "summary": "Response received. Please try again for detailed feedback.",
                "score": 5,
                "tone": "neutral",
                "clarity": "moderate",
                "confidence": "moderate",
                "improvement_tips": ["Practice speaking more clearly", "Reduce filler words"]
            }
        except Exception as e:
            error_str = str(e)
            print(f"Hugging Face API error: {error_str}")
            
            # Check for specific error types
            if "429" in error_str or "rate_limit" in error_str.lower():
                raise Exception(
                    "Hugging Face API rate limit exceeded. Please wait a moment and try again. "
                    "Free tier has limited requests per hour."
                )
            elif "401" in error_str or "403" in error_str or "invalid" in error_str.lower():
                raise Exception(
                    "Invalid Hugging Face API key. Please check your .env file and ensure "
                    "the HUGGINGFACE_API_KEY is correct. Get your key at: "
                    "https://huggingface.co/settings/tokens"
                )
            elif "503" in error_str or "loading" in error_str.lower():
                raise Exception(
                    "Model is currently loading. Please wait a moment and try again. "
                    "This can happen with free tier models that spin down after inactivity."
                )
            else:
                raise Exception(f"Failed to analyze response: {error_str}")
