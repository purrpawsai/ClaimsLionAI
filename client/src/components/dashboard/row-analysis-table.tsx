import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, Search, Filter } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface RowAnalysis {
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

interface RowAnalysisTableProps {
  analysisId: string;
  data: RowAnalysis[];
}

const getPriorityColor = (priority: string): "destructive" | "default" | "secondary" | "outline" => {
  switch (priority?.toLowerCase()) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'outline';
  }
};

const getAlertTypeColor = (type: string): "destructive" | "default" | "secondary" | "outline" => {
  switch (type?.toLowerCase()) {
    case 'stockout risk': return 'destructive';
    case 'overstock risk': return 'default';
    default: return 'secondary';
  }
};

export default function RowAnalysisTable({ analysisId, data }: RowAnalysisTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [alertFilter, setAlertFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Get unique values for filters
  const uniqueRegions = useMemo(() => 
    Array.from(new Set(data.map(row => row.region).filter(Boolean))) as string[], [data]
  );

  const uniquePriorities = useMemo(() => 
    Array.from(new Set(data.map(row => row.priority).filter(Boolean))) as string[], [data]
  );

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesSearch = !searchTerm || 
        row.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.action?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority = priorityFilter === 'all' || 
        row.priority?.toLowerCase() === priorityFilter.toLowerCase();

      const matchesRegion = regionFilter === 'all' || 
        row.region === regionFilter;

      const matchesAlert = alertFilter === 'all' || 
        (alertFilter === 'with-alerts' && row.alert && row.alert.trim() !== '') ||
        (alertFilter === 'no-alerts' && (!row.alert || row.alert.trim() === ''));

      return matchesSearch && matchesPriority && matchesRegion && matchesAlert;
    });
  }, [data, searchTerm, priorityFilter, regionFilter, alertFilter]);

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('all');
    setRegionFilter('all');
    setAlertFilter('all');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Row-Level Analysis ({filteredData.length} rows)
        </CardTitle>
        <CardDescription>
          Detailed analysis results for each SKU-Region combination
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search SKU, Region, or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {uniquePriorities.map(priority => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {uniqueRegions.map(region => (
                <SelectItem key={region} value={region || ''}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={alertFilter} onValueChange={setAlertFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Alerts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rows</SelectItem>
              <SelectItem value="with-alerts">With Alerts</SelectItem>
              <SelectItem value="no-alerts">No Alerts</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Clear
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[70px]">Row #</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Alert</TableHead>
                <TableHead>Forecast</TableHead>
                <TableHead className="text-right">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(row.id)}
                          >
                            {expandedRows.has(row.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {row.row_index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {row.sku}
                    </TableCell>
                    <TableCell>
                      {row.region}
                    </TableCell>
                    <TableCell>
                      {row.recommendation?.Priority && (
                        <Badge variant={getPriorityColor(row.recommendation.Priority)}>
                          {row.recommendation.Priority}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {row.recommendation?.Action}
                    </TableCell>
                    <TableCell>
                      {row.alert && (
                        <Badge variant={getAlertTypeColor(row.alert.Type || '')}>
                          {row.alert.Type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {row.forecast_highlight?.Forecast}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {row.ending_stock?.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  
                  {expandedRows.has(row.id) && (
                    <TableRow>
                      <TableCell colSpan={9} className="bg-muted/30">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                          {/* Recommendation Details */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Recommendation</h4>
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Action:</span> {row.recommendation?.Action}</p>
                              <p><span className="font-medium">Reason:</span> {row.recommendation?.Reason}</p>
                              {row.recommendation?.Quantity && (
                                <p><span className="font-medium">Quantity:</span> {row.recommendation.Quantity.toLocaleString()}</p>
                              )}
                            </div>
                          </div>

                          {/* Forecast Details */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Forecast</h4>
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Trend:</span> {row.forecast_highlight?.Forecast}</p>
                              <p><span className="font-medium">Suggested Action:</span> {row.forecast_highlight?.SuggestedAction}</p>
                            </div>
                          </div>

                          {/* Sales Data & Alerts */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Sales Data</h4>
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Last 30d Sales:</span> {row.last30d_sales?.toLocaleString()}</p>
                              <p><span className="font-medium">Prev 30d Sales:</span> {row.prev30d_sales?.toLocaleString()}</p>
                              <p><span className="font-medium">Ending Stock:</span> {row.ending_stock?.toLocaleString()}</p>
                              {row.alert && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                  <p className="font-medium text-red-700 dark:text-red-300">
                                    {row.alert.Type}
                                  </p>
                                  <p className="text-sm text-red-600 dark:text-red-400">
                                    {row.alert.Message}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No rows match the current filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 