# 🚀 Getting Started in 5 Minutes

**Objective**: Get the Store Analyzer API running locally so you can analyze stores when clicking the "Analyze" button.

---

## ⏱️ Step 1: Install Python Packages (1 minute)

Open PowerShell and navigate to your project:

```powershell
cd c:\Users\user\Downloads\win-well-guide-main\win-well-guide-main

# Create Python virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**Expected Output**: `Successfully installed Flask-3.0.0 Flask-CORS-4.0.0 ...`

---

## ⏱️ Step 2: Configure API Key (30 seconds)

```powershell
# Copy template
copy .env.example .env

# Edit .env with your API key
notepad .env
```

Find the line with `LOVABLE_API_KEY=your_api_key_here` and replace with your actual key:
```
LOVABLE_API_KEY=your_actual_key_from_lovable
```

Save and close.

---

## ⏱️ Step 3: Start Python API (30 seconds)

In the **same PowerShell** terminal:

```powershell
python store_analyzer_api.py
```

**Expected Output**:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

✅ **API is now running on port 5000**

**Keep this terminal open!** Open a new PowerShell window for the next steps.

---

## ⏱️ Step 4: Update React Component (1 minute)

Open a **new PowerShell** terminal:

```powershell
cd c:\Users\user\Downloads\win-well-guide-main\win-well-guide-main

# Replace the component
copy src\pages\StoreAudit.updated.tsx src\pages\StoreAudit.tsx
```

Now add the environment variable:

```powershell
# Create or edit .env.local
notepad .env.local
```

Add this line:
```
VITE_API_URL=http://localhost:5000
```

Save and close.

---

## ⏱️ Step 5: Start Frontend (1 minute)

In the same PowerShell:

```powershell
npm run dev
```

or if using Bun:

```powershell
bun run dev
```

**Expected Output**:
```
  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

---

## ✅ You're Done! (Total: 5 minutes)

Now you can:

1. **Open your browser** to `http://localhost:3000` (or the URL shown)
2. **Navigate to Store Audit page**
3. **Enter a store URL** (e.g., `https://www.shopify.com`)
4. **Click the Analyze button**
5. **Wait 30-60 seconds**
6. **See the results!**

---

## 🧪 Quick Test

Test that everything works:

```powershell
# In a new PowerShell window:
curl http://localhost:5000/health

# Should see:
# {"status":"healthy","api_version":"1.0",...}
```

---

## ❓ Troubleshooting (30 seconds each)

### "Address already in use"
```powershell
# Kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "ModuleNotFoundError"
```powershell
# Make sure virtual environment is activated
venv\Scripts\activate
pip install -r requirements.txt
```

### "API key error"
- Verify LOVABLE_API_KEY in .env is correct
- Ensure no spaces around the = sign

### "Frontend won't connect"
- Verify API is running: `curl http://localhost:5000/health`
- Check .env.local has correct VITE_API_URL
- Restart frontend with `npm run dev`

---

## 📊 What's Running Now

| Component | URL | Status |
|-----------|-----|--------|
| Python API | http://localhost:5000 | ✅ Running |
| React App | http://localhost:3000 | ✅ Running |
| Store Website | https://example.com | ✅ (via API) |
| AI Analysis | Lovable Gateway | ✅ (via API) |

---

## 🎯 What Happens When You Click Analyze

```
You click Analyze
    ↓
Frontend sends store URL to Python API
    ↓
Python API validates URL
    ↓
Python API fetches store data (HTML)
    ↓
Python API calls Lovable AI with analysis prompt
    ↓
AI generates CRO audit report + score
    ↓
Frontend receives results
    ↓
Results display on page
    ↓
You see: Score, Store Info, and Detailed Report
```

---

## 📚 Next Steps

After confirming it works:

1. **Test with different stores** - Try various URLs
2. **Check the audit report** - See what the AI generates
3. **Read the documentation** - See [README_INDEX.md](README_INDEX.md)
4. **Customize the analysis** - Edit prompts in store_analyzer_api.py
5. **Deploy to production** - See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Start API | `python store_analyzer_api.py` |
| Start Frontend | `npm run dev` |
| Test API | `curl http://localhost:5000/health` |
| Activate venv | `venv\Scripts\activate` |
| Run tests | `python test_api.py` |
| Install packages | `pip install -r requirements.txt` |

---

## 🎓 Key Concepts

- **API (Python)**: Listens on port 5000, processes store analysis
- **Frontend (React)**: Listens on port 3000, shows results to user
- **CORS**: Allows frontend to call API
- **Lovable API**: Provides AI analysis capability
- **.env files**: Store sensitive configuration (API keys)

---

## ✨ That's It!

You now have a fully functional store analyzer:
- ✅ Python backend analyzing stores
- ✅ React frontend displaying results
- ✅ AI-powered insights
- ✅ Real-time score and reports

**Enjoy analyzing stores!** 🎉

---

## 💡 Pro Tips

1. **First analysis takes longer** (30-60s) because of AI processing
2. **Keep both terminals open** - One for API, one for frontend
3. **Check browser console** - Press F12 to see network requests
4. **Read the audit report** - It contains detailed recommendations
5. **Change the prompt** - Edit `store_analyzer_api.py` for different analysis type

---

## 📖 Documentation

- **Full Setup**: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- **API Details**: [STORE_ANALYZER_API_README.md](STORE_ANALYZER_API_README.md)
- **Quick Reference**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **All Docs**: [README_INDEX.md](README_INDEX.md)

---

**Ready?** Start with Step 1 above! ⬆️
