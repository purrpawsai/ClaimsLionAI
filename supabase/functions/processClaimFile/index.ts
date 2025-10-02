// supabase/functions/processClaimFile.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";
import { CLAIMS_LION_AI_PROMPT } from "../lib/ClaimsLionAIPrompt.ts"; // ⬅️ IMPORT FROM LIB

// CORS headers to allow frontend origin
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://claimslionai.netlify.app", // ✅ Match this to your frontend exactly
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Expose-Headers": "*",
};

serve(async (req) => {
  // 🔁 Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS request received");
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }
  
  console.log("🚀 processClaimFile started");
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase environment variables");
      throw new Error("Missing Supabase environment variables");
    }
    
    console.log("✅ Supabase client created");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { fileUrl, region } = await req.json();
    console.log("📥 Request payload:", { fileUrl, region });
    if (!fileUrl || !region) {
      console.error("❌ Missing fields:", { fileUrl, region });
      return new Response(JSON.stringify({ error: "Missing fields" }), { 
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // 1. Create pending conversation entry
    console.log("📝 Creating conversation record...");
    const convoInsert = await supabase.from("claims_conversations").insert({
      region,
      file_url: fileUrl,
      messages: [],
      last_ai_response: null,
      status: "pending",
    }).select("id").single();

    console.log("📊 Insert result:", convoInsert);

    const convoId = convoInsert.data?.id;
    if (!convoId) {
      console.error("❌ Failed to create conversation:", convoInsert.error);
      return new Response(JSON.stringify({ 
        error: "Failed to create conversation", 
        details: convoInsert.error?.message 
      }), { 
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }
    
    console.log("✅ Conversation created:", convoId);

    // 🚀 Return immediately with convoId - processing continues in background
    console.log("🔄 Returning convoId immediately, processing in background...");
    
    // Start background processing (don't await)
    processFileInBackground(convoId, fileUrl, supabase);

    return new Response(JSON.stringify({ convoId, status: "pending" }), {
      status: 202, // Accepted - processing started
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("💥 ERROR:", err.message, err.stack);
    return new Response(JSON.stringify({ error: "Unexpected server error", details: err.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

// 🔄 Background processing function
async function processFileInBackground(
  convoId: string,
  fileUrl: string,
  supabase: SupabaseClient
) {
  try {
    // 2. Fetch and parse Excel file
    console.log("📥 [Background] Fetching file from storage:", fileUrl);
    const fileRes = await fetch(fileUrl);
    console.log("📄 [Background] File fetch status:", fileRes.status);
    
    const buf = new Uint8Array(await fileRes.arrayBuffer());
    console.log("📦 [Background] File size:", buf.length, "bytes");
    
    // Check file size limit (10MB max to avoid memory issues)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (buf.length > MAX_FILE_SIZE) {
      console.error("❌ [Background] File too large:", buf.length, "bytes");
      await supabase.from("claims_conversations")
        .update({
          status: "error",
          last_ai_response: `File too large: ${(buf.length / 1024 / 1024).toFixed(2)}MB. Maximum allowed is 10MB.`,
        })
        .eq("id", convoId);
      return;
    }
    
    const workbook = XLSX.read(buf, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    console.log("📊 [Background] Parsed", rows.length, "rows from spreadsheet");

    // 3. Construct user message with external prompt
    const userMessage = {
      role: "user",
      content: `${CLAIMS_LION_AI_PROMPT}\n\n${JSON.stringify(rows.slice(0, 500))}`,
    };
    const messages = [userMessage];
    console.log("📝 [Background] Message constructed, length:", userMessage.content.length);

    // 4. Send to Claude API
    const claudeApiKey = Deno.env.get("CLAUDE_API_KEY");
    if (!claudeApiKey) {
      console.error("❌ [Background] Missing CLAUDE_API_KEY");
      await supabase.from("claims_conversations")
        .update({
          status: "error",
          last_ai_response: "Missing CLAUDE_API_KEY configuration",
        })
        .eq("id", convoId);
      return;
    }
    
    console.log("🤖 [Background] Calling Claude API...");
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages,
      }),
    });

    console.log("📡 [Background] Claude response status:", claudeRes.status);
    
    if (!claudeRes.ok) {
      const errorText = await claudeRes.text();
      console.error("❌ [Background] Claude API error:", errorText);
      await supabase.from("claims_conversations")
        .update({
          status: "error",
          last_ai_response: `Claude API error: ${errorText}`,
        })
        .eq("id", convoId);
      return;
    }
    
    const claudeData = await claudeRes.json();
    console.log("📊 [Background] Claude response received");
    
    const { content } = claudeData;
    const aiReply = content?.[0]?.text || "";
    console.log("📝 [Background] AI reply length:", aiReply.length);
    
    const finalMessages = [userMessage, { role: "assistant", content: aiReply }];

    // 5. Update conversation with AI response
    console.log("💾 [Background] Updating conversation with results...");
    await supabase.from("claims_conversations")
      .update({
        messages: finalMessages,
        last_ai_response: aiReply,
        status: "complete",
      })
      .eq("id", convoId);

    console.log("✅ [Background] Analysis complete!");
  } catch (err) {
    console.error("💥 [Background] ERROR:", err.message, err.stack);
    await supabase.from("claims_conversations")
      .update({
        status: "error",
        last_ai_response: `Processing error: ${err.message}`,
      })
      .eq("id", convoId);
  }
}