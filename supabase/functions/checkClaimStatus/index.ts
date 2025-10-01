// Pollable endpoint to check if analysis is complete
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

  const { convoId } = await req.json();
  if (!convoId) return new Response(JSON.stringify({ error: "Missing convoId" }), { 
    status: 400,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

  const { data, error } = await supabase
    .from("claims_conversations")
    .select("status")
    .eq("id", convoId)
    .single();

  if (error || !data) return new Response(JSON.stringify({ error: "Conversation not found" }), { 
    status: 404,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

  return new Response(JSON.stringify({ status: data.status }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
});