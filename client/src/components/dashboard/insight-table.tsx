import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, FileText, AlertTriangle, TrendingUp, Shield } from "lucide-react";

interface InsightTableProps {
  insights: any[];
}

const getCategoryIcon = (category: string) => {
  const cat = category?.toLowerCase();
  if (cat?.includes('fraud')) return <AlertTriangle className="h-4 w-4" />;
  if (cat?.includes('leakage')) return <TrendingUp className="h-4 w-4" />;
  if (cat?.includes('underwriting')) return <Shield className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
};

const getCategoryColor = (category: string) => {
  const cat = category?.toLowerCase();
  if (cat?.includes('fraud')) return 'destructive';
  if (cat?.includes('leakage')) return 'secondary';
  if (cat?.includes('underwriting')) return 'outline';
  return 'default';
};

export function InsightTable({ insights }: InsightTableProps) {
  const [expandedInsights, setExpandedInsights] = useState<Set<number>>(new Set());

  // If no insights, return nothing (don't render anything)
  if (!insights || insights.length === 0) {
    return null;
  }

  const toggleExpanded = (index: number) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {insights.map((insight, index) => {
        const isExpanded = expandedInsights.has(index);
        const matchingIds = insight.MatchingIDs || insight.matching_ids || [];
        
        return (
          <Card key={index} className="transition-all duration-200 shadow-md hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(insight.Category || insight.category)}
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {insight.Title || insight.title || `Insight ${index + 1}`}
                    </CardTitle>
                  </div>
                  <Badge 
                    variant={getCategoryColor(insight.Category || insight.category) as any}
                    className="mb-2 text-sm"
                  >
                    {insight.Category || insight.category || 'Unknown Category'}
                  </Badge>
                </div>
                {matchingIds.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpanded(index)}
                    className="ml-4 min-w-[120px]"
                  >
                    {matchingIds.length} Policy{matchingIds.length !== 1 ? 'ies' : 'y'}
                    {isExpanded ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Pattern Summary */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Pattern Summary</h4>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                    {insight.PatternSummary || insight.pattern_summary || 'No pattern summary available'}
                  </p>
                </div>

                {/* Suggested Action */}
                {(insight.SuggestedAction || insight.suggested_action) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Suggested Action</h4>
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {insight.SuggestedAction || insight.suggested_action}
                      </p>
                    </div>
                  </div>
                )}

                {/* Supporting Evidence */}
                {insight.SupportingEvidence?.data && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Supporting Evidence</h4>
                    <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {insight.SupportingEvidence.data}
                      </p>
                    </div>
                  </div>
                )}

                {/* Expandable Matching IDs Table */}
                {isExpanded && matchingIds.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Affected Policies ({matchingIds.length})
                    </h4>
                    <div className="max-h-80 overflow-y-auto border rounded-lg bg-white">
                      <Table>
                        <TableHeader className="sticky top-0 bg-gray-50">
                          <TableRow>
                            <TableHead className="font-semibold">Policy ID</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {matchingIds.map((policyId: string, policyIndex: number) => (
                            <TableRow key={policyIndex} className="hover:bg-gray-50">
                              <TableCell className="font-mono text-sm font-medium">
                                {policyId}
                              </TableCell>
                              <TableCell>
                                <Badge variant="destructive" className="text-xs">
                                  Flagged
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}