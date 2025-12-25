# AI Interview Coach - Technical Architecture

> **Technical Documentation for Developers**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Data Flow](#data-flow)
6. [API Integration](#api-integration)
7. [Database Design](#database-design)
8. [Security Considerations](#security-considerations)
9. [Performance Optimization](#performance-optimization)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### High-Level Architecture

AI Interview Coach is a **full-stack web application** built with:

- **Backend**: FastAPI (Python) - RESTful API server
- **Frontend**: React (JavaScript) - Single Page Application
- **AI Service**: Google Gemini API - Natural language processing
- **Storage**: In-memory (development) / SQLite (production-ready)

### Design Principles

1. **Separation of Concerns** - Clear separation between frontend, backend, and services
2. **RESTful API** - Standard HTTP methods and status codes
3. **Stateless Backend** - Session data stored separately from application logic
4. **Responsive Design** - Mobile-first, responsive UI
5. **Modularity** - Reusable components and services

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Frontend (Port 3000)                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │  │
│  │  │  Pages   │  │Components│  │  State Management│    │  │
│  │  │  - Landing│  │ - Role   │  │  - Session Data  │    │  │
│  │  │  - Interview│ │ - Voice  │  │  - User Input    │    │  │
│  │  │  - Report │  │ - Feedback│  │  - API Responses │    │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │ (Axios)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           FastAPI Backend (Port 8000)                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │  │
│  │  │  Routes  │  │ Services │  │     Utilities     │    │  │
│  │  │  - Interview│ │ - Gemini │  │  - Filler Words  │    │  │
│  │  │  - Session│  │ - Audio  │  │  - Audio Analysis│    │  │
│  │  │  - Resume │  │          │  │  - Resume Parser │    │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Google Gemini API                         │  │
│  │  - Text Analysis                                       │  │
│  │  - Response Evaluation                                 │  │
│  │  - Question Generation                                 │  │
│  │  - Resume Analysis                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  In-Memory Storage (Development)                       │  │
│  │  - Session Data                                        │  │
│  │  - User Responses                                      │  │
│  │  - Feedback History                                    │  │
│  │                                                         │  │
│  │  Static Data Files                                     │  │
│  │  - sample_questions.json                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Framework: FastAPI

**Why FastAPI?**
- High performance (comparable to Node.js)
- Automatic API documentation (Swagger/OpenAPI)
- Type hints and validation (Pydantic)
- Async support
- Easy to learn and use

### Project Structure

```
backend/
├── main.py                    # Application entry point
├── .env                       # Environment variables
├── routes/                    # API endpoints
│   ├── __init__.py
│   └── interview.py           # Interview-related routes
├── services/                  # Business logic
│   ├── __init__.py
│   ├── gemini_service.py      # Gemini API integration
│   └── openai_service.py      # Legacy service
├── utils/                     # Utility functions
│   ├── __init__.py
│   ├── audio_analysis.py      # Audio processing
│   ├── filler_words.py        # Text analysis
│   └── resume_parser.py       # PDF parsing
└── data/                      # Static data
    └── sample_questions.json  # Question bank
```

### Core Components

#### 1. Main Application (`main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Interview Coach API",
    description="Backend API for AI-powered interview practice",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(interview.router, prefix="/api", tags=["interview"])
```

**Key Features:**
- CORS middleware for frontend communication
- API documentation auto-generation
- Router inclusion for modular endpoints
- Health check endpoints

---

#### 2. Interview Routes (`routes/interview.py`)

**Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/roles` | Get available roles |
| GET | `/api/questions/{role}` | Get role-specific questions |
| POST | `/api/feedback` | Get AI feedback on response |
| POST | `/api/upload-resume` | Upload and analyze resume |
| POST | `/api/session` | Create interview session |
| GET | `/api/session/{id}` | Get session details |
| POST | `/api/session/{id}/response` | Submit response to session |
| GET | `/api/session/{id}/report` | Get final report |

**Request/Response Models:**

```python
class InterviewRequest(BaseModel):
    role: str
    question: str
    response: str
    mode: Optional[str] = "friendly"
    audio_data: Optional[str] = None

class InterviewSession(BaseModel):
    role: str
    questions: List[str]
    responses: List[dict] = []
```

---

#### 3. Gemini Service (`services/gemini_service.py`)

**Responsibilities:**
- Initialize Gemini API client
- Analyze interview responses
- Generate custom questions from resumes
- Provide resume roasts

**Key Methods:**

```python
class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    async def analyze_response(
        self,
        question: str,
        response: str,
        role: str,
        mode: str = "friendly",
        filler_count: int = 0
    ) -> Dict:
        # Constructs prompt and calls Gemini API
        # Returns structured feedback
    
    async def generate_questions_from_resume(
        self,
        resume_text: str,
        role: str,
        count: int = 5
    ) -> List[str]:
        # Generates custom questions based on resume
    
    async def roast_resume(self, resume_text: str) -> str:
        # Provides humorous resume feedback
```

**Prompt Engineering:**

The service uses carefully crafted prompts to get structured responses:

```python
prompt = f"""
You are a professional interview coach specializing in {role} positions.
{mode_prompt}

Analyze the user's interview response.
The response contains {filler_count} filler words.

Question: {question}
Response: {response}

Provide analysis as a JSON object with this structure:
{{
    "summary": "Brief 2-3 sentence summary",
    "score": <number 1-10>,
    "tone": "confident" | "neutral" | "uncertain",
    "clarity": "excellent" | "good" | "moderate" | "needs_improvement",
    "confidence": "high" | "moderate" | "low",
    "improvement_tips": ["tip1", "tip2", "tip3"]
}}
"""
```

---

#### 4. Utility Functions

**Filler Words Detection (`utils/filler_words.py`):**

```python
def detect_filler_words(text: str) -> Tuple[int, List[str]]:
    """
    Detects common filler words in text
    Returns: (count, list of filler words found)
    """
    filler_patterns = [
        r'\bum\b', r'\buh\b', r'\blike\b',
        r'\byou know\b', r'\bI mean\b',
        r'\bactually\b', r'\bbasically\b',
        # ... more patterns
    ]
    # Uses regex to find and count filler words
```

**Audio Analysis (`utils/audio_analysis.py`):**

```python
def analyze_audio_tone(audio_data: str) -> Dict:
    """
    Analyzes audio for tone, pitch, and energy
    Uses librosa for audio processing
    """
    # Decodes base64 audio
    # Extracts features using librosa
    # Returns analysis results
```

**Resume Parser (`utils/resume_parser.py`):**

```python
def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extracts text from PDF resume
    Uses pypdf library
    """
    pdf_file = io.BytesIO(file_content)
    reader = pypdf.PdfReader(pdf_file)
    # Extracts text from all pages
```

---

### Session Management

**Current Implementation (In-Memory):**

```python
# Global dictionary storing sessions
sessions = {}

# Creating a session
session_id = str(uuid.uuid4())
sessions[session_id] = {
    "role": role,
    "questions": questions,
    "responses": [],
    "current_question": 0
}
```

**Production-Ready (SQLite):**

```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    question_text TEXT,
    question_order INTEGER,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    question_id INTEGER,
    response_text TEXT,
    score INTEGER,
    feedback JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

---

## Frontend Architecture

### Framework: React + Vite

**Why React?**
- Component-based architecture
- Virtual DOM for performance
- Large ecosystem
- Easy state management

**Why Vite?**
- Fast development server
- Hot module replacement (HMR)
- Optimized production builds
- Modern ES modules support

### Project Structure

```
frontend/src/
├── main.jsx                   # Application entry point
├── App.jsx                    # Root component with routing
├── index.css                  # Global styles
├── pages/                     # Page components
│   ├── Landing.jsx            # Home page
│   ├── Interview.jsx          # Interview practice
│   └── Report.jsx             # Performance report
└── components/                # Reusable components
    ├── RoleSelector.jsx       # Role selection dropdown
    ├── VoiceRecorder.jsx      # Voice input component
    └── FeedbackCard.jsx       # Feedback display
```

### Core Components

#### 1. App Component (`App.jsx`)

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Routing:**
- `/` - Landing page
- `/interview` - Interview practice page
- `/report` - Performance report page

---

#### 2. Landing Page (`pages/Landing.jsx`)

**State Management:**

```jsx
const [selectedRole, setSelectedRole] = useState('');
const [roles, setRoles] = useState([]);

useEffect(() => {
  // Fetch available roles from API
  axios.get('http://localhost:8000/api/roles')
    .then(response => setRoles(response.data.roles));
}, []);
```

**Key Features:**
- Role selection
- Start interview button
- Animated hero section
- Feature highlights

---

#### 3. Interview Page (`pages/Interview.jsx`)

**State Management:**

```jsx
const [sessionId, setSessionId] = useState(null);
const [questions, setQuestions] = useState([]);
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [response, setResponse] = useState('');
const [mode, setMode] = useState('friendly');
const [feedback, setFeedback] = useState(null);
const [isLoading, setIsLoading] = useState(false);
```

**Workflow:**

1. Create session on mount
2. Display current question
3. Capture user response (text or voice)
4. Submit to API
5. Display feedback
6. Move to next question or finish

**API Integration:**

```jsx
const submitResponse = async () => {
  setIsLoading(true);
  try {
    const response = await axios.post(
      `http://localhost:8000/api/session/${sessionId}/response`,
      {
        question: questions[currentQuestionIndex],
        response: response,
        mode: mode
      }
    );
    setFeedback(response.data.feedback);
  } catch (error) {
    console.error('Error submitting response:', error);
  } finally {
    setIsLoading(false);
  }
};
```

---

#### 4. Report Page (`pages/Report.jsx`)

**Data Fetching:**

```jsx
useEffect(() => {
  const fetchReport = async () => {
    const response = await axios.get(
      `http://localhost:8000/api/session/${sessionId}/report`
    );
    setReportData(response.data);
  };
  fetchReport();
}, [sessionId]);
```

**PDF Export:**

```jsx
import jsPDF from 'jspdf';

const exportToPDF = () => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Interview Performance Report', 20, 20);
  
  // Add statistics
  doc.setFontSize(12);
  doc.text(`Average Score: ${reportData.average_score}`, 20, 40);
  doc.text(`Total Questions: ${reportData.total_questions}`, 20, 50);
  
  // Add responses
  // ... more content
  
  doc.save('interview-report.pdf');
};
```

---

#### 5. Voice Recorder Component (`components/VoiceRecorder.jsx`)

**Web Speech API Integration:**

```jsx
const VoiceRecorder = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || 
                               window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        onTranscript(transcript);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  return (
    <button onClick={toggleRecording}>
      {isRecording ? 'Stop Recording' : 'Start Recording'}
    </button>
  );
};
```

---

### Styling Architecture

**Tailwind CSS Configuration:**

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        // ... custom colors
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
```

**Common Utility Classes:**

```css
/* Card */
.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6;
}

/* Button */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg 
         transition-colors duration-200;
}

/* Input */
.input {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg 
         focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}
```

---

## Data Flow

### Interview Session Flow

```
1. User selects role on Landing page
   ↓
2. Frontend creates session via POST /api/session
   ↓
3. Backend generates session_id and questions
   ↓
4. Frontend navigates to Interview page with session_id
   ↓
5. User answers question (text or voice)
   ↓
6. Frontend submits response via POST /api/session/{id}/response
   ↓
7. Backend:
   - Detects filler words
   - Calls Gemini API for analysis
   - Combines feedback
   - Stores in session
   ↓
8. Frontend displays feedback
   ↓
9. Repeat steps 5-8 for each question
   ↓
10. After all questions, frontend fetches report via GET /api/session/{id}/report
    ↓
11. Backend calculates statistics and returns comprehensive report
    ↓
12. Frontend displays report with export option
```

---

### Resume Upload Flow

```
1. User selects PDF file
   ↓
2. Frontend uploads via POST /api/upload-resume (multipart/form-data)
   ↓
3. Backend:
   - Validates PDF format
   - Extracts text using pypdf
   - Calls Gemini API to generate questions
   - Optionally generates roast
   ↓
4. Frontend receives:
   - Text preview
   - Custom questions
   - Roast (if enabled)
   ↓
5. User can start interview with custom questions
```

---

## API Integration

### Gemini API

**Configuration:**

```python
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')
```

**Request Format:**

```python
response = model.generate_content(prompt)
result_text = response.text
```

**Response Parsing:**

```python
def _extract_json_from_text(self, text: str) -> Dict:
    # Remove markdown code blocks
    text = text.replace("```json", "").replace("```", "").strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fallback: extract JSON using regex
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        
        # Ultimate fallback
        return default_response
```

**Error Handling:**

```python
try:
    response = self.model.generate_content(prompt)
    return self._extract_json_from_text(response.text)
except Exception as e:
    print(f"Gemini API Error: {e}")
    return {
        "summary": "Error generating feedback",
        "score": 5,
        "tone": "neutral",
        # ... default values
    }
```

---

### Web Speech API

**Browser Support:**

```javascript
const SpeechRecognition = window.SpeechRecognition || 
                           window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert('Speech recognition not supported in this browser');
}
```

**Configuration:**

```javascript
const recognition = new SpeechRecognition();
recognition.continuous = true;      // Keep listening
recognition.interimResults = true;  // Get partial results
recognition.lang = 'en-US';         // Language
```

**Event Handlers:**

```javascript
recognition.onresult = (event) => {
  // Handle transcription results
};

recognition.onerror = (event) => {
  console.error('Speech recognition error:', event.error);
};

recognition.onend = () => {
  // Handle recording end
};
```

---

## Database Design

### Current: In-Memory Storage

**Advantages:**
- Simple implementation
- Fast access
- No setup required

**Disadvantages:**
- Data lost on restart
- No persistence
- Not scalable

---

### Recommended: SQLite

**Schema:**

```sql
-- Sessions table
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' -- active, completed, abandoned
);

-- Questions table
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Responses table
CREATE TABLE responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    response_text TEXT NOT NULL,
    score INTEGER,
    tone TEXT,
    clarity TEXT,
    confidence TEXT,
    filler_words_count INTEGER,
    feedback_summary TEXT,
    improvement_tips JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_sessions_created ON sessions(created_at);
CREATE INDEX idx_responses_session ON responses(session_id);
CREATE INDEX idx_questions_session ON questions(session_id);
```

**Implementation:**

```python
import sqlite3
from contextlib import contextmanager

@contextmanager
def get_db():
    conn = sqlite3.connect('interview_coach.db')
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def create_session(role: str, questions: List[str]) -> str:
    session_id = str(uuid.uuid4())
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Insert session
        cursor.execute(
            "INSERT INTO sessions (id, role) VALUES (?, ?)",
            (session_id, role)
        )
        
        # Insert questions
        for i, question in enumerate(questions):
            cursor.execute(
                "INSERT INTO questions (session_id, question_text, question_order) "
                "VALUES (?, ?, ?)",
                (session_id, question, i)
            )
        
        conn.commit()
    
    return session_id
```

---

## Security Considerations

### API Key Protection

**Environment Variables:**

```python
# Never hardcode API keys
api_key = os.getenv("GEMINI_API_KEY")  # ✅ Good

# Don't do this
api_key = "AIzaSy..."  # ❌ Bad
```

**`.gitignore`:**

```
.env
*.env
.env.local
```

---

### CORS Configuration

**Development:**

```python
allow_origins=["http://localhost:3000", "http://localhost:5173"]
```

**Production:**

```python
allow_origins=["https://yourdomain.com"]
```

---

### Input Validation

**Pydantic Models:**

```python
class InterviewRequest(BaseModel):
    role: str = Field(..., min_length=1, max_length=100)
    question: str = Field(..., min_length=1, max_length=1000)
    response: str = Field(..., min_length=1, max_length=5000)
    mode: Optional[str] = Field("friendly", regex="^(friendly|technical|challenging)$")
```

---

### File Upload Security

**Validation:**

```python
# Check file type
if not file.filename.endswith('.pdf'):
    raise HTTPException(status_code=400, detail="Only PDF files allowed")

# Check file size
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
if len(content) > MAX_FILE_SIZE:
    raise HTTPException(status_code=400, detail="File too large")
```

---

### Rate Limiting

**Implementation (future):**

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/feedback")
@limiter.limit("10/minute")
async def get_feedback(request: Request, data: InterviewRequest):
    # ... endpoint logic
```

---

## Performance Optimization

### Backend Optimization

**1. Async Operations:**

```python
# Use async for I/O operations
async def get_feedback(request: InterviewRequest):
    # Async API call
    feedback = await gemini_service.analyze_response(...)
    return feedback
```

**2. Caching:**

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_questions_for_role(role: str):
    # Cache frequently accessed questions
    return SAMPLE_QUESTIONS.get(role, [])
```

**3. Connection Pooling:**

```python
# For database connections
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    'sqlite:///interview_coach.db',
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20
)
```

---

### Frontend Optimization

**1. Code Splitting:**

```javascript
// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'));
const Interview = lazy(() => import('./pages/Interview'));
const Report = lazy(() => import('./pages/Report'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/interview" element={<Interview />} />
    <Route path="/report" element={<Report />} />
  </Routes>
</Suspense>
```

**2. Memoization:**

```javascript
import { useMemo, useCallback } from 'react';

const MemoizedComponent = ({ data }) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return expensiveOperation(data);
  }, [data]);

  // Memoize callbacks
  const handleClick = useCallback(() => {
    // ... handler logic
  }, [dependencies]);

  return <div>{processedData}</div>;
};
```

**3. Debouncing:**

```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce((query) => {
  // API call
}, 300);
```

---

## Testing Strategy

### Backend Testing

**Unit Tests:**

```python
import pytest
from services.gemini_service import GeminiService

def test_filler_word_detection():
    from utils.filler_words import detect_filler_words
    
    text = "Um, I think, like, this is a good answer, you know?"
    count, words = detect_filler_words(text)
    
    assert count == 4
    assert "um" in words
    assert "like" in words
```

**Integration Tests:**

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_roles():
    response = client.get("/api/roles")
    assert response.status_code == 200
    assert "roles" in response.json()

def test_create_session():
    response = client.post("/api/session", json={
        "role": "Software Engineer",
        "question_count": 5
    })
    assert response.status_code == 200
    assert "session_id" in response.json()
```

---

### Frontend Testing

**Component Tests:**

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import RoleSelector from './RoleSelector';

test('renders role selector', () => {
  const roles = ['Software Engineer', 'Data Scientist'];
  render(<RoleSelector roles={roles} onRoleSelect={() => {}} />);
  
  expect(screen.getByText('Software Engineer')).toBeInTheDocument();
});

test('calls onRoleSelect when role is selected', () => {
  const handleSelect = jest.fn();
  const roles = ['Software Engineer'];
  
  render(<RoleSelector roles={roles} onRoleSelect={handleSelect} />);
  
  fireEvent.click(screen.getByText('Software Engineer'));
  expect(handleSelect).toHaveBeenCalledWith('Software Engineer');
});
```

---

## Deployment Architecture

### Development Environment

```
┌─────────────┐         ┌─────────────┐
│   Frontend  │         │   Backend   │
│  (Vite Dev) │ ←────→  │  (Uvicorn)  │
│  Port 3000  │         │  Port 8000  │
└─────────────┘         └─────────────┘
       │                       │
       │                       │
       ▼                       ▼
   localhost              localhost
```

---

### Production Environment

```
┌──────────────────────────────────────────┐
│              Load Balancer                │
│           (Nginx / Cloudflare)            │
└──────────────────────────────────────────┘
              │                │
              ▼                ▼
    ┌─────────────┐   ┌─────────────┐
    │   Frontend  │   │   Backend   │
    │   (Static)  │   │  (Gunicorn) │
    │   Vercel/   │   │   Railway/  │
    │   Netlify   │   │   Heroku    │
    └─────────────┘   └─────────────┘
                            │
                            ▼
                  ┌─────────────────┐
                  │  Gemini API     │
                  │  (Google Cloud) │
                  └─────────────────┘
```

---

### Docker Deployment

**Backend Dockerfile:**

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**

```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose:**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./backend:/app
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

---

## Monitoring and Logging

### Backend Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

@app.post("/api/feedback")
async def get_feedback(request: InterviewRequest):
    logger.info(f"Feedback request for role: {request.role}")
    try:
        # ... logic
        logger.info("Feedback generated successfully")
    except Exception as e:
        logger.error(f"Error generating feedback: {e}", exc_info=True)
```

---

### Error Tracking

**Sentry Integration:**

```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

---

## Conclusion

This architecture provides:

- ✅ **Scalability** - Modular design allows easy scaling
- ✅ **Maintainability** - Clear separation of concerns
- ✅ **Performance** - Optimized for speed and efficiency
- ✅ **Security** - Best practices for API key management and validation
- ✅ **Extensibility** - Easy to add new features

For questions or contributions, please refer to the main documentation.

---

**Last Updated:** November 28, 2025
