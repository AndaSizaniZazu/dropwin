# Store Analyzer Integration Guide

This guide explains how to integrate the Python Store Analyzer API with your React frontend to enable store analysis functionality.

## Files Created

1. **store_analyzer_api.py** - Python Flask API server
2. **requirements.txt** - Python dependencies
3. **.env.example** - Environment variable template
4. **src/services/storeAnalyzerService.ts** - Frontend service for API calls
5. **src/pages/StoreAudit.updated.tsx** - Updated React component with API integration
6. **STORE_ANALYZER_API_README.md** - Detailed API documentation

## Quick Start

### Step 1: Set Up Python API

#### 1a. Install Python Dependencies

```bash
# Navigate to the project root
cd c:\Users\user\Downloads\win-well-guide-main\win-well-guide-main

# Create a Python virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 1b. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your API key
# LOVABLE_API_KEY=your_actual_api_key_here
```

#### 1c. Start the Python API Server

```bash
python store_analyzer_api.py
```

The API will start on `http://localhost:5000`. You should see:
```
 * Serving Flask app 'store_analyzer_api'
 * Running on http://0.0.0.0:5000
```

### Step 2: Update React Frontend

#### 2a. Replace the StoreAudit Component

```bash
# Backup original if needed
cp src/pages/StoreAudit.tsx src/pages/StoreAudit.tsx.backup

# Replace with updated version
cp src/pages/StoreAudit.updated.tsx src/pages/StoreAudit.tsx
```

#### 2b. Add Environment Variable to Frontend

Add to your `.env.local` (or create it if it doesn't exist):

```
VITE_API_URL=http://localhost:5000
```

#### 2c. Run the Frontend

```bash
npm run dev
# or
bun run dev
```

### Step 3: Test the Integration

1. Open your browser and navigate to the Store Audit page
2. Enter a store URL (e.g., `https://example.myshopify.com`)
3. Click the "Analyze" button
4. Wait for the analysis to complete (may take 30+ seconds on first run)
5. View the results including overall score and detailed audit report

## API Endpoints

The Python API provides these endpoints:

### 1. Analyze Store (Main Endpoint)
- **URL**: `POST /api/analyze-store`
- **Request**: `{ "store_url": "https://..." }`
- **Response**: Complete analysis with score and detailed report

### 2. Validate Store URL
- **URL**: `POST /api/validate-store`
- **Request**: `{ "store_url": "https://..." }`
- **Response**: `{ "valid": true, "message": "...", "url": "..." }`

### 3. Get Store Info
- **URL**: `POST /api/store-info`
- **Request**: `{ "store_url": "https://..." }`
- **Response**: Basic store info (title, meta, response time, HTTPS status)

### 4. Health Check
- **URL**: `GET /health`
- **Response**: API status and version

See **STORE_ANALYZER_API_README.md** for detailed endpoint documentation.

## Frontend Service

The **storeAnalyzerService.ts** provides TypeScript functions:

```typescript
import {
  analyzeStore,
  validateStoreUrl,
  getStoreInfo,
  checkApiHealth
} from "@/services/storeAnalyzerService";

// Analyze a store
const result = await analyzeStore({ store_url: "https://..." });

// Validate URL format
const validation = await validateStoreUrl("https://...");

// Get basic store info
const info = await getStoreInfo("https://...");

// Check API health
const isHealthy = await checkApiHealth();
```

## Updated StoreAudit Component Features

The updated component includes:

- **Real Store Analysis**: Fetches actual store data instead of hardcoded values
- **Dynamic Scoring**: Displays AI-generated overall score
- **Loading State**: Shows loading indicator while analyzing
- **Error Handling**: Proper error messages and toast notifications
- **Detailed Reports**: Displays comprehensive AI-generated audit report
- **Score Variants**: Color-coded feedback (green/yellow/red based on score)
- **Responsive Design**: Works on desktop and mobile

## Architecture

```
React Frontend (StoreAudit.tsx)
       ↓ (HTTP Request)
       ↓
Vite Dev Server (localhost:3000)
       ↓ (CORS enabled)
       ↓
Python Flask API (localhost:5000)
       ↓ (HTTP Request)
       ↓
Store Website (https://example.com)
       ↓
Lovable AI Gateway (https://ai.gateway.lovable.dev)
```

## Troubleshooting

### API Not Responding

1. Ensure Python server is running: `python store_analyzer_api.py`
2. Check if port 5000 is available: `netstat -ano | findstr :5000`
3. Verify LOVABLE_API_KEY in .env file

### CORS Errors

- The API has CORS enabled for all origins in development
- If issues persist, check browser console for specific error messages

### Analysis Timeout

- Store analysis can take 30-60 seconds depending on API response time
- Increase timeout in `storeAnalyzerService.ts` if needed

### Invalid API Key

- Verify your LOVABLE_API_KEY in .env is correct
- Check if the key has sufficient credits

## Production Deployment

When deploying to production:

1. **Environment Variables**: Use secure environment management (not .env files)
2. **CORS**: Update CORS policy to allow only your frontend domain
3. **API Key**: Store securely using environment secrets
4. **HTTPS**: Use HTTPS for all connections
5. **Rate Limiting**: Implement rate limiting for API endpoints
6. **Authentication**: Add API authentication/authorization if needed
7. **Caching**: Add response caching for repeated store analyses

## Advanced Configuration

### Modify AI Analysis Prompts

Edit the `system_prompt` and `user_prompt` in `store_analyzer_api.py`:

```python
system_prompt = """You are an expert e-commerce store auditor...
# Customize this for different analysis types
```

### Add Request Logging

The API includes logging. Access logs by:
1. Running API in foreground (not as background task)
2. Checking console output for request logs

### Custom Analysis Metrics

To add custom metrics, extend the `StoreAnalyzer` class:

```python
def analyze_seo(self, html: str) -> Dict:
    """Add SEO analysis"""
    # Implementation here
    
def analyze_mobile(self, url: str) -> Dict:
    """Add mobile optimization analysis"""
    # Implementation here
```

## Support

For issues or questions:
1. Check API logs: Console output when running Python server
2. Check browser developer tools: Network tab for request/response
3. Review endpoint documentation in STORE_ANALYZER_API_README.md

## Next Steps

1. ✅ Set up Python API
2. ✅ Configure environment variables
3. ✅ Update React component
4. ✅ Test basic functionality
5. 📝 Customize analysis criteria for your use case
6. 📝 Add database integration for storing analysis history
7. 📝 Implement caching for improved performance
8. 📝 Add export functionality (PDF, CSV)
