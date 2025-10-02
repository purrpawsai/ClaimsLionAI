// supabase/functions/processClaimFile.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { fileUrl, region } = await req.json();
    if (!fileUrl || !region) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { 
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // 1. Create pending conversation entry
    const convoInsert = await supabase.from("claims_conversations").insert({
    region,
    file_url: fileUrl,
    messages: [],
    last_ai_response: null,
    status: "pending",
  }).select("id").single();

    const convoId = convoInsert.data?.id;
    if (!convoId) {
      return new Response(JSON.stringify({ error: "Failed to create conversation" }), { 
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // 2. Fetch and parse Excel file
    const fileRes = await fetch(fileUrl);
    const buf = new Uint8Array(await fileRes.arrayBuffer());
    const workbook = XLSX.read(buf, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // 3. Construct user message with external prompt
    const userMessage = {
      role: "user",
      content: `${CLAIMS_LION_AI_PROMPT}\n\n${JSON.stringify(rows.slice(0, 500))}`,
    };
    const messages = [userMessage];

    // 4. Send to Claude API
    const claudeApiKey = Deno.env.get("CLAUDE_API_KEY");
    if (!claudeApiKey) {
      throw new Error("Missing CLAUDE_API_KEY environment variable");
    }
    
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        messages,
      }),
    });

    const { content } = await claudeRes.json();
    const aiReply = content?.[0]?.text || "";
    const finalMessages = [userMessage, { role: "assistant", content: aiReply }];

    // 5. Update conversation with AI response
    await supabase.from("claims_conversations")
      .update({
        messages: finalMessages,
        last_ai_response: aiReply,
        status: "complete",
      })
      .eq("id", convoId);

    return new Response(JSON.stringify({ convoId, result: aiReply }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Unexpected server error", details: err.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});