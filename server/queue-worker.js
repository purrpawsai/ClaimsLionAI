// server/queue-worker.js
// Express worker service for processing queue tasks

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Claude API configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 4000;

// ClaimsLion AI Prompt
const CLAIMS_LION_AI_PROMPT = `
🔥 ClaimsLion AI – Oracle Mode (with JSON Output)
You are ClaimsLion AI – Oracle Mode, an elite claims intelligence engine trained to detect financial leakage, pricing errors, and fraud signals in large-scale auto insurance datasets.
You are not summarizing rows. You are uncovering what no one else sees.

The dataset may vary in structure. It may include columns like:
• Claim ID, Policy #, Policy Type (Comp. vs TP), Issue/Expiry Date
• Vehicle Make, Model, Year, inferred Type (truck, sedan, SUV)
• Region / Branch
• Premium fields: GWP, NWP, Earned Premium, UPR
• Claim Amount, Claim Date, Claim Status
• Gender, Age, Marital Status
• Loyalty Discount %, NCD %, IBAN, Submission Method, Assessor
• Free-text or incomplete fields (e.g. vehicle = "????")

🎯 Your Goal:
Return a list of structured insights based on this data. Each insight must reveal a non-obvious pattern, a pricing logic flaw, or a fraud signal that a human analyst would likely miss.

🧠 For each insight, output the following JSON structure:
[
  {
    "Title": "Trucks Priced Like Sedans in Riyadh",
    "Category": "Pricing Mismatch",
    "PatternSummary": "Trucks in Riyadh have similar average premiums to sedans but double the average claim amount.",
    "SupportingEvidence": {
      "VehicleType": {
        "Truck": {
          "AvgPremium_SR": 1200,
          "AvgClaim_SR": 7400,
          "Count": 213
        },
        "Sedan": {
          "AvgPremium_SR": 1150,
          "AvgClaim_SR": 3200,
          "Count": 987
        }
      },
      "Region": "Riyadh"
    },
    "PossibleExplanations": [
      "Vehicle type misclassification in pricing model",
      "Legacy pricing table not adjusted for commercial usage rates"
    ],
    "SuggestedAction": "Flag pricing model for review; perform targeted re-rating of trucks in Riyadh.",
    "MatchingIDs": ["CLM3421", "CLM3498", "CLM3502"]
  }
]

💰 Notes:
• All financial fields (e.g. GWP, NWP, Claim Amount) are in Saudi Riyals (SR)
• Use "AvgPremium_SR", "AvgClaim_SR", etc. to explicitly tag all currency metrics in output
• MatchingIDs should include any Claim ID or Policy Number relevant to the insight

🚫 What Not to Do:
• Don't summarize every row
• Don't generate vague or generic observations
• Don't return incomplete or unstructured thoughts
• Don't fabricate metrics — if unsure, exclude that subfield or say "unknown"

Ask yourself after every pass:
"What is silently costing this insurer millions?"
"What would a smart actuary find humiliating here?"
Then unleash your structured JSON killshot.
`;

