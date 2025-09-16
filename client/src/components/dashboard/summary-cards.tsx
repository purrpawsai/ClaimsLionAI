import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, BarChart, Target, Search, Filter, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SummaryCardsProps {
  data: any;
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [searchTermHigh, setSearchTermHigh] = useState("");
  const [searchTermGrowth, setSearchTermGrowth] = useState("");
  const [searchTermInsights, setSearchTermInsights] = useState("");
  const [searchTermCoverage, setSearchTermCoverage] = useState("");
  
  // Sorting states for each modal
  const [sortConfigHigh, setSortConfigHigh] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [sortConfigGrowth, setSortConfigGrowth] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [sortConfigInsights, setSortConfigInsights] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [sortConfigCoverage, setSortConfigCoverage] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // Filter states for each modal
  const [filterColumnHigh, setFilterColumnHigh] = useState("");
  const [filterValueHigh, setFilterValueHigh] = useState("");
  const [filterColumnGrowth, setFilterColumnGrowth] = useState("");
  const [filterValueGrowth, setFilterValueGrowth] = useState("");
  const [filterColumnInsights, setFilterColumnInsights] = useState("");
  const [filterValueInsights, setFilterValueInsights] = useState("");
  const [filterColumnCoverage, setFilterColumnCoverage] = useState("");
  const [filterValueCoverage, setFilterValueCoverage] = useState("");

  // Use the ClaimsLionAI data structure
  const insights = data?.Insights || [];
  const auditSummary = data?.AuditSummary || {};
  
  // Count high-priority insights (fraud indicators and pricing mismatches)
  const highPriorityActions = insights.filter((insight: any) => 
    (insight.Category || insight.category)?.toLowerCase() === 'fraud indicator' || 
    (insight.Category || insight.category)?.toLowerCase() === 'pricing mismatch' ||
    (insight.Category || insight.category)?.toLowerCase() === 'risk concentration'
  );
  
  // Count portfolio leakage insights
  const portfolioLeakageInsights = insights.filter((insight: any) => 
    (insight.Category || insight.category)?.toLowerCase() === 'portfolio leakage' ||
    (insight.Category || insight.category)?.toLowerCase() === 'underwriting gap'
  );
  
  // Calculate total insights
  const totalInsights = insights.length;
  
  // Calculate action coverage percentage (insights with suggested actions)
  const actionableInsights = insights.filter((insight: any) => 
    insight.suggested_action && insight.suggested_action.trim() !== ''
  );
  const actionCoverage = totalInsights > 0 ? Math.round((actionableInsights.length / totalInsights) * 100) : 100;

  // Enhanced filter and sort function
  const filterAndSortItems = (
    items: any[], 
    searchTerm: string, 
    sortConfig: { key: string; direction: 'asc' | 'desc' } | null,
    filterColumn: string,
    filterValue: string
  ) => {
    let filtered = [...items];
    
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
    
    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  };

  // Get unique values for filter dropdown
  const getUniqueValues = (items: any[], key: string) => {
    const uniqueValues = Array.from(new Set(items.map(item => String(item[key])))).filter(Boolean);
    return uniqueValues;
  };

  // Sort handler
  const handleSort = (key: string, sortConfig: any, setSortConfig: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Clear filters handler
  const clearFilters = (
    setSearchTerm: any,
    setFilterColumn: any, 
    setFilterValue: any,
    setSortConfig: any
  ) => {
    setSearchTerm('');
    setFilterColumn('');
    setFilterValue('');
    setSortConfig(null);
  };

  // Filter processed data for each modal
  const filteredHighPriorityActions = useMemo(() => 
    filterAndSortItems(highPriorityActions, searchTermHigh, sortConfigHigh, filterColumnHigh, filterValueHigh),
    [highPriorityActions, searchTermHigh, sortConfigHigh, filterColumnHigh, filterValueHigh]
  );

  const filteredPortfolioLeakage = useMemo(() =>
    filterAndSortItems(portfolioLeakageInsights, searchTermGrowth, sortConfigGrowth, filterColumnGrowth, filterValueGrowth),
    [portfolioLeakageInsights, searchTermGrowth, sortConfigGrowth, filterColumnGrowth, filterValueGrowth]
  );

  const filteredActionableInsights = useMemo(() =>
    filterAndSortItems(actionableInsights, searchTermCoverage, sortConfigCoverage, filterColumnCoverage, filterValueCoverage),
    [actionableInsights, searchTermCoverage, sortConfigCoverage, filterColumnCoverage, filterValueCoverage]
  );

  // Sortable table header component
  const SortableTableHead = ({ column, sortConfig, onSort, children }: any) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortConfig?.key === column && (
          sortConfig.direction === 'asc' ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
        )}
        {(!sortConfig || sortConfig.key !== column) && (
          <ArrowUpDown className="h-4 w-4 opacity-30" />
        )}
      </div>
    </TableHead>
  );

  // Filter controls component
  const FilterControls = ({ 
    searchTerm, setSearchTerm, 
    filterColumn, setFilterColumn,
    filterValue, setFilterValue,
    items, columns, onClearFilters 
  }: any) => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search all columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Column Filter */}
        <div className="flex gap-2">
          <Select value={filterColumn} onValueChange={setFilterColumn}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by column" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((column: any) => (
                <SelectItem key={column.key} value={column.key}>
                  {column.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {filterColumn && (
            <Select value={filterValue} onValueChange={setFilterValue}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter value" />
              </SelectTrigger>
              <SelectContent>
                {getUniqueValues(items, filterColumn).map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {/* Clear Filters */}
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );

  const renderHighPriorityModal = () => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <AlertTriangle className="text-red-600 mr-2 h-5 w-5" />
          Critical Insights ({highPriorityActions.length})
        </DialogTitle>
      </DialogHeader>
      <div className="flex-1 overflow-hidden flex flex-col">
        <FilterControls 
          searchTerm={searchTermHigh} 
          setSearchTerm={setSearchTermHigh} 
          filterColumn={filterColumnHigh} 
          setFilterColumn={setFilterColumnHigh} 
          filterValue={filterValueHigh} 
          setFilterValue={setFilterValueHigh} 
          items={highPriorityActions} 
          columns={[
            { key: 'category', label: 'Category' },
            { key: 'title', label: 'Title' },
            { key: 'pattern_summary', label: 'Pattern Summary' },
            { key: 'suggested_action', label: 'Suggested Action' }
          ]} 
          onClearFilters={() => clearFilters(setSearchTermHigh, setFilterColumnHigh, setFilterValueHigh, setSortConfigHigh)}
        />
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead column="category" sortConfig={sortConfigHigh} onSort={(col: string) => handleSort(col, sortConfigHigh, setSortConfigHigh)}>Category</SortableTableHead>
                <SortableTableHead column="title" sortConfig={sortConfigHigh} onSort={(col: string) => handleSort(col, sortConfigHigh, setSortConfigHigh)}>Title</SortableTableHead>
                <SortableTableHead column="pattern_summary" sortConfig={sortConfigHigh} onSort={(col: string) => handleSort(col, sortConfigHigh, setSortConfigHigh)}>Pattern Summary</SortableTableHead>
                <SortableTableHead column="suggested_action" sortConfig={sortConfigHigh} onSort={(col: string) => handleSort(col, sortConfigHigh, setSortConfigHigh)}>Suggested Action</SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHighPriorityActions.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant="destructive">
                      {item.category || 'Critical'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.title || 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {item.pattern_summary || 'No pattern summary available'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {item.suggested_action || 'No action suggested'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DialogContent>
  );

  const renderGrowthModal = () => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <TrendingUp className="text-green-600 mr-2 h-5 w-5" />
          Portfolio Leakage ({portfolioLeakageInsights.length})
        </DialogTitle>
      </DialogHeader>
      <div className="flex-1 overflow-hidden flex flex-col">
        <FilterControls 
          searchTerm={searchTermGrowth} 
          setSearchTerm={setSearchTermGrowth} 
          filterColumn={filterColumnGrowth} 
          setFilterColumn={setFilterColumnGrowth} 
          filterValue={filterValueGrowth} 
          setFilterValue={setFilterValueGrowth} 
          items={portfolioLeakageInsights} 
          columns={[
            { key: 'category', label: 'Category' },
            { key: 'title', label: 'Title' },
            { key: 'pattern_summary', label: 'Pattern Summary' },
            { key: 'suggested_action', label: 'Suggested Action' }
          ]} 
          onClearFilters={() => clearFilters(setSearchTermGrowth, setFilterColumnGrowth, setFilterValueGrowth, setSortConfigGrowth)}
        />
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead column="category" sortConfig={sortConfigGrowth} onSort={(col: string) => handleSort(col, sortConfigGrowth, setSortConfigGrowth)}>Category</SortableTableHead>
                <SortableTableHead column="title" sortConfig={sortConfigGrowth} onSort={(col: string) => handleSort(col, sortConfigGrowth, setSortConfigGrowth)}>Title</SortableTableHead>
                <SortableTableHead column="pattern_summary" sortConfig={sortConfigGrowth} onSort={(col: string) => handleSort(col, sortConfigGrowth, setSortConfigGrowth)}>Pattern Summary</SortableTableHead>
                <SortableTableHead column="suggested_action" sortConfig={sortConfigGrowth} onSort={(col: string) => handleSort(col, sortConfigGrowth, setSortConfigGrowth)}>Suggested Action</SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPortfolioLeakage.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {item.category || 'Portfolio Leakage'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.title || 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {item.pattern_summary || 'No pattern summary available'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {item.suggested_action || 'No action suggested'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DialogContent>
  );

  const renderInsightsModal = () => (
    <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <BarChart className="text-blue-600 mr-2 h-5 w-5" />
          All Insights ({totalInsights})
        </DialogTitle>
      </DialogHeader>
      <div className="flex-1 overflow-hidden flex flex-col">
        <FilterControls 
          searchTerm={searchTermInsights} 
          setSearchTerm={setSearchTermInsights} 
          filterColumn={filterColumnInsights} 
          setFilterColumn={setFilterColumnInsights} 
          filterValue={filterValueInsights} 
          setFilterValue={setFilterValueInsights} 
          items={insights} 
          columns={[
            { key: 'category', label: 'Category' },
            { key: 'title', label: 'Title' },
            { key: 'pattern_summary', label: 'Pattern Summary' },
            { key: 'suggested_action', label: 'Suggested Action' }
          ]} 
          onClearFilters={() => clearFilters(setSearchTermInsights, setFilterColumnInsights, setFilterValueInsights, setSortConfigInsights)}
        />
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead column="category" sortConfig={sortConfigInsights} onSort={(col: string) => handleSort(col, sortConfigInsights, setSortConfigInsights)}>Category</SortableTableHead>
                <SortableTableHead column="title" sortConfig={sortConfigInsights} onSort={(col: string) => handleSort(col, sortConfigInsights, setSortConfigInsights)}>Title</SortableTableHead>
                <SortableTableHead column="pattern_summary" sortConfig={sortConfigInsights} onSort={(col: string) => handleSort(col, sortConfigInsights, setSortConfigInsights)}>Pattern Summary</SortableTableHead>
                <SortableTableHead column="suggested_action" sortConfig={sortConfigInsights} onSort={(col: string) => handleSort(col, sortConfigInsights, setSortConfigInsights)}>Suggested Action</SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterAndSortItems(insights, searchTermInsights, sortConfigInsights, filterColumnInsights, filterValueInsights).map((insight: any, index: number) => (
                <TableRow key={`insight-${index}`}>
                  <TableCell>
                    <Badge variant={
                      (insight.Category || insight.category)?.toLowerCase() === 'fraud indicator' ? 'destructive' :
                      (insight.Category || insight.category)?.toLowerCase() === 'pricing mismatch' ? 'destructive' :
                      (insight.Category || insight.category)?.toLowerCase() === 'risk concentration' ? 'destructive' :
                      'secondary'
                    }>
                      {insight.Category || insight.category || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{insight.Title || insight.title || 'N/A'}</TableCell>
                  <TableCell className="text-sm text-slate-600">{insight.PatternSummary || insight.pattern_summary || 'No pattern summary available'}</TableCell>
                  <TableCell className="text-sm text-slate-600">{insight.SuggestedAction || insight.suggested_action || 'No action suggested'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DialogContent>
  );

  const renderActionCoverageModal = () => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Target className="text-purple-600 mr-2 h-5 w-5" />
          Action Coverage ({actionCoverage}%)
        </DialogTitle>
      </DialogHeader>
      <div className="flex-1 overflow-hidden flex flex-col">
        <FilterControls 
          searchTerm={searchTermCoverage} 
          setSearchTerm={setSearchTermCoverage} 
          filterColumn={filterColumnCoverage} 
          setFilterColumn={setFilterColumnCoverage} 
          filterValue={filterValueCoverage} 
          setFilterValue={setFilterValueCoverage} 
          items={actionableInsights} 
          columns={[
            { key: 'category', label: 'Category' },
            { key: 'title', label: 'Title' },
            { key: 'suggested_action', label: 'Suggested Action' },
            { key: 'pattern_summary', label: 'Pattern Summary' }
          ]} 
          onClearFilters={() => clearFilters(setSearchTermCoverage, setFilterColumnCoverage, setFilterValueCoverage, setSortConfigCoverage)}
        />
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead column="category" sortConfig={sortConfigCoverage} onSort={(col: string) => handleSort(col, sortConfigCoverage, setSortConfigCoverage)}>Category</SortableTableHead>
                <SortableTableHead column="title" sortConfig={sortConfigCoverage} onSort={(col: string) => handleSort(col, sortConfigCoverage, setSortConfigCoverage)}>Title</SortableTableHead>
                <SortableTableHead column="suggested_action" sortConfig={sortConfigCoverage} onSort={(col: string) => handleSort(col, sortConfigCoverage, setSortConfigCoverage)}>Suggested Action</SortableTableHead>
                <SortableTableHead column="pattern_summary" sortConfig={sortConfigCoverage} onSort={(col: string) => handleSort(col, sortConfigCoverage, setSortConfigCoverage)}>Pattern Summary</SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActionableInsights.map((insight: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant={
                      insight.category?.toLowerCase() === 'fraud indicator' ? 'destructive' :
                      insight.category?.toLowerCase() === 'pricing mismatch' ? 'destructive' :
                      insight.category?.toLowerCase() === 'risk concentration' ? 'destructive' :
                      'secondary'
                    }>
                      {insight.category || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{insight.title || 'N/A'}</TableCell>
                  <TableCell className="text-sm text-slate-600">{insight.suggested_action || 'No action suggested'}</TableCell>
                  <TableCell className="text-sm text-slate-600">{insight.pattern_summary || 'No pattern summary available'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Dialog>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-red-600 h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Critical Insights</p>
                  <p className="text-2xl font-bold text-primary">{highPriorityActions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        {renderHighPriorityModal()}
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600 h-5 w-5" />
            </div>
            <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Portfolio Leakage</p>
                  <p className="text-2xl font-bold text-primary">{portfolioLeakageInsights.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
        </DialogTrigger>
        {renderGrowthModal()}
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart className="text-blue-600 h-5 w-5" />
            </div>
            <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Insights</p>
                  <p className="text-2xl font-bold text-primary">{totalInsights}</p>
            </div>
          </div>
        </CardContent>
      </Card>
        </DialogTrigger>
        {renderInsightsModal()}
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="text-purple-600 h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Action Coverage</p>
                  <p className="text-2xl font-bold text-primary">{actionCoverage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        {renderActionCoverageModal()}
      </Dialog>
    </div>
  );
}
