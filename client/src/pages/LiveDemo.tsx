import { useState } from "react";
import { useRouter } from "next/router";

export default function LiveDemo() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "complete">("idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = async () => {
    if (!file || !region) return alert("File and region required.");

    setStatus("uploading");

    // 1. Upload to Supabase Storage
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch(import.meta.env.VITE_UPLOAD_FUNCTION_URL, {
      method: "POST",
      body: formData,
    });

    const { fileUrl } = await uploadRes.json();

    // 2. Trigger Claude analysis
    setStatus("processing");

    const processRes = await fetch(import.meta.env.VITE_PROCESS_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl, region }),
    });

    const { convoId } = await processRes.json();

    // 3. Poll until status is complete
    const interval = setInterval(async () => {
      const statusRes = await fetch(import.meta.env.VITE_CLAIM_STATUS_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ convoId }),
      });

      const { status } = await statusRes.json();

      if (status === "complete") {
        clearInterval(interval);
        setStatus("complete");
        router.push(`/dashboard/${convoId}`);
      }
    }, 4000);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Upload Claim File</h1>

      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="mb-4" />

      <input
        type="text"
        placeholder="Enter Region (e.g. Riyadh)"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="block mb-4 w-full border rounded px-3 py-2"
      />

      <button
        onClick={handleUpload}
        disabled={status !== "idle" && status !== "complete"}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Start Analysis
      </button>

      {status === "uploading" && <p className="mt-4 text-yellow-600">Uploading file...</p>}
      {status === "processing" && <p className="mt-4 text-orange-600 animate-pulse">Running Claude analysis...</p>}
    </div>
  );
}