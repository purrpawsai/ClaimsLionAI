import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUpload } from "@/components/upload/file-upload";
import { Upload, X, Loader2, Zap, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/layout/footer";
import { ProgressIndicator } from "@/components/upload/ProgressIndicator";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [polling, setPolling] = useState(false);
  
  // Clear any analysisId from URL to prevent stuck job issues
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('analysisId')) {
      // Remove the analysisId from URL to prevent auto-processing
      urlParams.delete('analysisId');
      const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // ✅ REMOVED: Polling logic to prevent duplicate completion handlers
  // ProgressIndicator now handles completion via realtime subscription
  // This prevents duplicate toasts and navigation conflicts

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await apiRequest("POST", "/api/upload", formData);
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisId(data.analysisId);
      setIsProcessing(true);
      toast({
        title: "Processing Started",
        description: "Your file is being analyzed. This may take a few moments.",
      });
      // Do not redirect here; wait for progress bar to complete
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    // For now, upload the first file
    uploadMutation.mutate(files[0]);
  };

  const handleClearFiles = () => {
    setFiles([]);
  };

  const handleProgressComplete = (status: string) => {
    if (analysisId && status === 'complete') {
      console.log(`🎉 Analysis ${analysisId} completed! Redirecting to dashboard...`);
      setPolling(false);
      setIsProcessing(false);
      toast({
        title: "Analysis Complete",
        description: "Your insurance claims data has been successfully analyzed.",
      });
      // Use setTimeout to ensure toast shows before redirect
      setTimeout(() => {
        window.location.href = `/dashboard/${analysisId}`;
      }, 1000);
    } else if (status === 'failed') {
      console.log(`❌ Analysis ${analysisId} failed`);
      setPolling(false);
      setIsProcessing(false);
      toast({
        title: "Analysis Failed",
        description: "Analysis failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Shield className="h-12 w-12 text-blue-600 animate-pulse" />
              <div className="absolute inset-0 h-12 w-12 text-blue-600 opacity-30">
                <Shield className="h-12 w-12" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Upload Your <span className="text-blue-600">Claims Processing Data</span>
          </h2>
          <p className="text-slate-600 text-xl font-medium max-w-2xl mx-auto">
            Transform your insurance operations with AI-powered insights. Upload your CSV files and let our advanced analytics optimize your claims processing.
          </p>
        </div>

        <Card className="mb-8 shadow-2xl border-0 bg-white">
        <CardContent className="p-8">
          {isProcessing && analysisId && files.length > 0 ? (
            <ProgressIndicator 
              analysisId={analysisId}
              onComplete={handleProgressComplete} 
            />
          ) : (
            <FileUpload onFilesSelected={handleFilesSelected} />
          )}

          {files.length > 0 && !isProcessing && (
            <div className="mt-6 space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                      <Upload className="text-accent h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">{file.name}</p>
                      <p className="text-sm text-slate-600">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFiles(files.filter((_, i) => i !== index));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploadMutation.isPending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-6 shadow-xl"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  AI Analyzing Your Data...
                </>
              ) : (
                <>
                  <Upload className="mr-3 h-5 w-5" />
                  Upload & Analyze with AI
                  <Zap className="ml-3 h-5 w-5 animate-pulse" />
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFiles}
              disabled={files.length === 0 || uploadMutation.isPending}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
          </CardContent>
        </Card>

        {uploadMutation.isPending && (
        <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <AlertDescription>
            <div className="space-y-4">
              <p className="font-bold text-lg text-blue-800">🤖 AI Analysis in Progress</p>
              <p className="font-medium text-slate-700">ClaimsLionAI is processing your claims data with advanced neural networks...</p>
              <Progress value={45} className="w-full h-3 bg-blue-200" />
              <div className="flex justify-between text-sm font-medium">
                <span className="text-blue-600">Processing: Fraud Patterns</span>
                <span className="text-slate-500">Est. 2-3 minutes</span>
              </div>
            </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <Footer />
    </div>
  );
}
