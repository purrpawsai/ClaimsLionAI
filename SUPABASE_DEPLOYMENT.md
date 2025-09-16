# 🚀 Supabase Edge Function Deployment Guide

## **Step 1: Install Supabase CLI**

```bash
# Windows (using npm)
npm install -g supabase

# Or download from: https://github.com/supabase/cli/releases
```

## **Step 2: Login to Supabase**

```bash
supabase login
```

## **Step 3: Link Your Project**

```bash
# Get your project reference from Supabase dashboard
supabase link --project-ref YOUR_PROJECT_REF
```

## **Step 4: Deploy the Edge Function**

```bash
supabase functions deploy process-analysis
```

## **Step 5: Set Environment Variables**

In your Supabase dashboard:
1. Go to Settings → Edge Functions
2. Add these environment variables:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `SUPABASE_URL` - Your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key

## **Step 6: Test the Function**

```bash
# Test locally
supabase functions serve process-analysis

# Test deployed function
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-analysis \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "test-id"}'
```

## **Architecture Flow:**

1. **Frontend uploads file** → Netlify function creates job
2. **Netlify analysis function** → Calls Supabase Edge Function
3. **Supabase Edge Function** → Processes file in background (no timeout!)
4. **Frontend polls** → Checks for results

## **Benefits:**

✅ **No timeout limits** - Edge Functions can run for minutes
✅ **No additional hosting** - Runs on Supabase infrastructure  
✅ **Automatic scaling** - Handles any file size
✅ **Cost effective** - Uses Supabase's free tier

## **Troubleshooting:**

- **Function not found**: Make sure you deployed to the correct project
- **Environment variables**: Check they're set in Supabase dashboard
- **CORS issues**: Edge Functions handle CORS automatically
- **Rate limits**: Edge Functions have higher limits than Netlify 