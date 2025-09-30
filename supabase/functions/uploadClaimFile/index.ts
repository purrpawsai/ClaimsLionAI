// Supabase Edge Function - Handles Excel file upload and returns public URL
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("PROJECT_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!
  );

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return new Response("Missing file", { status: 400 });

  const ext = file.name.split(".").pop();
  const filename = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("claims-uploads")
    .upload(filename, file.stream(), {
      contentType: file.type,
      upsert: false,
    });

  if (error) return new Response("Upload failed", { status: 500 });

  const { data } = supabase.storage.from("claims-uploads").getPublicUrl(filename);

  return new Response(JSON.stringify({ fileUrl: data.publicUrl }), {
    headers: { "Content-Type": "application/json" },
  });
});