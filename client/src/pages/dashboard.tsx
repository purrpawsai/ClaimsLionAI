import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InsightCards } from "@/components/dashboard/insight-cards";
import { Charts } from "@/components/dashboard/charts";
import { DataTables } from "@/components/dashboard/data-tables";

import RowAnalysisTable from "@/components/dashboard/row-analysis-table-simple";
import { ExpandableTable } from "@/components/dashboard/expandable-table";
import { useRowAnalysis } from "@/hooks/use-row-analysis";
import { Download, AlertCircle, Loader2, Search, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/layout/footer";
import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CriticalAlertsSidebar } from "@/components/dashboard/critical-alerts-sidebar";
import { ChatWindow, ChatWindowHandle } from "@/components/dashboard/chat-window";
import { InsightTable } from "@/components/dashboard/insight-table";
import { PolicySearch } from "@/components/dashboard/policy-search";

export default function Dashboard() {
  const [match, params] = useRoute("/dashboard/:id?");
  const analysisId = params?.id;
  const [isExporting, setIsExporting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const chatRef = useRef<ChatWindowHandle>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const handleAISkuClick = (sku: string) => {
    setChatOpen(true);
    setTimeout(() => {
      chatRef.current?.setInputAndFocus(sku);
    }, 100);
  };

  const { data: analysisResult, isLoading, error } = useQuery({
    queryKey: ["/api/analysis", analysisId],
    enabled: !!analysisId,
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/analysis", { analysisId });
      return response.json();
    },
  });

  const { data: allResults } = useQuery({
    queryKey: ["/api/get-analyses"],
    enabled: !analysisId,
    staleTime: 0, // Always fetch fresh data
  });

  // Get current result first
  const currentResult = analysisResult || (Array.isArray(allResults) && allResults.length > 0 ? allResults[0] : undefined);

  // Fetch row-level analysis data
  const rowAnalysisIdToUse = currentResult?.id || analysisId;
  console.log('🔍 Dashboard: rowAnalysisIdToUse =', rowAnalysisIdToUse);
  console.log('🔍 Dashboard: currentResult?.id =', currentResult?.id);
  console.log('🔍 Dashboard: analysisId from URL =', analysisId);
  
  const { data: rowAnalysisData, isLoading: isLoadingRowAnalysis } = useRowAnalysis(
    rowAnalysisIdToUse
  );
  
  // Fix: The jsonResponse is directly on currentResult, not nested under analysis
  const analysisData = currentResult?.jsonResponse || currentResult?.analysis?.jsonResponse;
  
  // Add debug logging to help identify data structure issues
  console.log('🔍 Dashboard Debug - currentResult:', currentResult);
  console.log('🔍 Dashboard Debug - analysisData:', analysisData);
  console.log('🔍 Dashboard Debug - analysisData type:', typeof analysisData);
  console.log('🔍 Dashboard Debug - analysisData keys:', analysisData ? Object.keys(analysisData) : 'no keys');
  
  // Check if analysis is still processing and redirect in useEffect
  useEffect(() => {
    if (analysisData && (analysisData.status === 'processing' || analysisData.message === 'Analysis in progress...')) {
      setLocation(`/upload?analysisId=${currentResult.id}`);
    }
  }, [analysisData, currentResult?.id, setLocation]);

  // Poll for completion if still processing
  useEffect(() => {
    if (analysisData && (analysisData.status === 'processing' || analysisData.message === 'Analysis in progress...')) {
      if (!pollingRef.current) {
        pollingRef.current = setInterval(() => {
          // Refetch the analysis result
          window.location.reload(); // Simple reload for now, can be improved with queryClient refetch
        }, 5000);
      }
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [analysisData]);

  // Helper function to safely format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Date not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date not available';
      
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Date not available';
    }
  };

  // Get the analysis date - try multiple possible field names
  const analysisDate = currentResult?.analyzedAt || 
                      currentResult?.createdAt || 
                      currentResult?.created_at ||
                      currentResult?.analysis?.analyzedAt ||
                      currentResult?.analysis?.createdAt ||
                      currentResult?.analysis?.created_at;
  
  // Debug logging to help identify date field issues
  console.log('🔍 Date Debug:', {
    currentResult,
    analyzedAt: currentResult?.analyzedAt,
    createdAt: currentResult?.createdAt,
    created_at: currentResult?.created_at,
    analysisDate,
    formattedDate: formatDate(analysisDate)
  });
  // Debug logging for analysisId and DataTables linkage
  console.log('🔍 Dashboard analysisId from URL:', analysisId);
  console.log('🔍 Dashboard currentResult.id:', currentResult?.id);
  console.log('🔍 Passing to DataTables:', {
    analysisId: currentResult?.id,
    filename: currentResult?.filename,
    analysisData
  });

  if (!analysisId && (!Array.isArray(allResults) || allResults.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No analysis results found. Please upload a file first.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load analysis results"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Add check for missing or malformed analysisData
  if (!analysisData || typeof analysisData !== 'object') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Analysis data is missing or malformed. The analysis may be incomplete or corrupted. Please try re-uploading your file or contact support.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
                <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                  currentResult: {JSON.stringify(currentResult, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if processing
  if (analysisData && (analysisData.status === 'processing' || analysisData.message === 'Analysis in progress...')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Redirecting to progress tracking...
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      
      // Show initial progress
      toast({
        title: "Generating PDF",
        description: "Preparing high-quality report...",
      });
      
      // Create a container for the PDF content
      const dashboardElement = document.getElementById('dashboard-content');
      if (!dashboardElement) {
        throw new Error('Dashboard content not found');
      }

      // Temporarily hide problematic SVG elements that might cause issues
      const svgElements = dashboardElement.querySelectorAll('svg');
      const originalStyles: string[] = [];
      svgElements.forEach((svg, index) => {
        originalStyles[index] = svg.style.cssText;
        svg.style.display = 'none';
      });

      try {
        // Configure html2canvas options for high quality
        const canvas = await html2canvas(dashboardElement, {
          scale: 3, // Reduced from 4 to 3 to avoid memory issues
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: dashboardElement.scrollWidth,
          height: dashboardElement.scrollHeight,
          logging: false, // Disable logging for cleaner output
          imageTimeout: 15000, // Increased timeout for images
          removeContainer: true, // Clean up temporary elements
          foreignObjectRendering: false, // Better compatibility
          scrollX: 0,
          scrollY: 0,
          ignoreElements: (element) => {
            // Ignore elements that might cause issues
            return element.tagName === 'SVG' || 
                   element.classList.contains('animate-spin') ||
                   element.classList.contains('lucide');
          }
        });

        // Show progress update
        toast({
          title: "Processing",
          description: "Converting to PDF format...",
        });

        // Calculate dimensions
        const imgData = canvas.toDataURL('image/png', 0.95); // Slightly reduced quality for better compatibility
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;

        // Add header with title and date
        pdf.setFontSize(20);
                    pdf.text('Claims Processing Analysis Report', pdfWidth / 2, 20, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text(`File: ${currentResult.filename}`, pdfWidth / 2, 30, { align: 'center' });
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pdfWidth / 2, 40, { align: 'center' });

        // Add the dashboard image with better quality settings
        const finalImgHeight = imgHeight * ratio;
        if (finalImgHeight > pdfHeight - 50) {
          // If image is too tall, we need to split it across multiple pages
          const pages = Math.ceil(finalImgHeight / (pdfHeight - 50));
          for (let i = 0; i < pages; i++) {
            if (i > 0) pdf.addPage();
            const sourceY = (imgHeight / pages) * i;
            const sourceHeight = imgHeight / pages;
            const yOffset = i === 0 ? 50 : 10;
            
            pdf.addImage(
              imgData,
              'PNG',
              imgX,
              yOffset,
              imgWidth * ratio,
              sourceHeight * ratio,
              undefined,
              'FAST' // Use FAST for better compatibility
            );
          }
        } else {
          pdf.addImage(
            imgData, 
            'PNG', 
            imgX, 
            50, 
            imgWidth * ratio, 
            finalImgHeight,
            undefined,
            'FAST' // Use FAST for better compatibility
          );
        }

        // Save the PDF
                  const filename = `ClaimsLionAI_Analysis_${currentResult.filename.replace(/\.[^/.]+$/, '')}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);

        toast({
          title: "Export successful",
          description: "Your analysis report has been downloaded as PDF.",
        });

      } finally {
        // Restore SVG elements
        svgElements.forEach((svg, index) => {
          svg.style.cssText = originalStyles[index];
        });
      }

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Check if there's minimal data to show a helpful message - ClaimsLionAI data structure
  const insights = analysisData?.Insights || [];
  const auditSummary = analysisData?.AuditSummary || {};
  
  const hasInsights = Array.isArray(insights) && insights.length > 0;
  const hasAuditSummary = auditSummary && Object.keys(auditSummary).length > 0;
  const hasCriticalInsights = Array.isArray(insights) && insights.some((insight: any) => 
    insight.category?.toLowerCase() === 'fraud indicator' || 
    insight.category?.toLowerCase() === 'pricing mismatch' ||
    insight.category?.toLowerCase() === 'risk concentration'
  );
  const hasPortfolioLeakage = Array.isArray(insights) && insights.some((insight: any) => 
    insight.category?.toLowerCase() === 'portfolio leakage' ||
    insight.category?.toLowerCase() === 'underwriting gap'
  );

  const totalDataSections = [hasInsights, hasAuditSummary, hasCriticalInsights, hasPortfolioLeakage].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
                <span className="text-blue-600 font-medium">Claims Intelligence Dashboard</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Claims Analysis <span className="text-blue-600">Dashboard</span>
              </h2>
              <p className="text-xl text-gray-600">Comprehensive analysis results for {currentResult?.filename || currentResult?.analysis?.filename || ''}</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                Analyzed: {formatDate(analysisDate)}
              </span>
              <Button 
                onClick={exportToPDF}
                disabled={isExporting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Always show the analysis summary, even if empty */}
      <div className="mb-6">
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Analysis Summary</h3>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {currentResult?.analysisSummary || analysisData?.analysisSummary
                ? currentResult?.analysisSummary || analysisData?.analysisSummary
                : "Comprehensive claims analysis completed with actionable insights across fraud detection, cost optimization, and risk management recommendations."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Show helpful message when minimal data is available */}
      {totalDataSections === 0 && (
        <Alert className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            The analysis shows limited actionable insights. This may occur when the claims data is already optimized or when more detailed insurance data is needed for comprehensive fraud detection and cost analysis.
          </AlertDescription>
        </Alert>
      )}

      <CriticalAlertsSidebar alerts={analysisData?.Insights || []} />

      <div id="dashboard-content" className="space-y-8">
        
        {/* Policy Search */}
        <PolicySearch insights={analysisData?.Insights || []} />
        
        {/* Summary KPI Cards */}
        <InsightCards data={analysisData} />
        
        {/* Main Insights Table - Only show if there are insights */}
        {analysisData?.Insights && analysisData.Insights.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Claims Analysis Insights ({analysisData.Insights.length})
            </h2>
            <InsightTable insights={analysisData.Insights} />
          </div>
        )}
        
        {/* Additional Analytics for Insurance Data */}
        <Charts data={analysisData} />
        
        {/* Row-Level Analysis Table */}
        {rowAnalysisData && rowAnalysisData.length > 0 && (
          <RowLevelAnalysisSection rowAnalysisData={rowAnalysisData} onAISkuClick={handleAISkuClick} />
        )}
        
        {/* Show loading state for row analysis */}
        {isLoadingRowAnalysis && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading row-level analysis...</span>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
      
      <Footer />
    </div>
  );
}

// Row-Level Analysis Section Component with filtering
function RowLevelAnalysisSection({ rowAnalysisData, onAISkuClick }: { rowAnalysisData: any[]; onAISkuClick: (sku: string) => void; }) {
  const [showAll, setShowAll] = useState(false);

  // Filter out rows with default/empty actions - only show meaningful analysis
  const actionableRows = rowAnalysisData.filter((row: any) => {
    const action = row.action?.toLowerCase() || '';
    const reason = row.reason?.toLowerCase() || '';
    
    // Filter out generic/default entries
    const isGeneric = action === 'monitor' || 
                     action === '' || 
                     reason === 'no immediate action required' ||
                     reason === '' ||
                     (action === 'monitor' && reason === 'no immediate action required');
    
    return !isGeneric;
  });

  const displayData = showAll ? rowAnalysisData : actionableRows;
  
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary flex items-center">
          <Search className="mr-2 h-5 w-5" />
          Row-Level Analysis ({displayData.length} {showAll ? 'total' : 'actionable'} rows)
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Action Coverage: {Math.round((actionableRows.length / rowAnalysisData.length) * 100)}% 
          ({actionableRows.length} of {rowAnalysisData.length} SKU-regions require strategic action)
        </p>
      </div>
              <ExpandableTable
          title=""
          icon={<></>}
          data={displayData.map((row: any, index: number) => ({
            id: row.id || index,
            SKU: row.sku || '',
            Region: row.region || '',
            Priority: row.priority || 'Medium',
            Action: row.action || 'Monitor',
            Reason: row.reason || 'No immediate action required',
            Alert: row.alert || '',
            Forecast: row.forecast_highlight || ''
          }))}
          columns={[
            { key: 'SKU', label: 'SKU' },
            { key: 'Region', label: 'Region' },
            { 
              key: 'Priority', 
              label: 'Priority',
              render: (item: any) => {
                if (!item.Priority) return null;
                let colorClass = 'bg-blue-100 text-blue-800';
                const priority = item.Priority.toLowerCase();
                
                if (priority === 'critical') {
                  colorClass = 'bg-red-100 text-red-800';
                } else if (priority === 'high') {
                  colorClass = 'bg-orange-100 text-orange-800';
                } else if (priority === 'low') {
                  colorClass = 'bg-green-100 text-green-800';
                }
                
                return <Badge className={colorClass}>{item.Priority}</Badge>;
              }
            },
            { key: 'Action', label: 'Action' },
            { key: 'Reason', label: 'Reason' },
            { 
              key: 'Alert', 
              label: 'Alert',
              render: (item: any) => {
                if (!item.Alert || item.Alert.trim() === '') return null;
                return <span className="text-red-600">{item.Alert}</span>;
              }
            },
            { 
              key: 'Forecast', 
              label: 'Forecast',
              render: (item: any) => {
                if (!item.Forecast) return null;
                
                // Try to parse JSON if it's a string, otherwise display directly
                try {
                  const forecast = typeof item.Forecast === 'string' ? JSON.parse(item.Forecast) : item.Forecast;
                  return <span className="text-sm">{forecast.Forecast || forecast}</span>;
                } catch {
                  return <span className="text-sm">{item.Forecast}</span>;
                }
              }
            }
          ]}
          maxPreviewRows={showAll ? 1000 : 5}
          showAllData={rowAnalysisData}
          showOnlyActionable={actionableRows}
          currentShowAll={showAll}
          onToggleShowAll={() => setShowAll(!showAll)}
          onAISkuClick={onAISkuClick}
        />
    </div>
  );
}
