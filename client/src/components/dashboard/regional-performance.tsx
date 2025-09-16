import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, TrendingDown, AlertTriangle, Package } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RegionalPerformanceProps {
  data: any;
}

export function RegionalPerformance({ data }: RegionalPerformanceProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  const recommendations = data?.Recommendations || [];
  const forecastHighlights = data?.ForecastHighlights || [];
  const alerts = data?.Alerts || [];

  // Extract unique regions
  const regions = Array.from(new Set([
    ...recommendations.map((r: any) => r.Region),
    ...forecastHighlights.map((f: any) => f.Region),
    ...alerts.map((a: any) => a.Warehouse)
  ].filter(Boolean)));

  // Calculate metrics for each region
  const getRegionalMetrics = (region: string) => {
    const regionRecommendations = recommendations.filter((r: any) => r.Region === region);
    const regionForecasts = forecastHighlights.filter((f: any) => f.Region === region);
    const regionAlerts = alerts.filter((a: any) => a.Warehouse === region);

    // Calculate growth opportunities (demand increases)
    const growthOpportunities = regionForecasts.filter((f: any) => 
      f.Forecast?.toLowerCase().includes('increased')
    ).length;

    // Calculate average growth percentage
    const growthPercentages = regionForecasts
      .filter((f: any) => f.Forecast?.toLowerCase().includes('increased'))
      .map((f: any) => {
        const match = f.Forecast.match(/(\d+)%/);
        return match ? parseInt(match[1]) : 0;
      });
    const avgGrowth = growthPercentages.length > 0 
      ? Math.round(growthPercentages.reduce((a: number, b: number) => a + b, 0) / growthPercentages.length)
      : 0;

    // Calculate risk level
    const highPriorityActions = regionRecommendations.filter((r: any) => 
      r.Priority === 'High' || r.Priority === 'Critical'
    ).length;
    const criticalAlerts = regionAlerts.filter((a: any) => 
      a.Priority === 'Critical'
    ).length;

    const riskLevel = criticalAlerts > 0 ? 'Critical' : 
                     highPriorityActions > 2 ? 'High' : 
                     highPriorityActions > 0 ? 'Medium' : 'Low';

    return {
      region,
      totalSKUs: new Set(regionRecommendations.map((r: any) => r.SKU)).size,
      totalActions: regionRecommendations.length,
      growthOpportunities,
      avgGrowth,
      riskLevel,
      criticalAlerts,
      highPriorityActions,
      regionData: {
        recommendations: regionRecommendations,
        forecasts: regionForecasts,
        alerts: regionAlerts
      }
    };
  };

  const regionalMetrics = regions.map(getRegionalMetrics);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const RegionalDetailModal = ({ regionMetric }: { regionMetric: any }) => (
    <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          {regionMetric.region} - Regional Analysis
        </DialogTitle>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Region Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-600">Total SKUs</p>
            <p className="text-xl font-bold text-blue-800">{regionMetric.totalSKUs}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-600">Growth Items</p>
            <p className="text-xl font-bold text-green-800">{regionMetric.growthOpportunities}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-600">Avg Growth</p>
            <p className="text-xl font-bold text-purple-800">+{regionMetric.avgGrowth}%</p>
          </div>
          <div className={`p-3 rounded-lg ${getRiskColor(regionMetric.riskLevel)}`}>
            <p className="text-sm opacity-80">Risk Level</p>
            <p className="text-xl font-bold">{regionMetric.riskLevel}</p>
          </div>
        </div>

        {/* Recommendations Table */}
        <div>
          <h4 className="font-semibold mb-3">Regional Recommendations ({regionMetric.regionData.recommendations.length})</h4>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionMetric.regionData.recommendations.map((rec: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{rec.SKU}</TableCell>
                    <TableCell>{rec.Action}</TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(rec.Priority)}>
                        {rec.Priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{rec.Reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Forecasts Table */}
        <div>
          <h4 className="font-semibold mb-3">Demand Forecasts ({regionMetric.regionData.forecasts.length})</h4>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Forecast</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionMetric.regionData.forecasts.map((forecast: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{forecast.SKU}</TableCell>
                    <TableCell>{forecast.Forecast}</TableCell>
                    <TableCell>
                      {forecast.Forecast?.toLowerCase().includes('increased') ? (
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Growth
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Decline
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Alerts if any */}
        {regionMetric.regionData.alerts.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Critical Alerts ({regionMetric.regionData.alerts.length})</h4>
            <div className="space-y-2">
              {regionMetric.regionData.alerts.map((alert: any, index: number) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">{alert.Type}</p>
                      <p className="text-sm text-red-700">{alert.Message}</p>
                      <p className="text-xs text-red-600 mt-1">Product: {alert.Product}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );

  if (regionalMetrics.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Regional Performance</h2>
        <Badge variant="outline" className="text-slate-600">
          {regions.length} Regions
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regionalMetrics.map((metric) => (
          <Dialog key={metric.region}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      <span className="text-lg">{metric.region}</span>
                    </div>
                    <Badge className={getRiskColor(metric.riskLevel)}>
                      {metric.riskLevel}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{metric.totalSKUs}</p>
                      <p className="text-xs text-slate-600">SKUs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{metric.growthOpportunities}</p>
                      <p className="text-xs text-slate-600">Growth Items</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Avg Growth:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +{metric.avgGrowth}%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Actions:</span>
                      <span className="font-medium">{metric.totalActions}</span>
                    </div>
                    
                    {metric.criticalAlerts > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">Critical Alerts:</span>
                        <Badge variant="destructive">{metric.criticalAlerts}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <RegionalDetailModal regionMetric={metric} />
          </Dialog>
        ))}
      </div>
    </div>
  );
} 