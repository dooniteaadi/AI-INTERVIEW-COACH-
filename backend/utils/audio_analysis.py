"""
Audio Analysis Utility
Analyzes audio for tone, confidence, and speech patterns
Note: Requires librosa for advanced analysis (optional dependency)
"""

import base64
import io
from typing import Dict, Optional

try:
    import librosa
    import numpy as np
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False
    print("Warning: librosa not available. Audio analysis will be limited.")


def analyze_audio_tone(audio_data: str) -> Dict:
    """
    Analyze audio data for tone and confidence indicators
    Args:
        audio_data: Base64 encoded audio data
    Returns:
        Dictionary with tone analysis results
    """
    if not LIBROSA_AVAILABLE:
        return {
            "tone_estimate": "neutral",
            "confidence_estimate": "moderate",
            "note": "Advanced audio analysis requires librosa library"
        }
    
    try:
        # Decode base64 audio
        audio_bytes = base64.b64decode(audio_data)
        audio_io = io.BytesIO(audio_bytes)
        
        # Load audio with librosa
        y, sr = librosa.load(audio_io, sr=None)
        
        # Calculate features
        # Pitch (fundamental frequency)
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch_values = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:
                pitch_values.append(pitch)
        
        # Volume (RMS energy)
        rms = librosa.feature.rms(y=y)[0]
        avg_volume = np.mean(rms)
        volume_variance = np.var(rms)
        
        # Speech rate (zero crossings)
        zcr = librosa.feature.zero_crossing_rate(y)[0]
        avg_zcr = np.mean(zcr)
        
        # Analyze tone based on features
        tone_estimate = "neutral"
        confidence_estimate = "moderate"
        
        # High pitch variance might indicate uncertainty
        if pitch_values:
            pitch_variance = np.var(pitch_values)
            if pitch_variance > 100:  # Threshold
                tone_estimate = "uncertain"
            elif pitch_variance < 30:
                tone_estimate = "confident"
        
        # High volume variance might indicate lack of confidence
        if volume_variance > 0.01:
            confidence_estimate = "low"
        elif volume_variance < 0.001:
            confidence_estimate = "high"
        
        # Speech rate analysis
        if avg_zcr > 0.1:
            # Fast speech might indicate nervousness
            if confidence_estimate == "moderate":
                confidence_estimate = "low"
        
        return {
            "tone_estimate": tone_estimate,
            "confidence_estimate": confidence_estimate,
            "pitch_variance": float(pitch_variance) if pitch_values else 0,
            "volume_variance": float(volume_variance),
            "speech_rate": float(avg_zcr),
            "analysis_available": True
        }
        
    except Exception as e:
        print(f"Audio analysis error: {e}")
        return {
            "tone_estimate": "neutral",
            "confidence_estimate": "moderate",
            "error": str(e),
            "analysis_available": False
        }


def estimate_tone_simple(audio_data: str) -> Dict:
    """
    Simple tone estimation without librosa
    Uses basic audio properties if available
    """
    return {
        "tone_estimate": "neutral",
        "confidence_estimate": "moderate",
        "note": "Install librosa for advanced audio analysis"
    }

