import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { CloudUpload, Zap, Shield } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
// ✅ Correct import for Vite + React Router
import { useNavigate } from "react-router-dom";

interface FileUploadProps {
  onUploadComplete?: (analysisId: string) => void; // Optional callback
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const analysisId = uuidv4(); // Unique ID for tracking analysis

    setUploading(true);
    setUploadError(null);

    try {
      // 1️⃣ Upload file to Supabase via your Edge Function
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(import.meta.env.VITE_UPLOAD_FUNCTION_URL, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const { fileUrl } = await uploadRes.json();

      // 2️⃣ Trigger analysis Edge Function
      const processRes = await fetch(import.meta.env.VITE_PROCESS_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl, analysisId }), // region can be added here too
      });

      if (!processRes.ok) {
        const errorText = await processRes.text();
        throw new Error(`Failed to trigger analysis: ${errorText}`);
      }

      // 3️⃣ Either call callback or navigate to progress page
      if (onUploadComplete) {
        onUploadComplete(analysisId);
      } else {
        navigate(`/progress/${analysisId}`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }, [navigate, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxSize: 30 * 1024 * 1024, // 30MB
  });

  return (
    <div
      {...getRootProps()}
      className={`border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 transform ${
        isDragActive
          ? "border-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 scale-105"
          : "border-blue-300 hover:border-blue-600 hover:scale-102"
      }`}
    >
      <input {...getInputProps()} />

      <div className="relative mx-auto w-20 h-20 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
          <CloudUpload className="text-white h-10 w-10" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Shield className="h-8 w-8 text-blue-600 animate-bounce" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {isDragActive ? "🚀 Drop Your Data Now!" : "Upload Claims Data Files"}
      </h3>
      <p className="text-slate-600 mb-6 font-medium">
        {isDragActive ? "Release to start AI analysis" : "Drag & drop files or click browse"}
      </p>

      <Button
        type="button"
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-3 text-lg shadow-xl mb-6"
        disabled={uploading}
      >
        <Zap className="mr-2 h-5 w-5" />
        {uploading ? "Uploading..." : "Browse Files"}
        <Shield className="ml-2 h-4 w-4" />
      </Button>

      {uploadError && (
        <p className="text-red-500 text-sm mt-2">{uploadError}</p>
      )}

      <div className="flex items-center justify-center space-x-6 text-sm font-medium">
        <div className="flex items-center text-green-600">
          <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
          CSV
        </div>
        <div className="flex items-center text-orange-600">
          <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
          XLSX
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">Maximum file size: 30MB</p>
    </div>
  );
}