# Store Product Analyzer with LangChain

This implementation uses LangChain agents to analyze e-commerce stores with intelligent tool usage.

## Architecture

- **FastAPI** (`app/main.py`): Main API server
- **LangChain Agent** (`app/agents/store_analyzer.py`): Intelligent agent that orchestrates analysis
- **Web Scraper Tool** (`app/tools/web_scraper.py`): Scrapes store pages and extracts information
- **Shopify API Tool** (`app/tools/shopify_api.py`): Interacts with Shopify stores via their API

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=8000
```

### 3. Run the FastAPI Server

```bash
python -m app.main
# or
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```

### Analyze Store
```
POST /api/analyze-store
Content-Type: application/json

{
  "store_url": "https://example.myshopify.com",
  "product_url": "https://example.myshopify.com/products/product-name" (optional),
  "store_name": "My Store" (optional)
}
```

## How It Works

1. **Frontend calls** `/api/analyze-store` when the analyze button is clicked
2. **FastAPI endpoint** receives the request and calls the LangChain agent
3. **LangChain Agent** decides which tools to use:
   - Uses `web_scraper` to scrape store pages
   - Uses `shopify_api` to get product data
   - Analyzes the collected data
4. **Agent returns** comprehensive analysis with:
   - Overall score (1-100)
   - Detailed audit report
   - Critical issues
   - Quick wins

## Tools

### Web Scraper Tool
- Scrapes store pages
- Extracts store information, products, and pricing
- Supports different extraction types: `all`, `store_info`, `products`, `pricing`

### Shopify API Tool
- Gets store information
- Retrieves product listings
- Gets detailed product information
- Searches for products

## Frontend Integration

The frontend service (`src/services/storeAnalyzerService.ts`) is already configured to call the FastAPI endpoint at `http://localhost:8000`.

To change the API URL, set the `VITE_API_URL` environment variable in your `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

## Testing

Test the API directly:

```bash
curl -X POST http://localhost:8000/api/analyze-store \
  -H "Content-Type: application/json" \
  -d '{"store_url": "https://example.myshopify.com"}'
```

Or use the interactive API docs at `http://localhost:8000/docs`


