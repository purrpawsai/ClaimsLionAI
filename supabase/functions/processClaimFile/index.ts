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
  const supabase = createClient(
    Deno.env.get("PROJECT_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!
  );

  const { fileUrl } = await req.json();
  if (!fileUrl) {
    return new Response(JSON.stringify({ error: "Missing fileUrl" }), { 
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  // 1. Create pending analysis entry
  const analysisInsert = await supabase.from("analysis_results").insert({
    filename: fileUrl.split('/').pop() || 'unknown',
    file_url: fileUrl,
    json_response: {},
    status: "pending",
    analysis_summary: null,
    started_processing_at: new Date().toISOString(),
  }).select("id").single();

  const analysisId = analysisInsert.data?.id;
  if (!analysisId) {
    return new Response(JSON.stringify({ error: "Failed to create analysis entry" }), { 
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
  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": Deno.env.get("CLAUDE_API_KEY")!,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      messages,
    }),
  });

  if (!claudeRes.ok) {
    const errorText = await claudeRes.text();
    console.error("Claude API error:", errorText);
    
    // Update analysis with error
    await supabase.from("analysis_results")
      .update({
        status: "error",
        error_message: `Claude API error: ${errorText}`,
      })
      .eq("id", analysisId);
    
    return new Response(JSON.stringify({ error: "Claude API failed", details: errorText }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  const { content } = await claudeRes.json();
  const aiReply = content?.[0]?.text || "";
  
  // Parse the AI response as JSON
  let parsedResponse;
  try {
    parsedResponse = JSON.parse(aiReply);
  } catch (e) {
    parsedResponse = { error: "Failed to parse AI response", raw_response: aiReply };
  }

  // 5. Update analysis with AI response
  await supabase.from("analysis_results")
    .update({
      json_response: parsedResponse,
      status: "complete",
      analysis_summary: aiReply.substring(0, 500), // First 500 chars as summary
      analyzed_at: new Date().toISOString(),
    })
    .eq("id", analysisId);

  return new Response(JSON.stringify({ analysisId, result: aiReply }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
});