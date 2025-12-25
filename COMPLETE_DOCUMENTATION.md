# AI Interview Coach - Complete Documentation

> **Version:** 1.0.0  
> **Last Updated:** November 28, 2025  
> **Author:** Aditya Silswal

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Architecture](#project-architecture)
5. [Installation Guide](#installation-guide)
6. [Configuration](#configuration)
7. [API Documentation](#api-documentation)
8. [Frontend Components](#frontend-components)
9. [Backend Services](#backend-services)
10. [Usage Guide](#usage-guide)
11. [Advanced Features](#advanced-features)
12. [Troubleshooting](#troubleshooting)
13. [Development Guide](#development-guide)
14. [Deployment](#deployment)
15. [Contributing](#contributing)

---

## Project Overview

**AI Interview Coach** is a full-stack web application designed to help job seekers practice and improve their interview skills using AI-powered feedback. The application provides role-specific interview questions, real-time voice input, comprehensive performance analysis, and actionable improvement tips.

### Key Highlights

- 🤖 **AI-Powered Feedback** using Google Gemini API
- 🎯 **Role-Specific Questions** for various job positions
- 🎤 **Voice Input Support** via Web Speech API
- 📄 **Resume Analysis** with PDF upload and parsing
- 📊 **Detailed Performance Reports** with score breakdowns
- 🌙 **Modern UI** with dark mode and smooth animations
- 📥 **PDF Export** for interview reports

---

## Features

### Core Features

1. **Interview Practice**
   - Select from multiple job roles (Software Engineer, Data Scientist, Product Manager, etc.)
   - Get role-specific interview questions
   - Answer via text or voice input
   - Receive instant AI-powered feedback

2. **AI Feedback Analysis**
   - Overall score (1-10 scale)
   - Tone analysis (confident, neutral, uncertain)
   - Clarity assessment (excellent, good, moderate, needs improvement)
   - Confidence level detection (high, moderate, low)
   - Filler word detection and counting
   - Personalized improvement tips

3. **Resume Analysis**
   - Upload PDF resumes
   - Extract and parse resume text
   - Generate custom interview questions based on resume
   - Optional "roast mode" for humorous but constructive feedback

4. **Performance Reports**
   - Comprehensive session reports
   - Score breakdowns (min, max, average)
   - Question-by-question feedback
   - Overall improvement recommendations
   - PDF export functionality

5. **Interviewer Modes**
   - **Friendly**: Encouraging and supportive feedback
   - **Technical**: Focus on technical accuracy and depth
   - **Challenging**: Critical feedback with significant improvement areas

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.8+ | Programming language |
| **FastAPI** | 0.104.1+ | Web framework |
| **Uvicorn** | 0.24.0+ | ASGI server |
| **Google Gemini API** | Latest | AI-powered analysis |
| **Librosa** | 0.10.1+ | Audio analysis |
| **PyPDF** | 3.17.1+ | PDF parsing |
| **Pydantic** | 2.5.0+ | Data validation |
| **Python-dotenv** | 1.0.0+ | Environment management |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **Vite** | 7.2.2 | Build tool & dev server |
| **Tailwind CSS** | 3.3.6 | Styling framework |
| **Framer Motion** | 10.16.5 | Animations |
| **React Router** | 6.20.0 | Navigation |
| **Axios** | 1.6.2 | HTTP client |
| **jsPDF** | 3.0.4 | PDF generation |

---

## Project Architecture

```
ai-interview-coach/
├── backend/                      # Backend API
│   ├── main.py                  # FastAPI entry point
│   ├── .env                     # Environment variables (not in git)
│   ├── routes/                  # API endpoints
│   │   ├── __init__.py
│   │   └── interview.py         # Interview routes
│   ├── services/                # Business logic
│   │   ├── __init__.py
│   │   ├── gemini_service.py    # Gemini API integration
│   │   └── openai_service.py    # Legacy service (kept for compatibility)
│   ├── utils/                   # Utility functions
│   │   ├── __init__.py
│   │   ├── audio_analysis.py    # Audio tone analysis
│   │   ├── filler_words.py      # Filler word detection
│   │   └── resume_parser.py     # PDF resume parsing
│   ├── data/                    # Static data
│   │   └── sample_questions.json # Role-specific questions
│   └── venv/                    # Virtual environment
│
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── main.jsx             # App entry point
│   │   ├── App.jsx              # Main app component
│   │   ├── index.css            # Global styles
│   │   ├── pages/               # Page components
│   │   │   ├── Landing.jsx      # Landing page
│   │   │   ├── Interview.jsx    # Interview practice page
│   │   │   └── Report.jsx       # Performance report page
│   │   └── components/          # Reusable components
│   │       ├── RoleSelector.jsx # Role selection component
│   │       ├── VoiceRecorder.jsx # Voice input component
│   │       └── FeedbackCard.jsx # Feedback display component
│   ├── index.html               # HTML template
│   ├── package.json             # Dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind configuration
│   └── postcss.config.js        # PostCSS configuration
│
├── requirements.txt              # Python dependencies
├── env.example                   # Environment template
├── README.md                     # Project README
├── QUICKSTART.md                 # Quick start guide
├── TROUBLESHOOTING.md            # Troubleshooting guide
├── FIX_PROXIES_ERROR.md          # Proxy error fixes
├── setup_backend.bat             # Windows backend setup
└── setup_frontend.bat            # Windows frontend setup
```

---

## Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8 or higher** ([Download](https://www.python.org/downloads/))
- **Node.js 16 or higher** ([Download](https://nodejs.org/))
- **Google Gemini API Key** ([Get Free API Key](https://aistudio.google.com/app/apikey))

### Step 1: Clone or Download the Project

```bash
cd "e:\PYTHON F FINAL"
```

### Step 2: Backend Setup

#### Option A: Automated Setup (Windows)

```bash
setup_backend.bat
```

#### Option B: Manual Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r ../requirements.txt
   ```

5. **Create `.env` file:**
   ```bash
   # Copy the example file
   cp ../env.example .env
   ```

6. **Edit `.env` and add your Gemini API key:**
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=8000
   HOST=0.0.0.0
   ```

7. **Start the backend server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   You should see:
   ```
   ✅ Gemini API key loaded
   ✅ Gemini Service initialized
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

### Step 3: Frontend Setup

#### Option A: Automated Setup (Windows)

Open a **new terminal** and run:
```bash
setup_frontend.bat
```

#### Option B: Manual Setup

1. **Open a new terminal** (keep backend running)

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE v7.2.2  ready in XXX ms
   ➜  Local:   http://localhost:3000/
   ```

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Required: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Server Configuration
PORT=8000
HOST=0.0.0.0
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

> **Note:** The Gemini API has a free tier with generous limits suitable for development and personal use.

### Supported Roles

The application comes with pre-configured questions for the following roles:

- Software Engineer
- Data Scientist
- Product Manager
- UX Designer
- DevOps Engineer
- Marketing Manager

You can add more roles by editing `backend/data/sample_questions.json`.

---

## API Documentation

### Base URL

```
http://localhost:8000/api
```

### Endpoints

#### 1. Health Check

**GET** `/`

Check if the API is running.

**Response:**
```json
{
  "message": "AI Interview Coach API is running",
  "version": "1.0.0"
}
```

---

#### 2. Get Available Roles

**GET** `/api/roles`

Retrieve all available interview roles.

**Response:**
```json
{
  "roles": [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "UX Designer",
    "DevOps Engineer",
    "Marketing Manager"
  ]
}
```

---

#### 3. Get Questions for a Role

**GET** `/api/questions/{role}?count=5`

Get interview questions for a specific role.

**Parameters:**
- `role` (path): Job role name
- `count` (query, optional): Number of questions (default: 5)

**Example:**
```
GET /api/questions/Software%20Engineer?count=3
```

**Response:**
```json
{
  "role": "Software Engineer",
  "questions": [
    "Explain the difference between REST and GraphQL APIs.",
    "How would you optimize a slow database query?",
    "Describe your experience with microservices architecture."
  ],
  "total": 3
}
```

---

#### 4. Get Interview Feedback

**POST** `/api/feedback`

Submit an interview response and receive AI-powered feedback.

**Request Body:**
```json
{
  "role": "Software Engineer",
  "question": "Explain the difference between REST and GraphQL APIs.",
  "response": "REST is an architectural style that uses HTTP methods...",
  "mode": "friendly",
  "audio_data": null
}
```

**Parameters:**
- `role` (string): Job role
- `question` (string): Interview question
- `response` (string): User's answer
- `mode` (string, optional): Interviewer mode - "friendly", "technical", or "challenging"
- `audio_data` (string, optional): Base64 encoded audio for tone analysis

**Response:**
```json
{
  "summary": "Your response demonstrates a solid understanding of both REST and GraphQL...",
  "score": 8,
  "tone": "confident",
  "filler_words_count": 2,
  "filler_words": ["um", "like"],
  "improvement_tips": [
    "Provide specific examples from your experience",
    "Mention performance considerations",
    "Discuss when to use each approach"
  ],
  "audio_analysis": null,
  "clarity": "good",
  "confidence": "high"
}
```

---

#### 5. Upload Resume

**POST** `/api/upload-resume`

Upload a PDF resume for analysis and question generation.

**Request (multipart/form-data):**
- `file` (file): PDF resume file
- `role` (string): Target job role
- `roast_mode` (boolean): Enable roast mode (default: false)

**Response:**
```json
{
  "text_preview": "John Doe\nSoftware Engineer\nExperience: 5 years...",
  "roast": "Your resume says 'team player' 47 times...",
  "questions": [
    "Tell me about your experience with React and Node.js mentioned in your resume.",
    "You mentioned building a microservices architecture. What challenges did you face?",
    "Explain the machine learning project you worked on at XYZ Corp."
  ]
}
```

---

#### 6. Create Interview Session

**POST** `/api/session`

Create a new interview session.

**Request Body:**
```json
{
  "role": "Software Engineer",
  "question_count": 5,
  "custom_questions": null
}
```

**Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "Software Engineer",
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5"
  ],
  "total_questions": 5
}
```

---

#### 7. Get Session Details

**GET** `/api/session/{session_id}`

Retrieve details of an interview session.

**Response:**
```json
{
  "role": "Software Engineer",
  "questions": ["Q1", "Q2", "Q3"],
  "responses": [],
  "current_question": 0
}
```

---

#### 8. Submit Response to Session

**POST** `/api/session/{session_id}/response`

Submit a response to the current question in a session.

**Request Body:**
```json
{
  "question": "Explain the difference between REST and GraphQL APIs.",
  "response": "REST is an architectural style...",
  "mode": "friendly"
}
```

**Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "current_question": 1,
  "total_questions": 5,
  "feedback": {
    "summary": "...",
    "score": 8,
    "tone": "confident",
    "improvement_tips": ["..."]
  }
}
```

---

#### 9. Get Interview Report

**GET** `/api/session/{session_id}/report`

Get the final comprehensive report for a completed interview session.

**Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "Software Engineer",
  "total_questions": 5,
  "answered_questions": 5,
  "average_score": 7.6,
  "overall_tone": "confident",
  "total_filler_words": 8,
  "responses": [
    {
      "question": "...",
      "response": "...",
      "feedback": {...}
    }
  ],
  "improvement_tips": [
    "Provide more specific examples",
    "Reduce use of filler words",
    "Structure answers using STAR method"
  ],
  "score_breakdown": {
    "min": 6,
    "max": 9,
    "average": 7.6
  }
}
```

---

## Frontend Components

### Pages

#### 1. Landing Page (`Landing.jsx`)

The home page where users:
- See the application overview
- Select their target job role
- Start a new interview session

**Key Features:**
- Role dropdown selector
- Animated hero section
- Call-to-action buttons

---

#### 2. Interview Page (`Interview.jsx`)

The main interview practice interface where users:
- View interview questions one at a time
- Submit responses via text or voice
- Select interviewer mode
- Receive instant feedback

**Key Features:**
- Question display
- Text input area
- Voice recording button
- Mode selector (Friendly/Technical/Challenging)
- Real-time feedback display
- Progress tracking

---

#### 3. Report Page (`Report.jsx`)

Comprehensive performance report showing:
- Overall statistics
- Question-by-question breakdown
- Score visualization
- Improvement recommendations
- PDF export option

**Key Features:**
- Score breakdown charts
- Detailed feedback cards
- Export to PDF button
- Session summary

---

### Components

#### 1. RoleSelector (`RoleSelector.jsx`)

Dropdown component for selecting job roles.

**Props:**
- `onRoleSelect`: Callback when role is selected
- `roles`: Array of available roles

---

#### 2. VoiceRecorder (`VoiceRecorder.jsx`)

Voice input component using Web Speech API.

**Props:**
- `onTranscript`: Callback with transcribed text
- `isRecording`: Recording state

**Features:**
- Start/stop recording
- Real-time transcription
- Browser compatibility check

---

#### 3. FeedbackCard (`FeedbackCard.jsx`)

Display component for AI feedback.

**Props:**
- `feedback`: Feedback object from API
- `question`: Interview question
- `response`: User's answer

**Displays:**
- Score badge
- Tone indicator
- Clarity level
- Confidence level
- Filler word count
- Improvement tips

---

## Backend Services

### 1. Gemini Service (`gemini_service.py`)

Handles all interactions with Google Gemini API.

**Key Methods:**

```python
async def analyze_response(
    question: str,
    response: str,
    role: str,
    mode: str = "friendly",
    filler_count: int = 0
) -> Dict
```
Analyzes interview responses and returns structured feedback.

```python
async def generate_questions_from_resume(
    resume_text: str,
    role: str,
    count: int = 5
) -> List[str]
```
Generates custom interview questions based on resume content.

```python
async def roast_resume(resume_text: str) -> str
```
Provides humorous but constructive resume feedback.

---

### 2. Audio Analysis (`audio_analysis.py`)

Analyzes audio tone and quality using Librosa.

**Key Function:**

```python
def analyze_audio_tone(audio_data: str) -> Dict
```

Returns:
- Pitch analysis
- Energy levels
- Speaking rate
- Tone characteristics

---

### 3. Filler Words Detection (`filler_words.py`)

Detects and counts filler words in responses.

**Key Function:**

```python
def detect_filler_words(text: str) -> Tuple[int, List[str]]
```

Detects common filler words:
- um, uh, like, you know
- actually, basically, literally
- sort of, kind of, I mean

---

### 4. Resume Parser (`resume_parser.py`)

Extracts text from PDF resumes.

**Key Function:**

```python
def extract_text_from_pdf(file_content: bytes) -> str
```

Uses PyPDF to parse PDF files and extract text content.

---

## Usage Guide

### Basic Workflow

1. **Start the Application**
   - Ensure both backend and frontend servers are running
   - Open `http://localhost:3000` in your browser

2. **Select a Role**
   - Choose your target job role from the dropdown
   - Click "Start Interview Practice"

3. **Answer Questions**
   - Read each question carefully
   - Type your answer or use the microphone for voice input
   - Select interviewer mode (Friendly/Technical/Challenging)
   - Click "Submit Response"

4. **Review Feedback**
   - View your score (1-10)
   - Read the AI-generated summary
   - Check tone, clarity, and confidence levels
   - Note filler word count
   - Review improvement tips

5. **Continue or Finish**
   - Click "Next Question" to continue
   - After all questions, view your comprehensive report
   - Export report as PDF if needed

---

### Voice Input

The application supports voice input using the Web Speech API.

**Supported Browsers:**
- Google Chrome (recommended)
- Microsoft Edge
- Safari

**How to Use:**
1. Click the microphone button
2. Allow microphone permissions when prompted
3. Speak your answer clearly
4. Click the button again to stop recording
5. Review the transcribed text
6. Edit if needed and submit

---

### Resume Upload Feature

1. **Navigate to Resume Upload** (if available in UI)
2. **Select PDF Resume**
3. **Choose Target Role**
4. **Enable Roast Mode** (optional)
5. **Upload**
6. **Review:**
   - Generated custom questions
   - Resume roast (if enabled)
   - Extracted text preview

---

## Advanced Features

### 1. Custom Questions

You can create interview sessions with custom questions:

```javascript
// Frontend example
const response = await axios.post('/api/session', {
  role: 'Custom Role',
  question_count: 5,
  custom_questions: [
    'Your custom question 1',
    'Your custom question 2',
    'Your custom question 3'
  ]
});
```

---

### 2. Interviewer Modes

**Friendly Mode:**
- Encouraging and supportive
- Focuses on positive aspects
- Gentle improvement suggestions

**Technical Mode:**
- Emphasizes technical accuracy
- Detailed technical analysis
- Depth of knowledge assessment

**Challenging Mode:**
- More critical feedback
- Highlights significant gaps
- Pushes for improvement

---

### 3. Audio Analysis

When audio data is provided, the system analyzes:
- Speaking tone
- Pitch variations
- Energy levels
- Speaking rate

This provides additional insights beyond text analysis.

---

### 4. Session Management

Sessions are stored in-memory (for development). Each session includes:
- Unique session ID
- Role and questions
- All responses and feedback
- Current progress

---

## Troubleshooting

### Backend Issues

#### Port Already in Use

**Error:** `Address already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

---

#### Gemini API Key Not Found

**Error:** `⚠️ WARNING: GEMINI_API_KEY not found`

**Solution:**
1. Ensure `.env` file exists in `backend/` directory
2. Check that `GEMINI_API_KEY` is set correctly
3. No quotes needed around the API key
4. Restart the backend server

---

#### Import Errors

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
1. Ensure virtual environment is activated
2. Reinstall dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

#### Gemini API Quota Exceeded

**Error:** `429 Resource Exhausted`

**Solution:**
- Wait a few minutes (free tier has rate limits)
- Check your API quota in Google AI Studio
- Consider upgrading to paid tier for higher limits

---

### Frontend Issues

#### CORS Errors

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
1. Ensure backend is running on port 8000
2. Check CORS configuration in `backend/main.py`
3. Verify frontend is accessing `http://localhost:8000`

---

#### Voice Input Not Working

**Error:** Voice recording doesn't start

**Solution:**
1. Use Chrome or Edge browser
2. Allow microphone permissions
3. Check browser console for errors
4. Ensure HTTPS or localhost (required for Web Speech API)

---

#### Build Errors

**Error:** `npm ERR! code ELIFECYCLE`

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Common Issues

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more detailed troubleshooting guides.

---

## Development Guide

### Backend Development

#### Running in Development Mode

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The `--reload` flag enables auto-reload on code changes.

---

#### Adding New Routes

1. Create or edit files in `backend/routes/`
2. Define route using FastAPI decorators
3. Include router in `main.py`

Example:
```python
# routes/new_route.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/new-endpoint")
async def new_endpoint():
    return {"message": "Hello"}

# main.py
from routes import new_route
app.include_router(new_route.router, prefix="/api", tags=["new"])
```

---

#### Adding New Roles

Edit `backend/data/sample_questions.json`:

```json
{
  "New Role Name": [
    "Question 1 for new role",
    "Question 2 for new role",
    "Question 3 for new role"
  ]
}
```

---

### Frontend Development

#### Running Development Server

```bash
cd frontend
npm run dev
```

---

#### Building for Production

```bash
npm run build
```

Output will be in `frontend/dist/`

---

#### Preview Production Build

```bash
npm run preview
```

---

#### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `App.jsx`

Example:
```jsx
// src/pages/NewPage.jsx
export default function NewPage() {
  return <div>New Page Content</div>;
}

// App.jsx
import NewPage from './pages/NewPage';

<Route path="/new-page" element={<NewPage />} />
```

---

#### Styling Guidelines

The project uses Tailwind CSS. Common patterns:

```jsx
// Card
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">

// Button
<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">

// Input
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
```

---

## Deployment

### Backend Deployment

#### Option 1: Heroku

```bash
# Install Heroku CLI
# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > Procfile

# Deploy
heroku create your-app-name
heroku config:set GEMINI_API_KEY=your_key_here
git push heroku main
```

---

#### Option 2: Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

---

#### Option 3: Docker

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### Frontend Deployment

#### Option 1: Vercel

```bash
npm install -g vercel
cd frontend
vercel
```

---

#### Option 2: Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

---

#### Option 3: GitHub Pages

```bash
npm run build
# Configure GitHub Pages to serve from dist/
```

---

### Environment Variables for Production

Update API endpoints in frontend:

```javascript
// config.js
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-url.com/api'
  : 'http://localhost:8000/api';
```

---

## Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs

1. Check existing issues
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. Open an issue with the "enhancement" label
2. Describe the feature and its benefits
3. Provide examples or mockups if possible

### Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

MIT License - Feel free to use this project for learning and development!

---

## Support

For questions or issues:

1. Check this documentation
2. Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. Check [QUICKSTART.md](QUICKSTART.md)
4. Open an issue on GitHub

---

## Acknowledgments

- **Google Gemini API** for AI-powered feedback
- **FastAPI** for the excellent Python web framework
- **React** and **Vite** for modern frontend development
- **Tailwind CSS** for beautiful styling
- **Framer Motion** for smooth animations

---

## Changelog

### Version 1.0.0 (Current)

- ✅ Google Gemini API integration
- ✅ Role-specific interview questions
- ✅ Voice input support
- ✅ Resume upload and analysis
- ✅ Filler word detection
- ✅ Comprehensive performance reports
- ✅ PDF export functionality
- ✅ Dark mode support
- ✅ Three interviewer modes

---

## Future Enhancements

- [ ] User authentication and accounts
- [ ] SQLite/PostgreSQL database integration
- [ ] Interview history tracking
- [ ] Progress analytics over time
- [ ] Video interview practice
- [ ] Real-time collaboration features
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Custom question sets management
- [ ] Interview scheduling
- [ ] Peer review features

---

**Thank you for using AI Interview Coach!** 🚀

For the latest updates and more information, visit the project repository.
