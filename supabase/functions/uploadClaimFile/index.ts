// Supabase Edge Function - Handles Excel file upload and returns public URL
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for preflight + actual responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://claimslionai.netlify.app", // your frontend URL
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // Parse incoming form-data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Generate random filename with extension preserved
    const ext = file.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${ext}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("claims-uploads")
      .upload(filename, file.stream(), {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return new Response(JSON.stringify({ error: "Upload failed", details: error.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Get the public URL
    const { data } = supabase.storage.from("claims-uploads").getPublicUrl(filename);

    return new Response(JSON.stringify({ fileUrl: data.publicUrl }), {
      status: 200,
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