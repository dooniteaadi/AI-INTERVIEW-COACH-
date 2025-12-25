# AI Interview Coach - Quick Reference Guide

> **Quick access to commands, endpoints, and common tasks**

---

## Table of Contents

1. [Setup Commands](#setup-commands)
2. [Running the Application](#running-the-application)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Environment Variables](#environment-variables)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting Quick Fixes](#troubleshooting-quick-fixes)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [File Locations](#file-locations)

---

## Setup Commands

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Create .env file
cp ../env.example .env

# Edit .env and add your API key
# GEMINI_API_KEY=your_key_here

# Run backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Running the Application

### Start Backend

```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
✅ Gemini API key loaded
✅ Gemini Service initialized
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

---

### Start Frontend

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v7.2.2  ready in 234 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

### Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

---

## API Endpoints Reference

### Base URL
```
http://localhost:8000/api
```

---

### Health Check

```bash
# Check if API is running
curl http://localhost:8000/

# Response:
# {
#   "message": "AI Interview Coach API is running",
#   "version": "1.0.0"
# }
```

---

### Get Roles

```bash
# Get all available roles
curl http://localhost:8000/api/roles

# Response:
# {
#   "roles": [
#     "Software Engineer",
#     "Data Scientist",
#     "Product Manager",
#     "UX Designer",
#     "DevOps Engineer",
#     "Marketing Manager"
#   ]
# }
```

---

### Get Questions

```bash
# Get questions for a specific role
curl "http://localhost:8000/api/questions/Software%20Engineer?count=3"

# Response:
# {
#   "role": "Software Engineer",
#   "questions": [
#     "Question 1",
#     "Question 2",
#     "Question 3"
#   ],
#   "total": 3
# }
```

---

### Get Feedback

```bash
# Submit response and get feedback
curl -X POST http://localhost:8000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Software Engineer",
    "question": "Explain REST APIs",
    "response": "REST APIs use HTTP methods...",
    "mode": "friendly"
  }'

# Response:
# {
#   "summary": "Your response demonstrates...",
#   "score": 8,
#   "tone": "confident",
#   "filler_words_count": 2,
#   "filler_words": ["um", "like"],
#   "improvement_tips": ["Tip 1", "Tip 2"],
#   "clarity": "good",
#   "confidence": "high"
# }
```

---

### Create Session

```bash
# Create a new interview session
curl -X POST http://localhost:8000/api/session \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Software Engineer",
    "question_count": 5
  }'

# Response:
# {
#   "session_id": "550e8400-e29b-41d4-a716-446655440000",
#   "role": "Software Engineer",
#   "questions": ["Q1", "Q2", "Q3", "Q4", "Q5"],
#   "total_questions": 5
# }
```

---

### Submit Response to Session

```bash
# Submit a response to a session
curl -X POST http://localhost:8000/api/session/{session_id}/response \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Question text",
    "response": "My answer",
    "mode": "friendly"
  }'
```

---

### Get Session Report

```bash
# Get final report for a session
curl http://localhost:8000/api/session/{session_id}/report

# Response includes:
# - average_score
# - overall_tone
# - total_filler_words
# - responses with feedback
# - improvement_tips
# - score_breakdown
```

---

### Upload Resume

```bash
# Upload PDF resume
curl -X POST http://localhost:8000/api/upload-resume \
  -F "file=@resume.pdf" \
  -F "role=Software Engineer" \
  -F "roast_mode=false"

# Response:
# {
#   "text_preview": "Resume text...",
#   "roast": null,
#   "questions": ["Q1", "Q2", "Q3"]
# }
```

---

## Environment Variables

### Backend `.env` File

Location: `backend/.env`

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
PORT=8000
HOST=0.0.0.0
```

---

### Get Gemini API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and paste in `.env` file

---

## Common Tasks

### Add a New Role

1. Open `backend/data/sample_questions.json`
2. Add new role with questions:

```json
{
  "New Role Name": [
    "Question 1 for this role",
    "Question 2 for this role",
    "Question 3 for this role",
    "Question 4 for this role",
    "Question 5 for this role"
  ]
}
```

3. Save file
4. Restart backend (auto-reloads if using `--reload`)

