import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, TrendingDown, AlertTriangle, Star, Target } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SKUPerformanceProps {
  data: any;
}

export function SKUPerformance({ data }: SKUPerformanceProps) {
  const [selectedSKU, setSelectedSKU] = useState<string | null>(null);
  
  const recommendations = data?.Recommendations || [];
  const forecastHighlights = data?.ForecastHighlights || [];
  const alerts = data?.Alerts || [];

  // Extract unique SKUs and calculate metrics
  const skus = Array.from(new Set([
    ...recommendations.map((r: any) => r.SKU),
    ...forecastHighlights.map((f: any) => f.SKU)
  ].filter(Boolean)));

  const getSKUMetrics = (sku: string) => {
    const skuRecommendations = recommendations.filter((r: any) => r.SKU === sku);
    const skuForecasts = forecastHighlights.filter((f: any) => f.SKU === sku);
    const skuAlerts = alerts.filter((a: any) => a.Product === sku);

    // Calculate demand volatility (variance in growth percentages across regions)
    const growthPercentages = skuForecasts.map((f: any) => {
      const match = f.Forecast.match(/(-?\d+)%/);
      return match ? parseInt(match[1]) : 0;
    });

    const avgGrowth = growthPercentages.length > 0 
      ? Math.round(growthPercentages.reduce((a: number, b: number) => a + b, 0) / growthPercentages.length)
      : 0;

    // Calculate volatility (standard deviation)
    const variance = growthPercentages.length > 1 
      ? growthPercentages.reduce((acc: number, val: number) => acc + Math.pow(val - avgGrowth, 2), 0) / growthPercentages.length
      : 0;
    const volatility = Math.round(Math.sqrt(variance));

    // Performance score (higher is better)
    const growthRegions = skuForecasts.filter((f: any) => f.Forecast?.toLowerCase().includes('increased')).length;
    const totalRegions = skuForecasts.length;
    const performanceScore = totalRegions > 0 ? Math.round((growthRegions / totalRegions) * 100) : 50;

    // Risk assessment
    const criticalActions = skuRecommendations.filter((r: any) => r.Priority === 'Critical').length;
    const highActions = skuRecommendations.filter((r: any) => r.Priority === 'High').length;
    const riskLevel = criticalActions > 0 ? 'Critical' : 
                     highActions > 0 ? 'High' : 
                     volatility > 30 ? 'Medium' : 'Low';

    return {
      sku,
      avgGrowth,
      volatility,
      performanceScore,
      riskLevel,
      totalRegions,
      growthRegions,
      criticalActions,
      highActions,
      skuData: {
        recommendations: skuRecommendations,
        forecasts: skuForecasts,
        alerts: skuAlerts
      }
    };
  };

  const skuMetrics = skus.map(getSKUMetrics);

  // Sort SKUs by performance categories
  const topPerformers = skuMetrics
    .filter(s => s.performanceScore >= 75)
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 3);

  const underPerformers = skuMetrics
    .filter(s => s.performanceScore < 50)
    .sort((a, b) => a.performanceScore - b.performanceScore)
    .slice(0, 3);

  const highVolatility = skuMetrics
    .filter(s => s.volatility > 20)
    .sort((a, b) => b.volatility - a.volatility)
    .slice(0, 3);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const SKUDetailModal = ({ skuMetric }: { skuMetric: any }) => (
    <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5" />
          {skuMetric.sku} - SKU Analysis
        </DialogTitle>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* SKU Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-600">Performance Score</p>
            <p className={`text-xl font-bold ${getPerformanceColor(skuMetric.performanceScore)}`}>
              {skuMetric.performanceScore}%
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-600">Avg Growth</p>
            <p className={`text-xl font-bold ${skuMetric.avgGrowth >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              {skuMetric.avgGrowth >= 0 ? '+' : ''}{skuMetric.avgGrowth}%
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm text-orange-600">Volatility</p>
            <p className="text-xl font-bold text-orange-800">{skuMetric.volatility}%</p>
          </div>
          <div className={`p-3 rounded-lg ${getRiskColor(skuMetric.riskLevel)}`}>
            <p className="text-sm opacity-80">Risk Level</p>
            <p className="text-xl font-bold">{skuMetric.riskLevel}</p>
          </div>
        </div>

        {/* Regional Performance */}
        <div>
          <h4 className="font-semibold mb-3">Regional Performance ({skuMetric.totalRegions} Regions)</h4>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead>Forecast</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Action Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skuMetric.skuData.forecasts.map((forecast: any, index: number) => {
                  const recommendation = skuMetric.skuData.recommendations.find((r: any) => r.Region === forecast.Region);
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{forecast.Region}</TableCell>
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
                      <TableCell>
                        {recommendation && (
                          <Badge className={getRiskColor(recommendation.Priority)}>
                            {recommendation.Action}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold mb-3">Action Items ({skuMetric.skuData.recommendations.length})</h4>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skuMetric.skuData.recommendations.map((rec: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{rec.Region}</TableCell>
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

        {/* Alerts if any */}
        {skuMetric.skuData.alerts.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Critical Alerts ({skuMetric.skuData.alerts.length})</h4>
            <div className="space-y-2">
              {skuMetric.skuData.alerts.map((alert: any, index: number) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">{alert.Type}</p>
                      <p className="text-sm text-red-700">{alert.Message}</p>
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

  if (skuMetrics.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">SKU Performance Matrix</h2>
        <Badge variant="outline" className="text-slate-600">
          {skus.length} SKUs
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-green-700">
              <Star className="h-5 w-5 mr-2" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((sku, index) => (
                <Dialog key={sku.sku}>
                  <DialogTrigger asChild>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-green-800">{sku.sku}</p>
                          <p className="text-sm text-green-600">
                            {sku.growthRegions}/{sku.totalRegions} regions growing
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">{sku.performanceScore}%</p>
                          <p className="text-xs text-green-600">+{sku.avgGrowth}% avg</p>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <SKUDetailModal skuMetric={sku} />
                </Dialog>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No top performers identified</p>
            )}
          </CardContent>
        </Card>

        {/* Under Performers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-red-700">
              <TrendingDown className="h-5 w-5 mr-2" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {underPerformers.length > 0 ? (
              underPerformers.map((sku, index) => (
                <Dialog key={sku.sku}>
                  <DialogTrigger asChild>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-red-800">{sku.sku}</p>
                          <p className="text-sm text-red-600">
                            {sku.criticalActions + sku.highActions} priority actions
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-700">{sku.performanceScore}%</p>
                          <Badge className={getRiskColor(sku.riskLevel)} variant="outline">
                            {sku.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <SKUDetailModal skuMetric={sku} />
                </Dialog>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No concerning SKUs identified</p>
            )}
          </CardContent>
        </Card>

        {/* High Volatility */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-orange-700">
              <Target className="h-5 w-5 mr-2" />
              High Volatility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highVolatility.length > 0 ? (
              highVolatility.map((sku, index) => (
                <Dialog key={sku.sku}>
                  <DialogTrigger asChild>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-orange-800">{sku.sku}</p>
                          <p className="text-sm text-orange-600">
                            Across {sku.totalRegions} regions
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-700">{sku.volatility}%</p>
                          <p className="text-xs text-orange-600">volatility</p>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <SKUDetailModal skuMetric={sku} />
                </Dialog>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No high volatility SKUs</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 