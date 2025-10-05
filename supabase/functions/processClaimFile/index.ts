// supabase/functions/processClaimFile/index.ts
// Queue-based processing system - Edge Function only inserts tasks

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers to allow frontend origin
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://claimslionai.netlify.app",
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
  
  console.log("🚀 processClaimFile (Queue Mode) started");
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase environment variables");
      throw new Error("Missing Supabase environment variables");
    }
    
    console.log("✅ Supabase client created");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { fileUrl, filename, fileSize } = await req.json();
    console.log("📥 Request payload:", { fileUrl, filename, fileSize });
    
    if (!fileUrl) {
      console.error("❌ Missing fileUrl");
      return new Response(JSON.stringify({ error: "Missing fileUrl" }), { 
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // 1. Insert task into processing queue
    console.log("📝 Inserting task into processing queue...");
    const queueInsert = await supabase.from("processing_queue").insert({
      file_url: fileUrl,
      filename: filename || fileUrl.split('/').pop() || 'unknown',
      file_size: fileSize || null,
      status: "pending",
      region: "General", // Default region since we're not requiring user input
      priority: 0, // Default priority
    }).select("id").single();

    console.log("📊 Queue insert result:", queueInsert);

    const queueId = queueInsert.data?.id;
    if (!queueId) {
      console.error("❌ Failed to create queue task:", queueInsert.error);
      return new Response(JSON.stringify({ 
        error: "Failed to create processing task", 
        details: queueInsert.error?.message 
      }), { 
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }
    
    console.log("✅ Queue task created:", queueId);

    // 2. Return immediately with queueId - processing happens in background
    console.log("🔄 Returning queueId immediately, processing will happen in background...");
    
    return new Response(JSON.stringify({ 
      queueId, 
      status: "pending",
      message: "File queued for processing. Check status using the queueId."
    }), {
      status: 202, // Accepted - task queued
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