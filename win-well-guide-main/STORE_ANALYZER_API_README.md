# Store Analyzer API

A Python Flask API for analyzing e-commerce stores and generating CRO (Conversion Rate Optimization) audit reports.

## Features

- **Store Validation**: Validate store URLs before analysis
- **Basic Store Info**: Fetch and extract basic store information
- **AI-Powered Analysis**: Generate comprehensive CRO audit reports using AI
- **Score Extraction**: Automatically extract overall performance scores
- **CORS Support**: Ready for frontend integration

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your API key:

```bash
cp .env.example .env
```

Then edit `.env` and add your Lovable AI Gateway API key:

```
LOVABLE_API_KEY=your_actual_api_key_here
FLASK_ENV=development
PORT=5000
```

### 3. Run the API

```bash
python store_analyzer_api.py
```

The API will start on `http://localhost:5000`

## API Endpoints

### Health Check

**GET** `/health`

Returns the health status of the API.

```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-30T10:30:00.000000",
  "api_version": "1.0"
}
```

### Analyze Store

**POST** `/api/analyze-store`

Performs a complete analysis of a store, including fetching basic information and generating an AI-powered CRO audit report.

**Request:**
```json
{
  "store_url": "https://example.myshopify.com",
  "store_name": "Optional store name"
}
```

**Response (Success):**
```json
{
  "success": true,
  "url": "https://example.myshopify.com",
  "store_info": {
    "title": "Example Store",
    "meta_description": "Your store description",
    "response_time_seconds": 2.34,
    "https_enabled": true
  },
  "analysis": {
    "overall_score": 78,
    "audit_report": "Comprehensive audit report text...",
    "analyzed_at": "2024-12-30T10:30:00.000000"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Failed to fetch store: Connection timeout",
  "url": "https://example.myshopify.com"
}
```

**Example with cURL:**
```bash
curl -X POST http://localhost:5000/api/analyze-store \
  -H "Content-Type: application/json" \
  -d '{"store_url": "https://example.myshopify.com"}'
```

**Example with Python:**
```python
import requests

response = requests.post(
    "http://localhost:5000/api/analyze-store",
    json={"store_url": "https://example.myshopify.com"}
)
print(response.json())
```

### Validate Store URL

**POST** `/api/validate-store`

Validates a store URL format without performing analysis.

**Request:**
```json
{
  "store_url": "https://example.myshopify.com"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Valid URL",
  "url": "https://example.myshopify.com"
}
```

### Get Store Info

**POST** `/api/store-info`

Fetches basic store information without AI analysis (faster response).

**Request:**
```json
{
  "store_url": "https://example.myshopify.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.myshopify.com",
    "status_code": 200,
    "response_time": 2.34,
    "title": "Example Store",
    "meta_description": "Store description",
    "has_https": true
  }
}
```

## Frontend Integration

To integrate with your React frontend (like the StoreAudit component), you can use the following:

```typescript
// API service for store analysis
const analyzeStore = async (storeUrl: string) => {
  try {
    const response = await fetch("http://localhost:5000/api/analyze-store", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ store_url: storeUrl }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Request successful
- `400 Bad Request` - Invalid input
- `402 Payment Required` - AI credits exhausted
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Logging

The API logs all operations to the console. Check the output for debugging information.

## Architecture

### StoreAnalyzer Class

The `StoreAnalyzer` class handles:
- URL validation
- Store data fetching (title, meta description, response time, HTTPS status)
- AI-powered analysis
- Score extraction

### Main Components

- **Flask App**: Web framework
- **CORS**: Cross-Origin Resource Sharing support
- **Requests**: HTTP client for fetching store data and calling AI API
- **Logging**: Debugging and monitoring

## Performance Considerations

- Store fetching timeout: 10 seconds
- AI analysis timeout: 30 seconds
- Recommended to add request caching for repeated analyses
- Consider implementing rate limiting for production use

## Security

- Validate all input URLs
- Keep API keys in environment variables
- Use HTTPS in production
- Implement authentication if needed
- Add request rate limiting

## Future Enhancements

- Database integration for storing analysis history
- Caching layer for repeated store analyses
- Advanced metrics (page speed, SEO analysis, competitor comparison)
- Webhook support for async analysis
- Export reports to PDF/CSV
- Custom audit criteria
