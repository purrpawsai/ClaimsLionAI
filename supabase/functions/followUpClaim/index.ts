// Receives user question, resumes thread using stored messages[]
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  const { convoId, newUserMessage } = await req.json();
  if (!convoId || !newUserMessage) return new Response(JSON.stringify({ error: "Missing fields" }), { 
    status: 400,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

  const { data, error } = await supabase
    .from("claims_conversations")
    .select("messages")
    .eq("id", convoId)
    .single();

  if (error || !data) return new Response(JSON.stringify({ error: "Conversation not found" }), { 
    status: 404,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

  const messages = [...data.messages, { role: "user", content: newUserMessage }];

  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": Deno.env.get("CLAUDE_API_KEY")!,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "claude-3-opus-20240229", max_tokens: 4000, messages })
  });

  const { content } = await claudeRes.json();
  const aiReply = content?.[0]?.text || "";

  messages.push({ role: "assistant", content: aiReply });

  await supabase
    .from("claims_conversations")
    .update({ messages, last_ai_response: aiReply })
    .eq("id", convoId);

  return new Response(JSON.stringify({ reply: aiReply }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
});