# Ollama Setup Guide

## Overview
This application now uses **local Ollama LLM** instead of OpenAI. No API keys needed!

## Requirements
- Ollama installed and running locally
- phi3 model downloaded in Ollama

## Setup Steps

### 1. Install Ollama
Download and install Ollama from: https://ollama.com

### 2. Start Ollama
```bash
# Ollama should start automatically after installation
# Or start it manually:
ollama serve
```

### 3. Pull the phi3 Model
```bash
ollama pull phi3
```

This will download the phi3 model (approximately 2.3GB).

### 4. Verify Ollama is Running
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Or test with a simple query
ollama run phi3 "Hello, world!"
```

### 5. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 6. Configure (Optional)
The default configuration is:
- Ollama URL: `http://localhost:11434`
- Model: `phi3`

You can override these in your `.env` file:
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=phi3
```

### 7. Run the API
```bash
python run_api.py
```

## Testing the Endpoint

### Test the Product Analysis Endpoint
```bash
curl -X POST http://localhost:8000/functions/v1/analyze-product \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Wireless Bluetooth Headphones",
    "productUrl": "https://example.com/products/headphones",
    "productDescription": "Premium wireless headphones with noise cancellation"
  }'
```

## API Endpoint

**POST** `/functions/v1/analyze-product`

**Request:**
```json
{
  "productName": "Product Name",
  "productUrl": "https://example.com/products/product" (optional),
  "productDescription": "Product description" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "product_name": "Product Name",
  "analysis": {
    "markdown_report": "# Product Analysis\n\n...",
    "analyzed_at": "2024-01-01T12:00:00"
  }
}
```

## Troubleshooting

### "Connection refused" error
- Make sure Ollama is running: `ollama serve`
- Check if port 11434 is accessible: `curl http://localhost:11434/api/tags`

### "Model not found" error
- Pull the model: `ollama pull phi3`
- Verify model exists: `ollama list`

### Slow responses
- phi3 is a smaller model, responses may take 10-30 seconds
- Consider using a more powerful model like `llama3` or `mistral` if available

## Available Models
You can use other Ollama models by changing `OLLAMA_MODEL` in `.env`:
- `phi3` (default, ~2.3GB, fast)
- `llama3` (~4.7GB, better quality)
- `mistral` (~4.1GB, good balance)
- `gemma` (~2GB, fast)

## Benefits of Local LLM
✅ No API keys required
✅ No usage limits
✅ No costs per request
✅ Data stays local (privacy)
✅ Works offline


