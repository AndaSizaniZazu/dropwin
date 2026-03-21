# Quick Reference - Store Analyzer API

## Files Overview

| File | Purpose |
|------|---------|
| `store_analyzer_api.py` | Main Python Flask API server |
| `requirements.txt` | Python package dependencies |
| `.env.example` | Environment variables template |
| `src/services/storeAnalyzerService.ts` | React service for API calls |
| `src/pages/StoreAudit.updated.tsx` | Updated React component |
| `STORE_ANALYZER_API_README.md` | Detailed API documentation |
| `INTEGRATION_GUIDE.md` | Setup and integration guide |

## Setup Checklist

- [ ] Install Python dependencies: `pip install -r requirements.txt`
- [ ] Copy and configure .env: `cp .env.example .env` + add API key
- [ ] Start Python API: `python store_analyzer_api.py` (port 5000)
- [ ] Update React component: Copy `StoreAudit.updated.tsx` to `StoreAudit.tsx`
- [ ] Add env variable: `VITE_API_URL=http://localhost:5000`
- [ ] Start frontend: `npm run dev` or `bun run dev`
- [ ] Test: Click Analyze button on Store Audit page

## Command Reference

### Python API

```bash
# Install dependencies
pip install -r requirements.txt

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Start API server
python store_analyzer_api.py

# Test health endpoint
curl http://localhost:5000/health
```

### Frontend Integration

```bash
# Add environment variable
echo VITE_API_URL=http://localhost:5000 >> .env.local

# Install packages (if needed)
npm install

# Run dev server
npm run dev

# Run with Bun
bun run dev
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Check API status |
| POST | `/api/analyze-store` | Analyze store and generate report |
| POST | `/api/validate-store` | Validate store URL format |
| POST | `/api/store-info` | Get basic store information |

## Frontend Service Usage

```typescript
import { analyzeStore, validateStoreUrl } from "@/services/storeAnalyzerService";

// Analyze store
const result = await analyzeStore({ store_url: "https://example.myshopify.com" });
console.log(result.analysis.overall_score); // e.g., 78

// Validate URL
const validation = await validateStoreUrl("https://example.myshopify.com");
console.log(validation.valid); // true or false
```

## Expected Response

```json
{
  "success": true,
  "url": "https://example.myshopify.com",
  "store_info": {
    "title": "Store Name",
    "meta_description": "Store description",
    "response_time_seconds": 2.34,
    "https_enabled": true
  },
  "analysis": {
    "overall_score": 78,
    "audit_report": "Detailed audit report...",
    "analyzed_at": "2024-12-30T10:30:00.000000"
  }
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API not found (404) | Ensure Python server running on port 5000 |
| CORS error | Check frontend .env has correct VITE_API_URL |
| Invalid API key | Verify LOVABLE_API_KEY in .env file |
| Timeout | Analysis can take 30-60 seconds, be patient |
| Port 5000 in use | Kill existing process: `netstat -ano \| findstr :5000` |

## Important Notes

1. **API Key Required**: Set LOVABLE_API_KEY in .env to use AI features
2. **CORS Enabled**: API accepts requests from any origin in development
3. **Timeout**: Analysis can take 30-60 seconds for first request
4. **Rate Limiting**: No built-in rate limit (add for production)
5. **Local Testing**: Both API and frontend must run for full functionality

## Component Changes

Key updates to StoreAudit component:
- Added `handleAnalyze()` function to call Python API
- Added loading state with spinner
- Display actual store info instead of hardcoded data
- Show AI-generated audit report
- Dynamic score display with color coding
- Error handling with toast notifications

## Performance Tips

1. **Caching**: Add Redis/database caching for repeated analyses
2. **Async**: Analysis runs asynchronously, UI remains responsive
3. **Lazy Loading**: Report text uses scrollable container
4. **Debouncing**: Consider debouncing URL input changes

## Security Considerations

- [ ] Keep API keys in .env, not in code
- [ ] Use HTTPS in production
- [ ] Implement authentication if exposed publicly
- [ ] Add rate limiting (production)
- [ ] Validate/sanitize all user inputs
- [ ] Use CORS headers appropriately

## Next Steps

After setup:
1. Test basic functionality
2. Customize analysis criteria
3. Add database integration
4. Implement caching
5. Deploy to production

---

**Need Help?** See INTEGRATION_GUIDE.md for detailed instructions
