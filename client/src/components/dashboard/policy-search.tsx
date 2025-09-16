import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, AlertTriangle } from "lucide-react";

interface PolicySearchProps {
  insights: any[];
}

interface SearchResult {
  policyId: string;
  insightTitle: string;
  category: string;
  patternSummary: string;
}

export function PolicySearch({ insights }: PolicySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Search through all insights and their matching IDs
    const results: SearchResult[] = [];
    
    insights.forEach((insight) => {
      const matchingIds = insight.MatchingIDs || insight.matching_ids || [];
      matchingIds.forEach((policyId: string) => {
        if (policyId.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            policyId,
            insightTitle: insight.Title || insight.title || 'Untitled',
            category: insight.Category || insight.category || 'Unknown',
            patternSummary: insight.PatternSummary || insight.pattern_summary || 'No summary'
          });
        }
      });
    });
    
    setSearchResults(results);
    setIsSearchOpen(true);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = category?.toLowerCase();
    if (cat?.includes('fraud')) return 'destructive';
    if (cat?.includes('leakage')) return 'secondary';
    if (cat?.includes('underwriting')) return 'outline';
    return 'default';
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Policy Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by Policy ID, Claim Number, or Reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={!searchTerm.trim() || isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Search across all flagged policies and claims in the analysis
          </p>
        </CardContent>
      </Card>

      {/* Search Results Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Results for "{searchTerm}"
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Found {searchResults.length} matching policies
                </p>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy ID</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Related Insight</TableHead>
                      <TableHead>Pattern Summary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((result, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-mono font-medium">
                          {result.policyId}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getCategoryColor(result.category) as any}>
                            {result.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {result.insightTitle}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-md">
                          {result.patternSummary.length > 100 
                            ? `${result.patternSummary.substring(0, 100)}...`
                            : result.patternSummary
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-500">
                  No policies matching "{searchTerm}" were found in the analysis.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}