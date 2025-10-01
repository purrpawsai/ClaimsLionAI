// supabase/functions/processClaimFile.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";
import { CLAIMS_LION_AI_PROMPT } from "../lib/ClaimsLionAIPrompt.ts"; // External Prompt

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("PROJECT_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!
  );

  let fileUrl: string | undefined;
  let region: string | undefined;

  try {
    const body = await req.json();
    fileUrl = body.fileUrl;
    region = body.region;

    // Debug log to help catch missing fields
    console.log("Incoming request body:", { fileUrl, region });

    if (!fileUrl || !region) {
      return new Response("Missing fields", { status: 400 });
    }
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  // 1. Insert pending conversation
  const convoInsert = await supabase
    .from("claims_conversations")
    .insert({
      region,
      file_url: fileUrl,
      messages: [],
      last_ai_response: null,
      status: "pending",
    })
    .select("id")
    .single();

  const convoId = convoInsert.data?.id;
  if (!convoId) {
    console.error("Failed to insert conversation row:", convoInsert.error);
    return new Response("DB insert failed", { status: 500 });
  }

  // 2. Fetch and parse Excel file
  const fileRes = await fetch(fileUrl);
  const buf = new Uint8Array(await fileRes.arrayBuffer());
  const workbook = XLSX.read(buf, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  // 3. Construct Claude prompt message
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

  const { content } = await claudeRes.json();
  const aiReply = content?.[0]?.text || "";
  const finalMessages = [userMessage, { role: "assistant", content: aiReply }];

  // 5. Update conversation with response
  await supabase
    .from("claims_conversations")
    .update({
      messages: finalMessages,
      last_ai_response: aiReply,
      status: "complete",
    })
    .eq("id", convoId);

  return new Response(JSON.stringify({ convoId, result: aiReply }), {
    headers: { "Content-Type": "application/json" },
  });
});