# AI Interview Coach

A full-stack AI-powered interview practice application that helps users prepare for job interviews with real-time feedback on clarity, tone, filler words, and confidence.

## Features

- 🎯 **Role-Specific Questions**: Practice with questions tailored to your target role
- 🤖 **AI-Powered Feedback**: Get instant feedback using Hugging Face models
- 🎤 **Voice Input**: Use Web Speech API for voice-to-text responses
- 📊 **Detailed Reports**: Comprehensive performance analysis with score breakdowns
- 📄 **PDF Export**: Export your interview reports as PDFs
- 🌙 **Dark Mode**: Beautiful dark/light theme support
- ✨ **Smooth Animations**: Powered by Framer Motion

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Hugging Face Inference API**: AI models for interview analysis (Mistral, Llama, etc.)
- **Librosa**: Audio analysis for tone detection (optional)
- **SQLite/In-Memory**: Session storage

### Frontend
- **React**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **React Router**: Navigation
- **Axios**: HTTP client
- **jsPDF**: PDF generation

## Project Structure

```
ai-interview-coach/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── routes/
│   │   ├── __init__.py
│   │   └── interview.py        # Interview API endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   └── openai_service.py   # Hugging Face API integration (kept name for compatibility)
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── filler_words.py     # Filler word detection
│   │   └── audio_analysis.py   # Audio tone analysis
│   └── data/
│       └── sample_questions.json # Role-specific questions
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx     # Landing page
│   │   │   ├── Interview.jsx   # Interview practice page
│   │   │   └── Report.jsx      # Performance report page
│   │   ├── components/
│   │   │   ├── RoleSelector.jsx
│   │   │   ├── VoiceRecorder.jsx
│   │   │   └── FeedbackCard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── requirements.txt
├── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- Hugging Face API token (free tier available at https://huggingface.co/settings/tokens)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - **Windows**: `venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r ../requirements.txt
```

5. Create a `.env` file in the backend directory:
```bash
cp ../.env.example .env
```

6. Edit `.env` and add your Hugging Face API token:
```
HUGGINGFACE_API_KEY=your_huggingface_token_here
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
```

   Get your free API token at: https://huggingface.co/settings/tokens

7. Run the backend server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Start the Application**:
   - Make sure both backend and frontend servers are running
   - Open `http://localhost:3000` in your browser

2. **Select a Role**:
   - Choose your target job role from the dropdown
   - Click "Start Interview Practice"

3. **Answer Questions**:
   - Read each question carefully
   - Choose between text or voice input
   - Select interviewer mode (Friendly, Technical, or Challenging)
   - Submit your response

4. **Review Feedback**:
   - Get instant AI-powered feedback on your response
   - Review score, tone, filler words, and improvement tips
   - Continue to the next question

5. **View Report**:
   - After completing all questions, view your comprehensive report
   - Export as PDF for future reference

## API Endpoints

### GET `/api/roles`
Get available interview roles

### GET `/api/questions/{role}?count=5`
Get questions for a specific role

### POST `/api/session?role={role}&question_count=5`
Create a new interview session

### POST `/api/session/{session_id}/response`
Submit a response and get feedback

### GET `/api/session/{session_id}/report`
Get final interview report

## Configuration

### Interviewer Modes

- **Friendly**: Encouraging and supportive feedback
- **Technical**: Focus on technical accuracy
- **Challenging**: More critical, points out significant improvements needed

### Supported Roles

- Software Engineer
- Data Scientist
- Product Manager
- UX Designer
- DevOps Engineer
- Marketing Manager

## Voice Input

Voice input uses the Web Speech API, which is supported in:
- Chrome/Edge (Chromium)
- Safari

For best results, use Chrome or Edge.

## Audio Analysis

Advanced audio analysis requires the `librosa` library. If not installed, the app will still work but with limited audio analysis capabilities.

## Development

### Backend Development

```bash
# Run with auto-reload
uvicorn main:app --reload

# Run on specific port
uvicorn main:app --reload --port 8000
```

### Frontend Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

- `HUGGINGFACE_API_KEY`: Your Hugging Face API token (required)
  - Get it free at: https://huggingface.co/settings/tokens
- `HUGGINGFACE_MODEL`: Model to use (default: `mistralai/Mistral-7B-Instruct-v0.2`)
  - Other options: `gpt2`, `google/flan-t5-large`, `meta-llama/Llama-2-7b-chat-hf`
- `PORT`: Backend server port (default: `8000`)

## Troubleshooting

### Backend Issues

- **Import errors**: Make sure you're in the virtual environment
- **Hugging Face API errors**: Check your API token in `.env`
- **Model loading errors (503)**: Wait 10-30 seconds and try again (models spin down after inactivity)
- **Rate limit errors (429)**: Free tier has hourly limits, wait a few minutes
- **Port already in use**: Change the port in `main.py` or kill the process using port 8000

### Frontend Issues

- **CORS errors**: Make sure backend is running on port 8000
- **API connection errors**: Check backend server is running
- **Voice input not working**: Use Chrome or Edge browser

## Future Enhancements

- [ ] SQLite database for persistent session storage
- [ ] User authentication and accounts
- [ ] Interview history and progress tracking
- [ ] More role-specific questions
- [ ] Custom question sets
- [ ] Real-time collaboration features
- [ ] Mobile app version

## License

MIT License - feel free to use this project for learning and development!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