---

### Change Interviewer Mode Behavior

Edit `backend/services/gemini_service.py`:

```python
def _get_mode_prompt(self, mode: str) -> str:
    mode_prompts = {
        "friendly": "Your custom friendly prompt",
        "technical": "Your custom technical prompt",
        "challenging": "Your custom challenging prompt"
    }
    return mode_prompts.get(mode, mode_prompts["friendly"])
```

---

### Customize Filler Words List

Edit `backend/utils/filler_words.py`:

```python
FILLER_PATTERNS = [
    r'\bum\b',
    r'\buh\b',
    r'\blike\b',
    r'\byou know\b',
    # Add your custom patterns
    r'\bbasically\b',
    r'\bactually\b',
]
```

---

### Change Frontend Port

Edit `frontend/vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // Change this
    host: true
  }
})
```

---

### Change Backend Port

Edit `backend/main.py`:

```python
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    #                                            ^^^^
    #                                        Change this
```

Or use command line:

```bash
uvicorn main:app --reload --port 9000
```

---

## Troubleshooting Quick Fixes

### Backend Won't Start

**Problem:** Port 8000 already in use

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

---

**Problem:** Module not found

```bash
# Ensure virtual environment is activated
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

---

**Problem:** Gemini API key not found

```bash
# Check .env file exists
ls backend/.env

# Check contents
cat backend/.env

# Ensure format is correct (no quotes)
GEMINI_API_KEY=AIzaSy...
```

---

### Frontend Won't Start

**Problem:** Dependencies not installed

```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

**Problem:** CORS errors

1. Check backend is running on port 8000
2. Verify CORS settings in `backend/main.py`:

```python
allow_origins=["http://localhost:3000", "http://localhost:5173"]
```

---

**Problem:** Voice input not working

- Use Chrome or Edge browser
- Allow microphone permissions
- Check HTTPS or localhost (required for Web Speech API)

---

### API Errors

**Problem:** 503 Service Unavailable (Gemini)

- Wait 10-30 seconds (model cold start)
- Check API key is valid
- Verify internet connection

---

**Problem:** 429 Too Many Requests

- Wait a few minutes (rate limit)
- Check Gemini API quota
- Consider upgrading API tier

---

**Problem:** 500 Internal Server Error

- Check backend logs
- Verify all environment variables are set
- Ensure dependencies are installed

---

## Keyboard Shortcuts

### Development

| Shortcut | Action |
|----------|--------|
| `Ctrl + C` | Stop server |
| `Ctrl + Shift + R` | Hard reload browser |
| `F12` | Open browser DevTools |
| `Ctrl + Shift + I` | Open browser DevTools |

---

### Browser (Interview Page)

| Action | Shortcut |
|--------|----------|
| Focus text area | Click or Tab |
| Submit response | Click button or Ctrl+Enter |
| Start/stop voice | Click microphone button |

---

## File Locations

### Configuration Files

```
backend/.env                    # Backend environment variables
frontend/vite.config.js         # Vite configuration
frontend/tailwind.config.js     # Tailwind CSS configuration
frontend/postcss.config.js      # PostCSS configuration
```

---

### Data Files

```
backend/data/sample_questions.json  # Interview questions database
```

---

### Source Code

```
backend/
├── main.py                     # Backend entry point
├── routes/interview.py         # API endpoints
├── services/gemini_service.py  # Gemini integration
└── utils/                      # Utility functions

frontend/src/
├── App.jsx                     # Frontend entry point
├── pages/                      # Page components
└── components/                 # Reusable components
```

---

### Logs

```
backend/app.log                 # Backend logs (if configured)
```

---

## Dependencies

### Backend

```
fastapi>=0.104.1
uvicorn[standard]>=0.24.0
python-multipart>=0.0.6
requests>=2.31.0
pydantic>=2.5.0
python-dotenv>=1.0.0
librosa>=0.10.1
numpy>=1.24.3
soundfile>=0.12.1
google-generativeai
pypdf>=3.17.1
```

---

### Frontend

```
react@^18.2.0
react-dom@^18.2.0
react-router-dom@^6.20.0
axios@^1.6.2
framer-motion@^10.16.5
jspdf@^3.0.4
tailwindcss@^3.3.6
vite@^7.2.2
```

