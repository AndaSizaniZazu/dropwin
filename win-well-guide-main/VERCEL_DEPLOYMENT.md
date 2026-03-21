# Vercel Deployment Guide

## Overview
This project has two parts:
- **Frontend**: React/TypeScript with Vite (Deploys to Vercel)
- **Backend**: FastAPI/Python (Deploys to separate service)

## Prerequisites
- Vercel account (https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Backend hosting service (Railway, Render, or Heroku)

---

## Part 1: Deploy Backend

### Option A: Deploy to Railway.app (Recommended - Free tier available)

1. **Create Railway account**: https://railway.app
2. **Connect GitHub**: Authorize Railway to access your repo
3. **Create new project from GitHub**
4. **Create `Procfile`** in root:
   ```
   web: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. **Add environment variables** in Railway dashboard (if needed)
6. **Deploy** - Railway auto-deploys on git push
7. **Get backend URL**: Copy the generated Railway URL (e.g., `https://your-app.railway.app`)

### Option B: Deploy to Render.com

1. **Create Render account**: https://render.com
2. **New Web Service** from GitHub
3. **Settings**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Deploy**
5. **Get backend URL**: Copy the Render URL

### Option C: Deploy to Heroku

1. **Install Heroku CLI**
2. **Create `Procfile`**:
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. **Deploy**: `heroku create` and `git push heroku main`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Connect to Vercel
1. **Go to https://vercel.com/dashboard**
2. **Click "New Project"**
3. **Import from Git** - Select your repository
4. **Configure Project**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 3: Add Environment Variables
In Vercel project settings → Environment Variables:

Add: `VITE_API_URL` = `https://your-backend-url.com` (your Railway/Render backend URL)

### Step 4: Deploy
Click "Deploy" - Vercel will automatically build and deploy

---

## Part 3: Update Frontend API Configuration

Update `src/services/storeAnalyzerService.ts` to use the environment variable:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const researchProduct = async (data: any) => {
  const response = await fetch(`${API_URL}/api/research-product`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  // ... rest of function
};
```

---

## Part 4: Configure CORS on Backend

Update `app/main.py` to allow requests from your Vercel domain:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8081",
        "https://your-vercel-domain.vercel.app"  # Add your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Deployment URLs After Setup

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-app.railway.app` (or Render/Heroku equivalent)
- **API Calls**: Frontend → Backend URL via `VITE_API_URL`

---

## Testing After Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test Product Intel - should load TikTok trending products
3. Test search functionality on all platforms
4. Check browser console for any API errors

---

## Troubleshooting

### API calls returning 404
- Check `VITE_API_URL` environment variable is set correctly
- Verify backend is running and accessible
- Check CORS configuration on backend

### Build failing on Vercel
- Run `npm run build` locally to test
- Check Node.js version compatibility
- Verify all dependencies are installed

### Backend deployment issues
- Check logs in Railway/Render dashboard
- Verify `requirements.txt` has all dependencies
- Ensure port binding is correct (`$PORT` for Railway/Heroku, `5000` for Render)

---

## Environment Variables Needed

**Vercel (Frontend)**:
- `VITE_API_URL`: Backend URL

**Railway/Render (Backend)**:
- Add any API keys or sensitive data needed by your Python code

---

## Next Steps

1. Set up backend on Railway/Render/Heroku
2. Get backend URL
3. Update `vercel.json` with backend URL
4. Deploy to Vercel
5. Add `VITE_API_URL` environment variable
6. Test all functionality

For more help: https://vercel.com/docs
