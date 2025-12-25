# Troubleshooting Guide

## Issue: "Failed to get feedback. Please try again."

### What Was Fixed

1. **API Endpoint Changed**: The `/session/{session_id}/response` endpoint now accepts a JSON body instead of query parameters. This is more reliable for longer text responses.

2. **Better Error Handling**: Added detailed error logging and more informative error messages.

3. **Environment Variable Loading**: Improved .env file loading with explicit path resolution.

### Steps to Fix

1. **Make sure your backend server is restarted** to pick up the changes:
   ```bash
   cd backend
   # Stop the current server (Ctrl+C)
   # Then restart it:
   uvicorn main:app --reload
   ```

2. **Check the backend console** when you start the server. You should see:
   ```
   ✅ OpenAI API key loaded (length: XXX)
   ```

3. **If you see a warning** about the API key not being found:
   - Verify the `.env` file exists in the `backend` directory
   - Check that it contains: `OPENAI_API_KEY=sk-proj-...`
   - Make sure there are no extra spaces or quotes around the key

4. **Check browser console** (F12) for detailed error messages when submitting a response.

5. **Check backend console** for error logs when the API call fails.

### Common Issues

#### Issue: "OPENAI_API_KEY environment variable is not set"
- **Solution**: Make sure `.env` file exists in `backend/` directory
- Verify the file contains: `OPENAI_API_KEY=your_key_here`
- Restart the backend server after creating/editing `.env`

#### Issue: "Error generating feedback: ..."
- Check the backend console for the full error message
- Common causes:
  - Invalid API key
  - No credits in OpenAI account
  - Network connectivity issues
  - API rate limits

#### Issue: CORS errors in browser
- Make sure backend is running on port 8000
- Check that `backend/main.py` has the correct CORS origins
- Frontend should be on `http://localhost:3000`

### Testing the API Key

Run this command to test if your API key is loaded correctly:
```bash
cd backend
python -c "from dotenv import load_dotenv; import os; from pathlib import Path; load_dotenv(Path('.env')); print('API Key:', 'Found' if os.getenv('OPENAI_API_KEY') else 'Not Found')"
```

### Still Having Issues?

1. Check backend console logs for detailed error messages
2. Check browser console (F12) for frontend errors
3. Verify both servers are running:
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`
4. Try accessing the API directly: `http://localhost:8000/health`

