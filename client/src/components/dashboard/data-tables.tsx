import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, Package, AlertTriangle, Shield } from "lucide-react";
import { ExpandableTable, getStatusColor } from "./expandable-table";
import { ChatWindow } from "./chat-window";
import { useState } from "react";
import { MultiSelect } from "@/components/ui/multiselect"; // Assume a MultiSelect component or use Select with multiple
import { Button } from "@/components/ui/button";

interface DataTablesProps {
  data: any;
  analysisId: string;
  filename: string;
}

// AI chat bubble icon SVG (option 4)
const AIChatIcon = (props: any) => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <path d="M17 7h.01M12 7h.01M7 7h.01"/>
    <path d="M12 11h.01"/>
  </svg>
);

export function DataTables({ data, analysisId, filename, onAISkuClick }: any) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800";
      case "High": return "bg-yellow-100 text-yellow-800";
      case "Medium": return "bg-blue-100 text-blue-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendColor = (percent: number) => {
    if (percent >= 20) return 'bg-green-500';
    if (percent >= 5) return 'bg-yellow-400';
    if (percent <= -20) return 'bg-red-600';
    if (percent < 0) return 'bg-orange-400';
    return 'bg-gray-300';
  };

  // Define columns for different tables
  const recommendationColumns = [
    { key: 'SKU', label: 'SKU', render: (item: any) => (
      <span className="flex items-center gap-1">
        {item.SKU}
        <button
          className="ml-1 p-1 rounded hover:bg-blue-100"
          title="Ask AI about this SKU"
          onClick={() => onAISkuClick && onAISkuClick(item.SKU)}
        >
          <AIChatIcon className="text-blue-500" />
        </button>
      </span>
    ) },
    { key: 'Region', label: 'Region' },
    { key: 'Action', label: 'Action' },
    { key: 'Priority', label: 'Priority', render: (item: any) => {
      const priority = item.Priority || 'Medium';
      let colorClass = 'bg-blue-100 text-blue-800';
      
      if (priority === 'Critical') {
        colorClass = 'bg-red-100 text-red-800';
      } else if (priority === 'High') {
        colorClass = 'bg-orange-100 text-orange-800';
      } else if (priority === 'Low') {
        colorClass = 'bg-green-100 text-green-800';
      }
      
      return <Badge className={colorClass}>{priority}</Badge>;
    }},
    { key: 'Reason', label: 'Reason' },
    { key: 'SuggestedAction', label: 'Suggested Action' }
  ];

  const forecastColumns = [
    { key: 'SKU', label: 'SKU', render: (item: any) => (
      <span className="flex items-center gap-1">
        {item.SKU}
        <button
          className="ml-1 p-1 rounded hover:bg-blue-100"
          title="Ask AI about this SKU"
          onClick={() => onAISkuClick && onAISkuClick(item.SKU)}
        >
          <AIChatIcon className="text-blue-500" />
        </button>
      </span>
    ) },
    { key: 'Region', label: 'Region' },
    { key: 'Forecast', label: 'Forecast' },
    { key: 'Trend', label: 'Trend', render: (item: any) => {
      const forecast = item.Forecast || '';
      if (forecast.toLowerCase().includes('increased') || forecast.toLowerCase().includes('decreased')) {
        const match = forecast.match(/(-?\d+)%/);
        const percent = match ? parseInt(match[1]) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className={`h-3 w-16 rounded-full ${getTrendColor(percent)}`}></div>
            <span className="text-xs">{percent > 0 ? '+' : ''}{percent}%</span>
          </div>
        );
      }
      return <span className="text-xs text-gray-400">No Change</span>;
    }}
  ];

  const alertColumns = [
    { key: 'message', label: 'Alert Message' },
    { key: 'severity', label: 'Severity', render: (item: any) => {
      // Determine severity based on keywords in the message
      const message = item.message?.toLowerCase() || '';
      
      if (message.includes('critical') || message.includes('expired') || message.includes('immediate')) {
        return (
          <Badge className="bg-red-100 text-red-800">
            Critical
          </Badge>
        );
      } else if (message.includes('urgent') || message.includes('nearing expiry')) {
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            High
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Medium
          </Badge>
        );
      }
    }}
  ];

  // Use correct capitalized property names from JSON response
  const recommendations = data?.Recommendations || [];
  const forecastHighlights = data?.ForecastHighlights || [];
  const alerts = data?.Alerts || [];

  // Process recommendations to show detailed columns
  // Use the raw recommendation data with all fields visible
  const processedRecommendations = recommendations.map((rec: any, index: number) => {
    return {
      id: index,
      SKU: rec.SKU || 'N/A',
      Region: rec.Region || 'N/A', 
      Action: rec.Action || 'N/A',
      Priority: rec.Priority || 'Medium',
      Reason: rec.Reason || 'N/A',
      SuggestedAction: rec.SuggestedAction || rec.Action || 'N/A'
    };
  }) || [];

  // Normalize forecastHighlights keys to match table columns
  // Use the correct field names from the JSON response
  const processedForecastHighlights = forecastHighlights.map((item: any) => ({
    SKU: item.SKU || 'N/A',
    Region: item.Region || 'N/A',
    Forecast: item.Forecast || 'N/A',
    Trend: item.Forecast || 'N/A' // This will be processed by the render function
  }));

  // Convert alerts from strings to objects for table display
  // Handle both PascalCase (API) and camelCase (frontend) formats  
  const processedAlerts = alerts.map((alert: any, index: number) => {
    // Handle both string and object formats
    if (typeof alert === 'string') {
      return {
        id: index,
        message: alert
      };
    } else if (typeof alert === 'object' && alert !== null) {
      // Handle object format (may have nested structure)
      if (alert.message) {
        return {
          id: index,
          message: alert.message
        };
      } else {
        // Convert object to readable message
        let message = '';
        if (alert.Message) {
          message = alert.Message;
        } else if (alert.Type && alert.Product && alert.Warehouse) {
          // Create a proper alert message based on the alert type
          if (alert.Type === 'Cold Chain Risk') {
            const expiryDate = new Date(alert.ExpiryDate);
            const today = new Date();
            const isExpired = expiryDate < today;
            
            if (isExpired) {
              const monthsExpired = Math.floor((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
              message = `${alert.Product} in ${alert.Warehouse} expired ${monthsExpired} months ago and should be removed from inventory`;
            } else {
              message = `${alert.Product} in ${alert.Warehouse} requires immediate cold chain attention - expires ${alert.ExpiryDate}`;
            }
          } else {
            message = `${alert.Type}: ${alert.Product} in ${alert.Warehouse}`;
            if (alert.ExpiryDate) {
              message += ` (expiry: ${alert.ExpiryDate})`;
            }
          }
        } else {
          message = JSON.stringify(alert);
        }
        return {
          id: index,
          message: message
        };
      }
    }
    return {
      id: index,
      message: 'Unknown alert format'
    };
  }) || [];

  // Add state for multi-tag filters
  const [multiFilters, setMultiFilters] = useState<{ [key: string]: string[] }>({});

  // Advanced filtering state
  const [trendFilter, setTrendFilter] = useState<'all' | 'increase' | 'decrease'>('all');
  const [dateFilter, setDateFilter] = useState('all'); // Placeholder, e.g. '7d', '30d', 'yoy', 'all'

  // Advanced filter bar for forecast highlights
  const ForecastFilterBar = () => (
    <div className="flex flex-wrap gap-4 mb-4 items-center">
      <div className="flex gap-2">
        <Button variant={trendFilter === 'all' ? 'default' : 'outline'} onClick={() => setTrendFilter('all')}>All</Button>
        <Button variant={trendFilter === 'increase' ? 'default' : 'outline'} onClick={() => setTrendFilter('increase')}>Increase</Button>
        <Button variant={trendFilter === 'decrease' ? 'default' : 'outline'} onClick={() => setTrendFilter('decrease')}>Decrease</Button>
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-sm text-slate-600">Date:</span>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="7d">Last 7d</option>
          <option value="30d">Last 30d</option>
          <option value="yoy">Year-over-Year</option>
        </select>
      </div>
    </div>
  );

  // Filter forecast highlights by trend and date
  const filteredForecastHighlights = processedForecastHighlights.filter((item: any) => {
    const forecast = item.Forecast?.toLowerCase() || '';
    if (trendFilter === 'increase' && !forecast.includes('increased')) return false;
    if (trendFilter === 'decrease' && !forecast.includes('decreased')) return false;
    // Date filter placeholder: always true for now
    return true;
  });

  // Add a filter bar above the table
  const FilterBar = ({ columns, data }) => (
    <div className="flex flex-wrap gap-4 mb-4">
      {columns.map((col) => (
        <MultiSelect
          key={col.key}
          label={col.label}
          options={[...new Set(data.map((row) => row[col.key]))].filter(Boolean).map((v) => ({ label: v, value: v }))}
          value={multiFilters[col.key] || []}
          onChange={(vals) => setMultiFilters((prev) => ({ ...prev, [col.key]: vals }))}
          placeholder={`Filter ${col.label}`}
        />
      ))}
    </div>
  );

  // Update processedRecommendations/processedForecastHighlights/processedAlerts filtering logic to support multi-tag filtering
  const filterRows = (rows, columns) => {
    let filtered = [...rows];
    Object.entries(multiFilters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        filtered = filtered.filter((item) => values.includes(String(item[key])));
      }
    });
    return filtered;
  };

  return (
    <div className="space-y-8">
      {/* Full Width - Recommended Actions */}
      <FilterBar columns={recommendationColumns} data={processedRecommendations} />
      <ExpandableTable
        title="Recommended Actions"
        icon={<Lightbulb className="text-warning mr-2 h-5 w-5" />}
        data={filterRows(processedRecommendations, recommendationColumns)}
        columns={recommendationColumns}
        maxPreviewRows={5}
      />
      {/* Two Column Layout - Forecast Highlights with Chat */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Column - Forecast Highlights */}
        <div className="xl:col-span-2">
          <ForecastFilterBar />
          <FilterBar columns={forecastColumns} data={filteredForecastHighlights} />
          <ExpandableTable
            title="Forecast Highlights"
            icon={<TrendingUp className="text-info mr-2 h-5 w-5" />}
            data={filterRows(filteredForecastHighlights, forecastColumns)}
            columns={forecastColumns}
            maxPreviewRows={5}
          />
        </div>
        {/* Right Column - Chat Window */}
        <div className="xl:col-span-1 h-full">
          {/* Always show ChatWindow if analysisId is present, and ensure it is linked to the analysis */}
          {analysisId ? (
            <div className="sticky top-4">
              <ChatWindow analysisId={analysisId} filename={filename} />
            </div>
          ) : (
            <div className="h-[500px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 text-slate-400">
              <span>No analysis selected for chat.</span>
            </div>
          )}
        </div>
      </div>
      {/* Alerts Table Only */}
      {processedAlerts && processedAlerts.length > 0 && (
        <>
          <FilterBar columns={alertColumns} data={processedAlerts} />
          <ExpandableTable
            title="Alerts"
            icon={<AlertTriangle className="text-red-500 mr-2 h-5 w-5" />}
            data={filterRows(processedAlerts, alertColumns)}
            columns={alertColumns}
            maxPreviewRows={5}
            className="mb-8"
          />
        </>
      )}
    </div>
  );
}