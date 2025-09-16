import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Expand, Package, AlertTriangle, TrendingUp, Calendar, Search, Filter, ArrowUpDown, ChevronUp, ChevronDown, GripVertical, MessageCircle } from "lucide-react";
import { MultiSelect } from "@/components/ui/multiselect"; // Assume a MultiSelect component or use Select with multiple
import { Checkbox } from "@/components/ui/checkbox";

interface ExpandableTableProps {
  title: string;
  icon: React.ReactNode;
  data: any[];
  columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[];
  getStatusColor?: (status: string) => string;
  maxPreviewRows?: number;
  className?: string;
  // Optional toggle functionality for row analysis
  showAllData?: any[];
  showOnlyActionable?: any[];
  currentShowAll?: boolean;
  onToggleShowAll?: () => void;
  onAISkuClick?: (sku: string) => void; // New prop for AI SKU click
}

export function ExpandableTable({ 
  title, 
  icon, 
  data, 
  columns, 
  getStatusColor,
  maxPreviewRows = 5,
  className = "",
  showAllData,
  showOnlyActionable,
  currentShowAll,
  onToggleShowAll,
  onAISkuClick // Destructure new prop
}: ExpandableTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  
  // Calculate display data (this drives both preview and expanded view)
  const displayData = data || [];
  
  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...displayData];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply column filter
    if (filterColumn && filterValue) {
      filtered = filtered.filter(item => 
        String(item[filterColumn]).toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    
    // Apply sorting with better numeric handling
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle numeric values properly
        const aNum = parseFloat(String(aValue));
        const bNum = parseFloat(String(bValue));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          // Both are numbers, sort numerically
          if (sortConfig.direction === 'asc') {
            return aNum - bNum;
          } else {
            return bNum - aNum;
          }
        } else {
          // String comparison
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
          
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
      });
    }
    
    return filtered;
  }, [displayData, searchTerm, sortConfig, filterColumn, filterValue]);

  // Show either preview rows or all rows based on expansion state
  const displayRows = isExpanded ? filteredAndSortedData : filteredAndSortedData.slice(0, maxPreviewRows);
  const hasMore = filteredAndSortedData.length > maxPreviewRows;

  // Get unique values for filter dropdown
  const getUniqueValues = (key: string) => {
    const uniqueValues = Array.from(new Set(displayData.map(item => String(item[key])))).filter(Boolean);
    return uniqueValues;
  };
  
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc'; // Changed default to desc for highest to lowest
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilterColumn('');
    setFilterValue('');
    setSortConfig(null);
  };

  // Render table cell with special handling for SKU column
  const renderCell = (item: any, column: any) => {
    if (column.render) {
      return column.render(item);
    }
    if (column.key === 'SKU' && onAISkuClick) {
      return (
        <span className="flex items-center gap-1">
          {item.SKU}
          <button
            className="ml-1 p-1 rounded hover:bg-blue-100"
            title="Ask AI about this SKU"
            onClick={() => onAISkuClick(item.SKU)}
          >
            <MessageCircle className="h-3 w-3 text-blue-500" />
          </button>
        </span>
      );
    }
    return item[column.key];
  };

  return (
    <Card className={`group hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            {icon}
            {title}
          </CardTitle>
          
          {/* Toggle between Show All / Show Less for row analysis */}
          {showAllData && showOnlyActionable && onToggleShowAll && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onToggleShowAll}
              className="flex items-center gap-2"
            >
              {currentShowAll ? (
                <>
                  📋 Show Actionable Only
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {showOnlyActionable.length} items
                  </span>
                </>
              ) : (
                <>
                  📊 Show All Rows
                  <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">
                    {showAllData.length} total
                  </span>
                </>
              )}
            </Button>
          )}
          
          {/* Standard expand/collapse button */}
          {hasMore && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-60 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  Show Less
                  <ChevronUp className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Show All ({filteredAndSortedData.length})
                  <ChevronDown className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filters - Only show when expanded or when there's data */}
        {(isExpanded || displayData.length > 0) && (
          <div className="space-y-4 mb-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Advanced Filters - Only show when expanded */}
            {isExpanded && (
              <div className="flex flex-wrap gap-4">
                {/* Column Filter */}
                <div className="flex gap-2 items-center">
                  <Select value={filterColumn} onValueChange={setFilterColumn}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by..." />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column.key} value={column.key}>
                          {column.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filterColumn && (
                    <Input
                      placeholder="Filter value..."
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="w-40"
                    />
                  )}
                </div>
                
                {/* Clear Filters */}
                {(searchTerm || filterColumn || sortConfig) && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
            
            {/* Results Summary */}
            {(searchTerm || filterColumn) && (
              <div className="text-sm text-gray-600">
                Showing {filteredAndSortedData.length} of {displayData.length} items
                {isExpanded ? '' : ` (displaying first ${displayRows.length})`}
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className={`transition-all duration-300 ${isExpanded ? 'max-h-[70vh]' : 'max-h-[500px]'} overflow-y-auto`}>
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                {columns.map((column) => (
                  <TableHead 
                    key={column.key} 
                    className="cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {sortConfig?.key === column.key && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                      {(!sortConfig || sortConfig.key !== column.key) && (
                        <ArrowUpDown className="h-4 w-4 opacity-30" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.length > 0 ? (
                displayRows.map((item, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {renderCell(item, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    {searchTerm || filterColumn ? 'No matching results found' : 'No data available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Status Footer */}
        <div className="mt-4 text-sm text-slate-500 text-center">
          {isExpanded ? (
            <>Showing all {displayRows.length} of {filteredAndSortedData.length} items</>
          ) : (
            <>Showing {displayRows.length} of {filteredAndSortedData.length} items. {hasMore && 'Click "Show All" to see more.'}</>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function for status colors
export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};