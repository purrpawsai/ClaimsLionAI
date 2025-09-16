import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FileText, Download, Eye, AlertCircle, Trash2, Shield } from "lucide-react";
import { useState } from "react";
import Footer from "@/components/layout/footer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function History() {
  const { data: results, isLoading, error } = useQuery({
    queryKey: ["/api/get-analyses"],
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/delete-analysis/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/get-analyses"] });
      toast({
        title: "Analysis deleted",
        description: "The analysis has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete analysis. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, filename: string) => {
    if (confirm(`Are you sure you want to delete the analysis for "${filename}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Mutation for deleting all analyses
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      // Use the same base as other endpoints, but DELETE method
      return apiRequest("DELETE", `/api/delete-all-analyses`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/get-analyses"] });
      toast({
        title: "All analyses deleted",
        description: "All analysis results have been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete all analyses. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => setIsDeletingAll(false),
  });

  const handleDeleteAll = () => {
    if (results && results.length > 0) {
      if (confirm("Are you sure you want to delete ALL analyses? This cannot be undone.")) {
        setIsDeletingAll(true);
        deleteAllMutation.mutate();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load analysis history"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-blue-600 font-medium">Claims Analysis History</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Analysis <span className="text-blue-600">History</span>
          </h2>
          <p className="text-xl text-gray-600 mb-6">View and access your previous claims processing analyses</p>
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={!results || results.length === 0 || isDeletingAll}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeletingAll ? "Deleting All..." : "Delete All"}
            </Button>
          </div>
        </div>

        </div>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Recent Claims Analyses</CardTitle>
          </CardHeader>
        <CardContent>
          {!results || results.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No analyses found. Upload a file to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result: any) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-accent mr-2" />
                        <div>
                          <div className="font-medium">{result.filename}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(result.createdAt).toLocaleDateString()} {new Date(result.createdAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log(`👁️ Navigating to dashboard for analysis: ${result.id}`);
                            window.location.href = `/dashboard/${result.id}`;
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            console.log(`💾 Downloading analysis: ${result.id}`);
                            // Create download link for the original file
                            if (result.fileUrl) {
                              const link = document.createElement('a');
                              link.href = result.fileUrl;
                              link.download = result.filename || 'analysis.csv';
                              link.click();
                            } else {
                              toast({
                                title: "Download Error",
                                description: "File not found or no longer available.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(result.id, result.filename)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Footer />
    </div>
  );
}
