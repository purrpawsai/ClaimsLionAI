// Pollable endpoint to check if analysis is complete
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("PROJECT_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!
  );

  const { convoId } = await req.json();
  if (!convoId) return new Response("Missing convoId", { status: 400 });

  const { data, error } = await supabase
    .from("claims_conversations")
    .select("status")
    .eq("id", convoId)
    .single();

  if (error || !data) return new Response("Conversation not found", { status: 404 });

  return new Response(JSON.stringify({ status: data.status }), {
    headers: { "Content-Type": "application/json" },
  });
});