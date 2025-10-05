import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { CloudUpload, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FileUploadProps {
  onUploadComplete?: (analysisId: string) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // 1️⃣ Upload to Supabase (with Authorization header)
      const uploadRes = await fetch(import.meta.env.VITE_UPLOAD_FUNCTION_URL, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const { fileUrl } = await uploadRes.json();

      // 2️⃣ Queue file for processing
      const processRes = await fetch(import.meta.env.VITE_PROCESS_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          fileUrl,
          filename: file.name,
          fileSize: file.size
        }),
      });

      if (!processRes.ok) {
        const errorText = await processRes.text();
        throw new Error(`Failed to queue file for processing: ${errorText}`);
      }

      const { queueId } = await processRes.json();
      console.log("✅ File queued for processing, queueId:", queueId);

      // 3️⃣ Poll for completion
      await pollForCompletion(queueId);

      // 4️⃣ Callback or navigation
      if (onUploadComplete) {
        onUploadComplete(queueId);
      } else {
        navigate(`/dashboard/${queueId}`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message);
    } finally {
      setUploading(false);
      setProcessingStatus("");
    }
  }, [navigate, onUploadComplete]);

  const pollForCompletion = async (queueId: string) => {
    const maxAttempts = 120; // 120 attempts = 6 minutes max (30s intervals)
    let attempts = 0;

    setProcessingStatus("Queued for processing...");

    while (attempts < maxAttempts) {
      try {
        const statusRes = await fetch(import.meta.env.VITE_CLAIM_STATUS_FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ queueId }),
        });

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          console.log("📊 Status check:", statusData.status);

          if (statusData.status === "complete") {
            setProcessingStatus("Analysis complete!");
            return;
          } else if (statusData.status === "error") {
            throw new Error(statusData.errorMessage || "Analysis failed. Please try again.");
          } else if (statusData.status === "processing") {
            setProcessingStatus("Processing your data...");
          } else {
            setProcessingStatus(`Queued (${attempts * 30}s elapsed)`);
          }
        }

        // Wait 30 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 30000));
        attempts++;
      } catch (err: any) {
        console.error("Status poll error:", err);
        throw new Error("Failed to check processing status");
      }
    }

    throw new Error("Processing is taking longer than expected. Please check back later.");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB limit to match backend
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === "file-too-large") {
        setUploadError("File is too large. Maximum size is 10MB. Please upload a smaller file or sample data.");
      } else {
        setUploadError(error?.message || "File rejected");
      }
    },
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
        {uploading ? (processingStatus || "Uploading...") : "Browse Files"}
        <Shield className="ml-2 h-4 w-4" />
      </Button>

      {uploadError && (
        <p className="text-red-500 text-sm mt-2">{uploadError}</p>
      )}
      
      {processingStatus && !uploadError && (
        <p className="text-blue-600 text-sm mt-2 animate-pulse">{processingStatus}</p>
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
      <p className="text-xs text-slate-500 mt-2">Maximum file size: 10MB</p>
    </div>
  );
}