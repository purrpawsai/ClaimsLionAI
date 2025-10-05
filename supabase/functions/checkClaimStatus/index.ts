// supabase/functions/checkClaimStatus/index.ts
// Check processing queue status

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

    const { queueId } = await req.json();
    if (!queueId) {
      return new Response(JSON.stringify({ error: "Missing queueId" }), { 
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Get queue status and analysis results
    const { data: queueData, error: queueError } = await supabase
      .from("processing_queue")
      .select(`
        id,
        status,
        error_message,
        created_at,
        started_at,
        completed_at,
        retry_count,
        queue_analysis_results (
          id,
          status,
          insights_summary,
          error_message,
          created_at
        )
      `)
      .eq("id", queueId)
      .single();

    if (queueError || !queueData) {
      return new Response(JSON.stringify({ error: "Queue task not found" }), { 
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Return comprehensive status
    const response = {
      queueId: queueData.id,
      status: queueData.status,
      errorMessage: queueData.error_message,
      createdAt: queueData.created_at,
      startedAt: queueData.started_at,
      completedAt: queueData.completed_at,
      retryCount: queueData.retry_count,
      analysis: queueData.queue_analysis_results?.[0] || null
    };

    return new Response(JSON.stringify(response), {
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