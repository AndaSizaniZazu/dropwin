# LangChain Store Analyzer - Quick Start

## What Was Created

✅ **FastAPI Application** (`app/main.py`)
- Main API server with `/api/analyze-store` endpoint
- Called when analyze button is clicked
- Uses LangChain agent for intelligent analysis

✅ **LangChain Agent** (`app/agents/store_analyzer.py`)
- Orchestrates the analysis process
- Decides which tools to use
- Provides comprehensive store analysis

✅ **Web Scraper Tool** (`app/tools/web_scraper.py`)
- Scrapes store pages
- Extracts store info, products, and pricing
- LangChain tool interface

✅ **Shopify API Tool** (`app/tools/shopify_api.py`)
- Interacts with Shopify stores
- Gets products, store info, searches
- LangChain tool interface

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set OpenAI API key:**
   ```bash
   # Create .env file
   echo "OPENAI_API_KEY=your_key_here" > .env
   ```

3. **Run the API:**
   ```bash
   python run_api.py
   # or
   uvicorn app.main:app --reload --port 8000
   ```

4. **Test it:**
   - Open your React app
   - Go to Store Audit page
   - Enter a store URL
   - Click "Analyze"
   - The LangChain agent will analyze the store!

## How It Works

When you click "Analyze":
1. Frontend calls `POST http://localhost:8000/api/analyze-store`
2. FastAPI receives request and calls LangChain agent
3. Agent uses tools to gather information:
   - Web scraper gets store structure
   - Shopify API gets products
4. Agent analyzes data and generates report
5. Returns comprehensive analysis with score

## Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key
PORT=8000
VITE_API_URL=http://localhost:8000  # For frontend
```

## File Structure

```
app/
├── __init__.py
├── main.py                 # FastAPI app
├── agents/
│   ├── __init__.py
│   └── store_analyzer.py   # LangChain agent
└── tools/
    ├── __init__.py
    ├── web_scraper.py      # Web scraping tool
    └── shopify_api.py      # Shopify API tool
```

## Notes

- The agent uses GPT-4o-mini by default (cost-effective)
- Tools are automatically available to the agent
- Agent decides which tools to use based on the task
- Analysis includes score, issues, and recommendations


