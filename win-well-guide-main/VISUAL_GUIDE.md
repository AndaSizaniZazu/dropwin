# Store Analyzer API - Visual Setup Guide

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        YOUR BROWSER                             │
│  http://localhost:3000 (Vite Dev Server)                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ React Application                                         │  │
│  │ ┌────────────────────────────────────────────────────┐   │  │
│  │ │ Store Audit Page                                    │   │  │
│  │ │ ┌──────────────────────────────────────────────┐   │   │  │
│  │ │ │ Enter Store URL: [https://..............]    │   │   │  │
│  │ │ │                                          [Analyze] │   │   │  │
│  │ │ └──────────────────────────────────────────────┘   │   │  │
│  │ │                                                      │   │  │
│  │ │ Results:                                            │   │  │
│  │ │ Score: 78 ████████░                                │   │  │
│  │ │ Store: Example Store                              │   │  │
│  │ │ Report: AI audit results...                        │   │  │
│  │ └────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────┬───────────────────────────────────────────────┘
                 │ HTTP POST
                 │ /api/analyze-store
                 │ {"store_url": "..."}
                 ▼
┌────────────────────────────────────────────────────────────────┐
│                    PYTHON FLASK API                             │
│  http://localhost:5000                                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ store_analyzer_api.py                                   │  │
│  │                                                           │  │
│  │ 1. Validate URL ──────────┐                             │  │
│  │    - Check format          │                            │  │
│  │    - Basic validation      │                            │  │
│  │                            ▼                            │  │
│  │ 2. Fetch Store Data ───────┐                           │  │
│  │    - GET store website      │ HTTP GET               │  │
│  │    - Parse HTML             │ ──────────────┐        │  │
│  │    - Extract title, meta    │               │        │  │
│  │    - Measure response time  │               │        │  │
│  │                            ▼               │        │  │
│  │ 3. Call AI Gateway ────────┐             │        │  │
│  │    - Send analysis prompt   │ HTTP POST  │        │  │
│  │    - Use Gemini 2.5 Flash   │ ──────────────┐     │  │
│  │    - Wait for response      │               │     │  │
│  │                            ▼               │     │  │
│  │ 4. Extract Score ──────────────────────────┐    │  │
│  │    - Parse audit report                    │    │  │
│  │    - Find numerical score                  │    │  │
│  │                                            ▼    │  │
│  │ 5. Return Results ◄─────────────────────────┘    │  │
│  │    - Store info                                  │  │
│  │    - Score (0-100)                              │  │
│  │    - Audit report                               │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬──────────┬────────────────────────────┘
                 │          │
                 │          │ HTTP GET
                 │          └──────────────┐
                 │ HTTP POST               │
                 │ /v1/chat/completions    │
                 ▼                         ▼
    ┌─────────────────────┐    ┌────────────────────┐
    │ Target Store        │    │ Lovable AI Gateway │
    │ https://example.... │    │ (Google Gemini)    │
    │                     │    │                    │
    │ - Fetches HTML      │    │ - Analyzes data    │
    │ - Extracts data     │    │ - Generates report │
    │ - Returns title,    │    │ - Scores store     │
    │   description, etc. │    │ - Returns analysis │
    └─────────────────────┘    └────────────────────┘
```

## File Integration Map

```
React Frontend
│
├─ Component: src/pages/StoreAudit.tsx
│  │
│  └─ imports: storeAnalyzerService
│     │
│     └─ Service: src/services/storeAnalyzerService.ts
│        │
│        └─ Calls HTTP POST to API
│           │
│           ▼
Python Backend
│
├─ API: store_analyzer_api.py
│  │
│  ├─ POST /api/analyze-store
│  │  ├─ Validates URL
│  │  ├─ Fetches store data
│  │  ├─ Calls AI gateway
│  │  └─ Returns analysis
│  │
│  ├─ POST /api/validate-store
│  │  └─ Validates URL format
│  │
│  ├─ POST /api/store-info
│  │  └─ Returns basic info
│  │
│  └─ GET /health
│     └─ Returns health status
│
├─ Config: .env
│  └─ LOVABLE_API_KEY=...
│
└─ Dependencies: requirements.txt
   ├─ Flask
   ├─ requests
   ├─ python-dotenv
   └─ Flask-CORS
```

## Setup Flow Diagram

```
START
  │
  ▼
┌─────────────────────────────┐
│ 1. INSTALL PYTHON           │
│    python -m venv venv      │
│    venv\Scripts\activate    │
│    pip install -r           │
│    requirements.txt         │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 2. CONFIGURE ENV            │
│    cp .env.example .env     │
│    Edit .env file           │
│    Add LOVABLE_API_KEY      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 3. START PYTHON API         │
│    python                   │
│    store_analyzer_api.py    │
│    (Port 5000)              │
└──────┬──────────────────────┘
       │
       ├─ ✅ Check: curl /health
       │
       ▼
┌─────────────────────────────┐
│ 4. UPDATE REACT             │
│    Copy StoreAudit.updated  │
│    to StoreAudit.tsx        │
│    Add frontend env var     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 5. START FRONTEND           │
│    npm run dev              │
│    (or bun run dev)         │
│    (Port 3000)              │
└──────┬──────────────────────┘
       │
       ├─ ✅ Check: http://localhost:3000
       │
       ▼
┌─────────────────────────────┐
│ 6. TEST INTEGRATION         │
│    Open Store Audit page    │
│    Enter store URL          │
│    Click Analyze            │
│    See results              │
└──────┬──────────────────────┘
       │
       ▼
   SUCCESS! 🎉
```

## Data Flow for Analysis Request

```
USER CLICK                          NETWORK REQUEST
│                                   │
▼                                   ▼
┌────────────────────┐        ┌──────────────────┐
│ Click "Analyze"    │──────▶ │ POST /api/       │
│ button on page     │        │ analyze-store    │
│                    │        │ {store_url: ...} │
└────────────────────┘        └────────┬─────────┘
                                       │
                              VALIDATION & PROCESSING
                                       │
                      ┌────────────────┼────────────────┐
                      │                │                │
                      ▼                ▼                ▼
            ┌──────────────┐  ┌──────────────┐  ┌────────────┐
            │ 1. Validate  │  │ 2. Fetch     │  │ 3. Analyze │
            │    URL       │  │    Store     │  │    with AI │
            │ ✅ Pass      │  │ ✅ Get HTML  │  │ ✅ Score   │
            └──────┬───────┘  └──────┬───────┘  └──────┬─────┘
                   │                 │                 │
                   └─────────────────┴─────────────────┘
                                     │
                        RESPONSE ASSEMBLY
                                     │
                      ┌──────────────▼──────────────┐
                      │ Return JSON Response:       │
                      │ {                           │
                      │   success: true             │
                      │   store_info: { ... }       │
                      │   analysis: {               │
                      │     score: 78               │
                      │     report: "..."           │
                      │   }                         │
                      │ }                           │
                      └──────────────┬──────────────┘
                                     │
                        FRONTEND RECEIVES RESPONSE
                                     │
                      ┌──────────────▼──────────────┐
                      │ Frontend Service:           │
                      │ 1. Parse JSON               │
                      │ 2. Extract score            │
                      │ 3. Display in component     │
                      │ 4. Update UI with results   │
                      └──────────────┬──────────────┘
                                     │
                            USER SEES RESULTS
                                     │
                      ┌──────────────▼──────────────┐
                      │ Display:                    │
                      │ • Store title               │
                      │ • Overall score (78)        │
                      │ • Score gauge with color    │
                      │ • Detailed audit report     │
                      │ • Store metadata            │
                      └─────────────────────────────┘
```

## Component Hierarchy

```
App (React Router)
│
└─ StoreAudit.tsx
   │
   ├─ Header
   │  └─ Title + Back Button
   │
   ├─ Input Section
   │  ├─ Input field (store URL)
   │  └─ Analyze Button
   │     └─ onclick: handleAnalyze()
   │        └─ calls: analyzeStore()
   │           └─ from: storeAnalyzerService
   │              └─ HTTP POST to: /api/analyze-store
   │
   └─ Results Section (if isAnalyzed)
      │
      ├─ Loading State
      │  └─ Show spinner while analyzing
      │
      ├─ Store Info Card
      │  ├─ Title
      │  ├─ URL
      │  ├─ Response time
      │  └─ HTTPS status
      │
      ├─ Score Card
      │  ├─ Overall score (0-100)
      │  ├─ Score gauge visualization
      │  └─ Rating (Excellent/Good/Fair/Needs Improvement)
      │
      ├─ Audit Report Card
      │  └─ Detailed analysis text
      │
      ├─ Branding Match Card
      │  └─ Checklist of criteria
      │
      ├─ Saturation Heatmap Card
      │  └─ Regional breakdown
      │
      └─ Profit Calculator Card
         └─ Financial breakdown
```

## Environment Configuration

```
.env (Backend - Python)                .env.local (Frontend - React)
├─ LOVABLE_API_KEY=sk-...             ├─ VITE_API_URL=
├─ FLASK_ENV=development               │  http://localhost:5000
├─ PORT=5000                           │
└─ DEBUG=True                          └─ (optional)

Used by: store_analyzer_api.py         Used by: storeAnalyzerService.ts
```

## Deployment Architecture (Example: Docker)

```
┌──────────────────────────────────────────────────┐
│           Docker Container                       │
│                                                  │
│ ┌──────────────────────────────────────────────┐│
│ │ Python Flask API (Gunicorn)                  ││
│ │ Port 5000                                    ││
│ │                                              ││
│ │ Listens for POST requests:                   ││
│ │ /api/analyze-store                           ││
│ │ /api/validate-store                          ││
│ │ /api/store-info                              ││
│ │ /health                                      ││
│ └──────────────────────────────────────────────┘│
│                                                  │
│ Environment:                                    │
│ - LOVABLE_API_KEY (from secrets)               │
│ - FLASK_ENV=production                         │
│ - PORT=5000                                    │
└──────────────────────────────────────────────────┘
         │
         │ Port mapping: 5000:5000
         │
┌────────▼────────────────────┐
│ External Network            │
│                             │
│ Frontend can call:          │
│ http://api:5000/api/...     │
│ (in same network)           │
└─────────────────────────────┘
```

## Error Handling Flow

```
User Action
│
▼
┌─────────────────────────────┐
│ Validate URL                │
└────┬────────────────────────┘
     │
  Success? ──NO──▶ Show error toast: "Invalid URL"
     │            Return to input
     YES
     │
     ▼
┌─────────────────────────────┐
│ Call API                    │
└────┬────────────────────────┘
     │
  Success? ──NO──▶ Check error type
     │            │
     YES          ├─ API not running ──▶ "Connection failed"
     │            ├─ Rate limited (429) ──▶ "Please try again later"
     │            ├─ No credits (402) ──▶ "Add credits to account"
     │            └─ Other ──▶ "Analysis failed"
     │
     ▼
┌─────────────────────────────┐
│ Display Results             │
│ - Score                     │
│ - Report                    │
│ - Store info                │
└─────────────────────────────┘
```

## Key Concepts Visualization

```
FRONTEND                BACKEND                 EXTERNAL
(React)                (Python)                (Internet)
│                      │                      │
│                      │                      │
User enters URL ──────▶ Validate              │
   │                   ├─ Format check        │
   │                   └─ Return valid/invalid
   │                      │
   User clicks────────▶ Fetch Data            │
   Analyze             ├─ HTTP GET ───────────▶ Store Website
   │                   ├─ Parse HTML          │
   │                   └─ Extract info        │
   │                      │
   │                   Analyze               │
   │                   ├─ HTTP POST ─────────▶ Lovable AI
   │                   ├─ Send prompt         │
   │                   ├─ Receive analysis    │
   │                   ├─ Extract score       │
   │                   └─ Return results      │
   │                      │
   ◀─────────────────── Response JSON
   │
   Display Results
   ├─ Store info
   ├─ Overall score
   ├─ Audit report
   └─ Visualizations
```

---

This visual guide helps you understand the complete flow from user interaction through API calls to final results display.