---

## Useful Commands

### Python

```bash
# Check Python version
python --version

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (Mac/Linux)
source venv/bin/activate

# Deactivate virtual environment
deactivate

# Install package
pip install package-name

# Install from requirements
pip install -r requirements.txt

# Freeze dependencies
pip freeze > requirements.txt

# List installed packages
pip list
```

---

### Node.js / npm

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Install dependencies
npm install

# Install specific package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Run script
npm run script-name

# Update packages
npm update

# Clean install
npm ci
```

---

### Git

```bash
# Clone repository
git clone <url>

# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "message"

# Push changes
git push

# Pull changes
git pull

# Create branch
git checkout -b branch-name

# Switch branch
git checkout branch-name
```

---

## Testing

### Backend Tests

```bash
# Install pytest
pip install pytest

# Run tests
pytest

# Run with coverage
pytest --cov=backend

# Run specific test file
pytest tests/test_interview.py

# Run specific test
pytest tests/test_interview.py::test_function_name
```

---

### Frontend Tests

```bash
# Install testing libraries
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

---

## Production Build

### Backend

```bash
# Install production dependencies only
pip install --no-dev -r requirements.txt

# Run with Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

---

### Frontend

```bash
# Build for production
npm run build

# Output in dist/ folder

# Preview production build
npm run preview

# Serve with static server
npx serve -s dist
```

---

## Docker Commands

```bash
# Build backend image
docker build -t interview-coach-backend -f Dockerfile.backend .

# Build frontend image
docker build -t interview-coach-frontend -f Dockerfile.frontend .

# Run backend container
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key interview-coach-backend

# Run frontend container
docker run -p 80:80 interview-coach-frontend

# Docker Compose
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
docker-compose ps             # List services
```

---

## API Testing with cURL

### Test Health Endpoint

```bash
curl http://localhost:8000/
```

---

### Test Roles Endpoint

```bash
curl http://localhost:8000/api/roles
```

---

### Test Feedback Endpoint

```bash
curl -X POST http://localhost:8000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Software Engineer",
    "question": "What is REST?",
    "response": "REST is an architectural style",
    "mode": "friendly"
  }'
```

---

### Test with Postman

1. Import collection from API docs: http://localhost:8000/docs
2. Set base URL: `http://localhost:8000/api`
3. Test endpoints interactively

---

## Performance Monitoring

### Backend

```bash
# Monitor with htop (Linux/Mac)
htop

# Monitor with Task Manager (Windows)
taskmgr

# Check memory usage
ps aux | grep uvicorn

# Check CPU usage
top -p $(pgrep uvicorn)
```

---

### Frontend

```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer

# Lighthouse audit
npx lighthouse http://localhost:3000
```

---

## Backup and Restore

### Backup Session Data (if using SQLite)

```bash
# Backup database
cp backend/interview_coach.db backup/interview_coach_$(date +%Y%m%d).db

# Restore database
cp backup/interview_coach_20231128.db backend/interview_coach.db
```

---

### Backup Configuration

```bash
# Backup .env file
cp backend/.env backup/.env.backup

# Backup questions
cp backend/data/sample_questions.json backup/sample_questions.json
```

---

## Useful Links

- **Gemini API**: https://aistudio.google.com/app/apikey
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

---

## Quick Reference Card

### Start Everything

```bash
# Terminal 1 - Backend
cd backend && venv\Scripts\activate && uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend && npm run dev
```

---

### Stop Everything

```bash
# Press Ctrl+C in both terminals
```

---

### Reset Everything

```bash
# Backend
cd backend
deactivate
rm -rf venv
python -m venv venv
venv\Scripts\activate
pip install -r ../requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

### Check Status

```bash
# Backend running?
curl http://localhost:8000/

# Frontend running?
curl http://localhost:3000/
```

---

## Support

For more detailed information, see:

- [Complete Documentation](COMPLETE_DOCUMENTATION.md)
- [User Guide](USER_GUIDE.md)
- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Quick Start Guide](QUICKSTART.md)

---

**Last Updated:** November 28, 2025
