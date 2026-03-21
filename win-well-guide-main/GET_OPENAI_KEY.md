# How to Get Your OpenAI API Key

## Step-by-Step Guide

### 1. Create an OpenAI Account
- Go to [https://platform.openai.com](https://platform.openai.com)
- Sign up or log in to your account

### 2. Navigate to API Keys
- Once logged in, click on your profile icon (top right)
- Select **"API keys"** from the dropdown menu
- Or go directly to: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 3. Create a New API Key
- Click the **"+ Create new secret key"** button
- Give it a name (e.g., "Store Analyzer")
- Click **"Create secret key"**

### 4. Copy Your Key
- **IMPORTANT**: Copy the key immediately - you won't be able to see it again!
- It will look like: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 5. Add Credits (If Needed)
- Go to [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
- Add payment method and credits
- The agent uses GPT-4o-mini which is very cost-effective (~$0.15 per 1M input tokens)

### 6. Add to Your Project
1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your key:
   ```
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

## Security Notes
- ⚠️ **Never commit your `.env` file to git**
- ⚠️ **Never share your API key publicly**
- ✅ The `.env` file is already in `.gitignore`

## Pricing
- GPT-4o-mini (used by default): Very affordable
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- A typical store analysis costs less than $0.01

## Alternative: Use Environment Variable
You can also set it directly in your terminal:
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="sk-proj-your-key-here"

# Windows CMD
set OPENAI_API_KEY=sk-proj-your-key-here

# Linux/Mac
export OPENAI_API_KEY="sk-proj-your-key-here"
```


