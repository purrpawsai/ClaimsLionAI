import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

interface ProgressIndicatorProps {
  analysisId: string;
  onComplete: (status: string) => void;
}

interface AnalysisResponse {
  status?: string;
  message?: string;
  jsonResponse?: {
    Insights?: any[];
    AuditSummary?: any;
    status?: string;
  };
}

export function ProgressIndicator({ analysisId, onComplete }: ProgressIndicatorProps) {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Fetch initial status from API
  const { data: progressData, isLoading } = useQuery<AnalysisResponse>({
    queryKey: ['/api/analysis', analysisId],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/analysis", { analysisId });
      return response.json();
    },
    enabled: !!analysisId,
    retry: 3,
    retryDelay: 1000,
  });

  // Set initial status from API
  useEffect(() => {
    if (progressData && !initialLoaded) {
      setStatus(progressData.status);
      if (progressData.status === 'error' || (progressData.jsonResponse && progressData.jsonResponse.status === 'error')) {
        setErrorMessage(progressData.message || 'There was an error processing your file. Please try uploading again.');
      }
      setInitialLoaded(true);
    }
  }, [progressData, initialLoaded]);

  // Realtime subscription to analysis_results row
  useEffect(() => {
    if (!analysisId) return;
    let retryTimeout: NodeJS.Timeout | null = null;
    const checkAndComplete = (payload: any) => {
      const newStatus = payload.new.status;
      setStatus(newStatus);
      const jsonResponse = payload.new.jsonResponse;
      const analyzedAt = payload.new.analyzed_at;
      // Check for ClaimsLion data structure
      const hasAllData = (
        newStatus === 'complete' &&
        jsonResponse &&
        typeof jsonResponse === 'object' &&
        Array.isArray(jsonResponse.Insights) &&
        jsonResponse.Insights.length > 0 &&
        analyzedAt && analyzedAt !== 'Invalid Date'
      );
      if (hasAllData && jsonResponse.status !== 'error') {
        onComplete('complete');
      } else if (newStatus === 'error' || (jsonResponse && jsonResponse.status === 'error')) {
        setErrorMessage(jsonResponse?.message || 'There was an error processing your file. Please try uploading again.');
      } else {
        // ✅ FIXED: Don't reload page - just wait for next realtime update
        // Realtime subscription will catch the completion automatically
        console.log(`⏳ Analysis ${payload.new.id} still processing... waiting for completion`);
      }
    };
    const channel = supabase
      .channel('realtime-analysis-' + analysisId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analysis_results',
          filter: `id=eq.${analysisId}`,
        },
        checkAndComplete
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [analysisId, onComplete]);

  // Error UI
  if (errorMessage) {
    return (
      <div className="flex flex-col items-center space-y-4 p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Analysis Failed
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {errorMessage}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading/processing UI
  if (isLoading && !progressData) {
    return (
      <div className="flex flex-col items-center space-y-4 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        <p className="text-gray-600">Initializing analysis...</p>
      </div>
    );
  }

  // Status message mapping
  let statusMessage = 'AI is analyzing your data...';
  // Always show this message for both pending and processing
  // Only show 'Finalizing results...' if you want a different message for 'complete'
  if (status === 'complete') statusMessage = 'Finalizing results...';

  return (
    <div className="flex flex-col items-center space-y-4 p-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Processing Your Data
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {statusMessage}
        </p>
      </div>
      <div className="flex flex-col items-center">
        {/* Animated spinner or dots */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-2"></div>
        <div className="text-xs text-gray-400 text-center max-w-md">
          AI is analyzing your data...
        </div>
      </div>
    </div>
  );
}