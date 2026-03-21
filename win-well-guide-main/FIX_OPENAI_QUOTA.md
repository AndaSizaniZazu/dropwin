# Fix OpenAI Quota Error (429 - Insufficient Quota)

## Error Message
```
Error code: 429 - insufficient_quota
You exceeded your current quota, please check your plan and billing details.
```

## What This Means
Your OpenAI API key doesn't have any credits or billing isn't set up. You need to add payment method and credits to your OpenAI account.

## How to Fix It

### Step 1: Check Your OpenAI Account
1. Go to [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
2. Log in to your OpenAI account

### Step 2: Add Payment Method
1. Click **"Add payment method"** or **"Set up billing"**
2. Add a credit card or other payment method
3. Verify your payment method

### Step 3: Add Credits
1. Go to **"Billing"** → **"Add credits"** or **"Usage"**
2. Add at least $5-10 in credits to start
3. The GPT-4o-mini model is very affordable (~$0.15 per 1M input tokens)

### Step 4: Verify Your Usage Limits
1. Check **"Usage limits"** in your account settings
2. Make sure you have:
   - **Rate limits** set appropriately
   - **Spending limits** if you want to cap usage
   - **Billing** properly configured

### Step 5: Test Your API Key
After adding credits, test your key:
```bash
python -c "import openai; import os; from dotenv import load_dotenv; load_dotenv(); client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY')); print('API key is working!')"
```

## Alternative: Use a Different API Key
If you have another OpenAI account with credits:
1. Get a new API key from that account
2. Update your `.env` file:
   ```
   OPENAI_API_KEY=sk-proj-your-new-key-here
   ```
3. Restart the API server

## Cost Information
- **GPT-4o-mini** (used by default): Very affordable
  - Input: ~$0.15 per 1M tokens
  - Output: ~$0.60 per 1M tokens
  - A typical store analysis costs **less than $0.01**

## Quick Check
Visit these URLs to check your account:
- **Billing**: https://platform.openai.com/account/billing
- **Usage**: https://platform.openai.com/usage
- **API Keys**: https://platform.openai.com/api-keys

## After Adding Credits
1. Restart your API server (it will pick up the same API key)
2. Try analyzing a store again
3. The error should be resolved!

## Need Help?
- OpenAI Support: https://help.openai.com/
- Billing FAQ: https://platform.openai.com/docs/guides/rate-limits


