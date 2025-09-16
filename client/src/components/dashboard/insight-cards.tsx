import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BarChart, Target, TrendingDown } from "lucide-react";

interface InsightCardsProps {
  data: any;
}

export function InsightCards({ data }: InsightCardsProps) {
  // Use the ClaimsLionAI data structure
  const insights = data?.Insights || [];
  const auditSummary = data?.AuditSummary || {};
  
  // Calculate KPIs
  const totalInsights = insights.length;
  const criticalInsights = insights.filter((insight: any) => 
    (insight.Category || insight.category)?.toLowerCase() === 'fraud indicator' || 
    (insight.Category || insight.category)?.toLowerCase() === 'pricing mismatch' ||
    (insight.Category || insight.category)?.toLowerCase() === 'risk concentration'
  ).length;
  
  const portfolioLeakage = insights.filter((insight: any) => 
    (insight.Category || insight.category)?.toLowerCase() === 'portfolio leakage' ||
    (insight.Category || insight.category)?.toLowerCase() === 'underwriting gap'
  ).length;
  
  const actionableInsights = insights.filter((insight: any) => 
    (insight.SuggestedAction || insight.suggested_action) && (insight.SuggestedAction || insight.suggested_action).trim() !== ''
  );
  const actionCoverage = totalInsights > 0 ? Math.round((actionableInsights.length / totalInsights) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                <BarChart className="text-blue-600 h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Total Insights</p>
                <p className="text-2xl font-bold text-blue-900">{totalInsights}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-red-600 h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-700">Critical Insights</p>
                <p className="text-2xl font-bold text-red-900">{criticalInsights}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-purple-600 h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Portfolio Leakage</p>
                <p className="text-2xl font-bold text-purple-900">{portfolioLeakage}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                <Target className="text-green-600 h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Action Coverage</p>
                <p className="text-2xl font-bold text-green-900">{actionCoverage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recommended Actions</h3>
          <p className="text-sm text-gray-600">
            {insights.length} insights • {actionableInsights.length} actionable
          </p>
        </div>

        {insights.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
              <p className="text-gray-600 mb-4">
                Upload a portfolio file and run analysis via ClaimsLion AI Assistant or Gemini API.
              </p>
              <Button variant="outline">
                Upload Claims Data
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight: any, index: number) => (
              <Card key={index} className="transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {insight.Title || insight.title || 'Untitled Insight'}
                      </CardTitle>
                      <Badge className="mt-1 bg-blue-100 text-blue-800">
                        {insight.Category || insight.category || 'Unknown Category'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Pattern Summary</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {insight.PatternSummary || insight.pattern_summary || 'No pattern summary available'}
                      </p>
                    </div>

                    {(insight.SuggestedAction || insight.suggested_action) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Action</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {insight.SuggestedAction || insight.suggested_action}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 