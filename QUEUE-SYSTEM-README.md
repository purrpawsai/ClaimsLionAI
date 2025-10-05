# ClaimsLion AI - Queue-Based Processing System

## 🏗️ Architecture Overview

This system implements a queue-based processing architecture to handle large Excel files (70k+ rows) without choking Supabase Edge Functions.

### **Flow:**
```
Frontend → Supabase Storage → Edge Function (queue insert) → Express Worker → Claude → Results
```

## 📋 Components

### **1. Database Tables**
- `processing_queue`: Stores file processing tasks
- `analysis_results`: Stores AI analysis results

### **2. Supabase Edge Functions**
- `uploadClaimFile`: Uploads files to Supabase Storage
- `processClaimFile`: Inserts tasks into processing queue
- `checkClaimStatus`: Checks queue status and results

### **3. Express Worker Service**
- `queue-worker.js`: Processes queued tasks, calls Claude API

### **4. Frontend**
- Updated to work with queue system and polling

## 🚀 Setup Instructions

### **Step 1: Create Database Tables**

Run the SQL schema in your Supabase dashboard:

```sql
-- Copy contents from database-schema.sql
```

### **Step 2: Deploy Edge Functions**

```bash
supabase functions deploy
```

### **Step 3: Setup Express Worker**

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Create `.env` file in the `server/` directory:**
```bash
# Copy this template and replace with your actual values
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CLAUDE_API_KEY=sk-ant-api03-your-actual-claude-key-here
PORT=3001
```

**Important:** 
- Replace `your-project-ref` with your actual Supabase project reference
- Get your service role key from Supabase Dashboard → Settings → API
- Get your Claude API key from Anthropic Console
- Never commit the `.env` file to version control

3. **Start the worker:**
```bash
npm start
```

### **Step 4: Test the System**

1. **Upload a file** through the frontend
2. **Check queue status** via the dashboard
3. **Monitor worker logs** for processing status

## 🔧 Configuration

### **Worker Settings**
- **Polling interval**: 30 seconds
- **Max file size**: 50MB
- **Max tasks per cycle**: 5
- **Retry attempts**: 3

### **Claude Settings**
- **Model**: claude-3-5-sonnet-20241022
- **Max tokens**: 4000
- **Context optimization**: Compressed field names

## 📊 Monitoring

### **Health Check**
```bash
curl http://localhost:3001/health
```

### **Manual Processing**
```bash
curl -X POST http://localhost:3001/process-tasks
```

### **Queue Status**
Check the `processing_queue` table in Supabase dashboard.

## 🎯 Benefits

✅ **No timeouts**: Express server has no processing limits
✅ **Scalable**: Can run multiple workers
✅ **Resilient**: Built-in retry and error handling
✅ **Cost-effective**: Only pay for actual processing time
✅ **Auditable**: Full job tracking and logging
✅ **Large files**: Can handle 70k+ row Excel files

## 🔄 Processing States

- `pending`: Task queued, waiting for processing
- `processing`: Currently being processed by worker
- `complete`: Processing finished successfully
- `error`: Processing failed (check error_message)
- `cancelled`: Task cancelled by user

## 🚨 Troubleshooting

### **Worker not processing tasks**
1. Check worker logs for errors
2. Verify environment variables
3. Check Claude API key and limits
4. Ensure database tables exist

### **Tasks stuck in pending**
1. Check if worker is running
2. Verify worker can connect to Supabase
3. Check for rate limiting on Claude API

### **Large files failing**
1. Check file size limits (50MB max)
2. Verify memory available on worker server
3. Consider chunking for very large files

## 📈 Performance Tips

1. **Optimize data**: Worker compresses field names to reduce token usage
2. **Batch processing**: Process multiple tasks sequentially
3. **Monitor resources**: Watch memory and CPU usage
4. **Scale workers**: Add more workers for higher throughput

## 🔮 Future Enhancements

- [ ] WebSocket for real-time updates
- [ ] Multiple worker scaling
- [ ] Result caching
- [ ] Advanced retry logic
- [ ] Performance metrics dashboard
