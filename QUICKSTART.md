# Quick Start Guide

Get the AI Interview Coach up and running in 5 minutes!

## Prerequisites Check

- ✅ Python 3.8+ installed
- ✅ Node.js 16+ installed  
- ✅ OpenAI API key (get one at https://platform.openai.com/api-keys)

## Step 1: Backend Setup (2 minutes)

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r ../requirements.txt
   ```

5. **Create .env file:**
   - Copy `env.example` to `.env` in the backend folder
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=sk-your-actual-key-here
     OPENAI_MODEL=gpt-3.5-turbo
     ```

6. **Start backend server:**
   ```bash
   uvicorn main:app --reload
   ```
   
   You should see: `Uvicorn running on http://0.0.0.0:8000`

## Step 2: Frontend Setup (2 minutes)

1. **Open a NEW terminal window** (keep backend running)

2. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start frontend server:**
   ```bash
   npm run dev
   ```
   
   You should see: `Local: http://localhost:3000`

## Step 3: Use the App! (1 minute)

1. **Open your browser:**
   - Go to `http://localhost:3000`

2. **Select a role:**
   - Choose from the dropdown (e.g., "Software Engineer")
   - Click "Start Interview Practice"

3. **Answer questions:**
   - Read the question
   - Type or use voice input
   - Select interviewer mode (Friendly/Technical/Challenging)
   - Submit and get instant feedback!

4. **View your report:**
   - After all questions, see your performance summary
   - Export as PDF if needed

## Troubleshooting

### Backend won't start
- Make sure port 8000 is not in use
- Check that virtual environment is activated
- Verify `.env` file exists with valid API key

### Frontend won't connect
- Make sure backend is running on port 8000
- Check browser console for errors
- Verify CORS settings in `backend/main.py`

### OpenAI API errors
- Verify your API key is correct in `.env`
- Check you have credits in your OpenAI account
- Try using `gpt-3.5-turbo` instead of `gpt-4`

### Voice input not working
- Use Chrome or Edge browser
- Allow microphone permissions
- Check browser console for errors

## Windows Users

You can use the setup scripts:
- `setup_backend.bat` - Sets up backend automatically
- `setup_frontend.bat` - Sets up frontend automatically

## Next Steps

- Try different roles and questions
- Experiment with different interviewer modes
- Review your reports and improvement tips
- Practice regularly to improve your interview skills!

## Need Help?

Check the main `README.md` for detailed documentation and API information.