// Process a single queue task
async function processQueueTask(task) {
  const startTime = Date.now();
  console.log(`🔄 Processing task ${task.id}: ${task.filename}`);
  
  try {
    // 1. Update task status to processing
    await supabase
      .from('processing_queue')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', task.id);

    // 2. Fetch file from Supabase Storage
    console.log(`📥 Fetching file: ${task.file_url}`);
    const fileResponse = await fetch(task.file_url);
    
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
    }

    const fileBuffer = await fileResponse.buffer();
    console.log(`📦 File size: ${fileBuffer.length} bytes`);

    // 3. Check file size limit (50MB max)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB. Maximum allowed is 50MB.`);
    }

    // 4. Parse Excel file
    console.log('📊 Parsing Excel file...');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    
    console.log(`📈 Parsed ${rows.length} rows from spreadsheet`);

    // 5. Optimize data for Claude (reduce token usage)
    const optimizedData = rows.map(row => {
      // Keep only essential fields and compress keys
      const compressed = {};
      Object.keys(row).forEach(key => {
        const value = row[key];
        if (value !== null && value !== undefined && value !== '') {
          // Compress common field names
          const compressedKey = key.toLowerCase()
            .replace(/policy/gi, 'pol')
            .replace(/premium/gi, 'pr')
            .replace(/claim/gi, 'cl')
            .replace(/vehicle/gi, 'vh')
            .replace(/region/gi, 'r')
            .replace(/amount/gi, 'amt')
            .replace(/date/gi, 'dt')
            .replace(/type/gi, 't')
            .replace(/id/gi, 'id')
            .substring(0, 10); // Limit key length
          
          compressed[compressedKey] = value;
        }
      });
      return compressed;
    });

    // 6. Construct prompt with optimized data
    const prompt = `${CLAIMS_LION_AI_PROMPT}\n\nDataset (${rows.length} rows):\n${JSON.stringify(optimizedData)}`;
    
    console.log(`📝 Prompt length: ${prompt.length} characters`);

    // 7. Call Claude API
    console.log('🤖 Calling Claude API...');
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      throw new Error(`Claude API error: ${claudeResponse.status} ${errorText}`);
    }

    const claudeData = await claudeResponse.json();
    const aiReply = claudeData.content?.[0]?.text || '';
    const tokensUsed = claudeData.usage?.total_tokens || 0;
    
    console.log(`📊 Claude response received (${tokensUsed} tokens)`);

    // 8. Parse AI response as JSON
    let parsedInsights;
    try {
      parsedInsights = JSON.parse(aiReply);
    } catch (e) {
      console.warn('⚠️ Failed to parse AI response as JSON, storing as text');
      parsedInsights = { error: 'Failed to parse AI response', raw_response: aiReply };
    }

    // 9. Create analysis result
    const processingTime = Math.round((Date.now() - startTime) / 1000);
    
    const { data: analysisResult, error: analysisError } = await supabase
      .from('analysis_results')
      .insert({
        queue_id: task.id,
        raw_ai_reply: aiReply,
        json_insights: parsedInsights,
        insights_summary: aiReply.substring(0, 500),
        processing_time_seconds: processingTime,
        claude_tokens_used: tokensUsed,
        status: 'complete'
      })
      .select('id')
      .single();

    if (analysisError) {
      throw new Error(`Failed to save analysis result: ${analysisError.message}`);
    }

    // 10. Update queue task as complete
    await supabase
      .from('processing_queue')
      .update({ 
        status: 'complete',
        completed_at: new Date().toISOString()
      })
      .eq('id', task.id);

    console.log(`✅ Task ${task.id} completed successfully in ${processingTime}s`);
    return { success: true, analysisId: analysisResult.id };

  } catch (error) {
    console.error(`❌ Task ${task.id} failed:`, error.message);
    
    // Update task with error
    await supabase
      .from('processing_queue')
      .update({ 
        status: 'error',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', task.id);

    // Create error analysis result
    await supabase
      .from('analysis_results')
      .insert({
        queue_id: task.id,
        status: 'error',
        error_message: error.message
      });

    return { success: false, error: error.message };
  }
}

// Process all pending tasks
async function processPendingTasks() {
  console.log('🔍 Checking for pending tasks...');
  
  try {
    // Get pending tasks ordered by priority and creation time
    const { data: tasks, error } = await supabase
      .from('processing_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5); // Process up to 5 tasks at a time

    if (error) {
      console.error('❌ Failed to fetch pending tasks:', error.message);
      return;
    }

    if (!tasks || tasks.length === 0) {
      console.log('✅ No pending tasks found');
      return;
    }

    console.log(`📋 Found ${tasks.length} pending tasks`);

    // Process tasks sequentially to avoid overwhelming Claude API
    for (const task of tasks) {
      await processQueueTask(task);
      // Small delay between tasks to be respectful to APIs
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

  } catch (error) {
    console.error('💥 Error in processPendingTasks:', error.message);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Manual trigger endpoint
app.post('/process-tasks', async (req, res) => {
  try {
    await processPendingTasks();
    res.json({ message: 'Processing completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Queue Worker started on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Manual trigger: POST http://localhost:${PORT}/process-tasks`);
});

// Auto-process tasks every 30 seconds
setInterval(processPendingTasks, 30000);

// Process tasks on startup
setTimeout(processPendingTasks, 5000);
