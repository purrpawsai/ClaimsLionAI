import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface RowAnalysis {
  id: string;
  analysis_id: string;
  sku: string;
  region: string;
  recommendation: string;
  alert: string;
  forecast_highlight: string;
  priority: string;
  action: string;
  reason: string;
  created_at: string;
}

export function useRowAnalysis(analysisId: string | null) {
  return useQuery({
    queryKey: ['row-analysis', analysisId],
    queryFn: async () => {
      if (!analysisId) return [];
      
      console.log('🔍 useRowAnalysis: Looking for analysis_id:', analysisId);
      
      const { data, error } = await supabase
        .from('row_analysis')
        .select(`
          id,
          analysis_id,
          sku,
          region,
          recommendation,
          alert,
          forecast_highlight,
          priority,
          action,
          reason,
          created_at
        `)
        .eq('analysis_id', analysisId)
        .order('created_at');
      
      console.log('🔍 useRowAnalysis query result:', { data: data?.length || 0, error, analysisId });
      
      if (error) {
        console.error('❌ useRowAnalysis error:', error);
        throw new Error(`Failed to fetch row analysis: ${error.message}`);
      }
      
      console.log('✅ useRowAnalysis: Found', data?.length || 0, 'records');
      return data as RowAnalysis[];
    },
    enabled: !!analysisId,
  });
} 