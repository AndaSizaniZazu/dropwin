# Quick Start Guide - Store Analyzer with LangChain

## ✅ Step 1: Get Your OpenAI API Key

**Where to get it:**
1. Go to **[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)**
2. Sign up or log in to your OpenAI account
3. Click **"+ Create new secret key"**
4. Give it a name (e.g., "Store Analyzer")
5. **Copy the key immediately** - it looks like: `sk-proj-xxxxxxxxxxxxx`

📖 **Detailed guide:** See `GET_OPENAI_KEY.md`

## ✅ Step 2: Set Up Environment

Run the setup script:
```bash
python setup.py
```

This will create a `.env` file. Then edit it and add your OpenAI key:
```
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

Or manually create `.env`:
```bash
# Copy the example
cp .env.example .env

# Then edit .env and add your key
```

## ✅ Step 3: Run the FastAPI Server

```bash
python run_api.py
```

The API will start on `http://localhost:8000`

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

## ✅ Step 4: Run the React Frontend

In a **new terminal**:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or similar)

## ✅ Step 5: Test It!

1. Open your browser to the React app (usually `http://localhost:5173`)
2. Navigate to the **Store Audit** page
3. Enter a store URL (e.g., `https://example.myshopify.com`)
4. Click **"Analyze"**
5. The LangChain agent will analyze the store! 🎉

## Troubleshooting

### "OPENAI_API_KEY is not set"
- Make sure you created a `.env` file
- Make sure the key is in the format: `OPENAI_API_KEY=sk-proj-...`
- Restart the API server after adding the key

### "Module not found" errors
- Run: `pip install -r requirements.txt`

### API not starting
- Check if port 8000 is already in use
- Change the port in `.env`: `PORT=8001`

### Frontend can't connect to API
- Make sure the API is running on port 8000
- Check `VITE_API_URL` in your frontend `.env` matches the API port

## What's Happening?

When you click "Analyze":
1. Frontend → Calls `POST /api/analyze-store`
2. FastAPI → Receives request
3. LangChain Agent → Decides which tools to use
4. Tools → Web scraper gets store info, Shopify API gets products
5. Agent → Analyzes everything and generates report
6. Response → Returns comprehensive analysis with score

## Need Help?

- See `GET_OPENAI_KEY.md` for OpenAI key setup
- See `LANGCHAIN_SETUP.md` for architecture details
- See `README_LANGCHAIN.md` for API documentation


