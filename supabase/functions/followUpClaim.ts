// Receives user question, resumes thread using stored messages[]
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("PROJECT_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!
  );

  const { convoId, newUserMessage } = await req.json();
  if (!convoId || !newUserMessage) return new Response("Missing fields", { status: 400 });

  const { data, error } = await supabase
    .from("claims_conversations")
    .select("messages")
    .eq("id", convoId)
    .single();

  if (error || !data) return new Response("Conversation not found", { status: 404 });

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
    headers: { "Content-Type": "application/json" },
  });
});