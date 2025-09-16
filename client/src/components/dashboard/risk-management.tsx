import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Activity, Clock, MapPin, Package } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RiskManagementProps {
  data: any;
}

export function RiskManagement({ data }: RiskManagementProps) {
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  
  const recommendations = data?.Recommendations || [];
  const forecastHighlights = data?.ForecastHighlights || [];
  const alerts = data?.Alerts || [];

  // Create risk matrix data
  const createRiskMatrix = () => {
    const riskMap = new Map();

    // Process recommendations for risk assessment
    recommendations.forEach((rec: any) => {
      const key = `${rec.SKU}-${rec.Region}`;
      if (!riskMap.has(key)) {
        riskMap.set(key, {
          sku: rec.SKU,
          region: rec.Region,
          recommendations: [],
          forecasts: [],
          alerts: [],
          riskScore: 0,
          riskLevel: 'Low',
          riskFactors: []
        });
      }
      riskMap.get(key).recommendations.push(rec);
    });

    // Add forecast data
    forecastHighlights.forEach((forecast: any) => {
      const key = `${forecast.SKU}-${forecast.Region}`;
      if (riskMap.has(key)) {
        riskMap.get(key).forecasts.push(forecast);
      }
    });

    // Add alerts
    alerts.forEach((alert: any) => {
      const key = `${alert.Product}-${alert.Warehouse}`;
      if (riskMap.has(key)) {
        riskMap.get(key).alerts.push(alert);
      }
    });

    // Calculate risk scores
    riskMap.forEach((item, key) => {
      let riskScore = 0;
      const riskFactors = [];

      // Critical alerts (+40 points)
      const criticalAlerts = item.alerts.filter((a: any) => a.Priority === 'Critical').length;
      if (criticalAlerts > 0) {
        riskScore += criticalAlerts * 40;
        riskFactors.push(`${criticalAlerts} critical alert(s)`);
      }

      // High priority recommendations (+20 points)
      const highPriorityRecs = item.recommendations.filter((r: any) => r.Priority === 'High' || r.Priority === 'Critical').length;
      if (highPriorityRecs > 0) {
        riskScore += highPriorityRecs * 20;
        riskFactors.push(`${highPriorityRecs} high priority action(s)`);
      }

      // Demand volatility assessment
      const demandDeclines = item.forecasts.filter((f: any) => f.Forecast?.toLowerCase().includes('decreased')).length;
      if (demandDeclines > 0) {
        riskScore += demandDeclines * 15;
        riskFactors.push('Demand decline detected');
      }

      // Stock-related risks
      const transferActions = item.recommendations.filter((r: any) => r.Action?.toLowerCase().includes('transfer')).length;
      if (transferActions > 0) {
        riskScore += transferActions * 10;
        riskFactors.push('Stock imbalance issues');
      }

      // Determine risk level
      let riskLevel = 'Low';
      if (riskScore >= 60) riskLevel = 'Critical';
      else if (riskScore >= 40) riskLevel = 'High';
      else if (riskScore >= 20) riskLevel = 'Medium';

      item.riskScore = riskScore;
      item.riskLevel = riskLevel;
      item.riskFactors = riskFactors;
    });

    return Array.from(riskMap.values());
  };

  const riskMatrix = createRiskMatrix();

  // Categorize risks
  const criticalRisks = riskMatrix.filter(r => r.riskLevel === 'Critical');
  const highRisks = riskMatrix.filter(r => r.riskLevel === 'High');
  const mediumRisks = riskMatrix.filter(r => r.riskLevel === 'Medium');

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'High': return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 'Medium': return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'Low': return 'bg-green-50 border-green-200 hover:bg-green-100';
      default: return 'bg-slate-50 border-slate-200 hover:bg-slate-100';
    }
  };

  const generateMitigationStrategy = (riskItem: any) => {
    const strategies = [];

    if (riskItem.alerts.length > 0) {
      riskItem.alerts.forEach((alert: any) => {
        if (alert.Type === 'Stockout Risk') {
          strategies.push('Immediate reorder recommendation');
          strategies.push('Consider emergency transfer from other regions');
        }
      });
    }

    const transferRecs = riskItem.recommendations.filter((r: any) => r.Action?.toLowerCase().includes('transfer'));
    if (transferRecs.length > 0) {
      strategies.push('Execute inter-region stock transfers');
      strategies.push('Optimize inventory distribution');
    }

    const reorderRecs = riskItem.recommendations.filter((r: any) => r.Action?.toLowerCase().includes('reorder'));
    if (reorderRecs.length > 0) {
      strategies.push('Adjust reorder quantities and frequencies');
      strategies.push('Review safety stock levels');
    }

    if (riskItem.forecasts.some((f: any) => f.Forecast?.toLowerCase().includes('decreased'))) {
      strategies.push('Monitor demand trends closely');
      strategies.push('Consider promotional activities');
    }

    if (strategies.length === 0) {
      strategies.push('Continue monitoring key metrics');
    }

    return strategies;
  };

  const RiskDetailModal = ({ riskItem }: { riskItem: any }) => (
    <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Risk Analysis: {riskItem.sku} - {riskItem.region}
        </DialogTitle>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Risk Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-3 rounded-lg ${getRiskColor(riskItem.riskLevel)}`}>
            <p className="text-sm opacity-80">Risk Level</p>
            <p className="text-xl font-bold">{riskItem.riskLevel}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm text-slate-600">Risk Score</p>
            <p className="text-xl font-bold text-slate-800">{riskItem.riskScore}/100</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-600">Actions Required</p>
            <p className="text-xl font-bold text-blue-800">{riskItem.recommendations.length}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-600">Alerts</p>
            <p className="text-xl font-bold text-purple-800">{riskItem.alerts.length}</p>
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <h4 className="font-semibold mb-3">Risk Factors</h4>
          <div className="flex flex-wrap gap-2">
            {riskItem.riskFactors.map((factor: string, index: number) => (
              <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {factor}
              </Badge>
            ))}
          </div>
        </div>

        {/* Mitigation Strategies */}
        <div>
          <h4 className="font-semibold mb-3">Recommended Mitigation Strategies</h4>
          <div className="space-y-2">
            {generateMitigationStrategy(riskItem).map((strategy: string, index: number) => (
              <div key={index} className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{strategy}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Recommendations */}
        <div>
          <h4 className="font-semibold mb-3">Action Items ({riskItem.recommendations.length})</h4>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskItem.recommendations.map((rec: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{rec.Action}</TableCell>
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
        {riskItem.alerts.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Active Alerts ({riskItem.alerts.length})</h4>
            <div className="space-y-2">
              {riskItem.alerts.map((alert: any, index: number) => (
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

  if (riskMatrix.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Risk Management Dashboard</h2>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">{criticalRisks.length} Critical</Badge>
          <Badge variant="outline" className="border-orange-300 text-orange-700">{highRisks.length} High</Badge>
          <Badge variant="outline" className="border-yellow-300 text-yellow-700">{mediumRisks.length} Medium</Badge>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Critical Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{criticalRisks.length}</p>
              <p className="text-sm text-red-600">Require immediate attention</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-orange-700">
              <Activity className="h-5 w-5 mr-2" />
              Total Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {Math.round(riskMatrix.reduce((sum, item) => sum + item.riskScore, 0) / riskMatrix.length)}
              </p>
              <p className="text-sm text-orange-600">Average across all SKU-Region pairs</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-blue-700">
              <Clock className="h-5 w-5 mr-2" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">24h</p>
              <p className="text-sm text-blue-600">Recommended for critical risks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Heat Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Risk Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Critical Risks */}
            {criticalRisks.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-2">Critical Risks ({criticalRisks.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {criticalRisks.map((risk, index) => (
                    <Dialog key={`${risk.sku}-${risk.region}`}>
                      <DialogTrigger asChild>
                        <div className={`p-3 border rounded-lg cursor-pointer transition-colors ${getRiskBgColor(risk.riskLevel)}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-red-800">{risk.sku}</p>
                              <p className="text-sm text-red-600">{risk.region}</p>
                            </div>
                            <Badge className={getRiskColor(risk.riskLevel)}>
                              {risk.riskScore}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-red-700">
                              {risk.riskFactors.slice(0, 2).join(', ')}
                            </p>
                          </div>
                        </div>
                      </DialogTrigger>
                      <RiskDetailModal riskItem={risk} />
                    </Dialog>
                  ))}
                </div>
              </div>
            )}

            {/* High Risks */}
            {highRisks.length > 0 && (
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">High Risks ({highRisks.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {highRisks.slice(0, 8).map((risk, index) => (
                    <Dialog key={`${risk.sku}-${risk.region}`}>
                      <DialogTrigger asChild>
                        <div className={`p-3 border rounded-lg cursor-pointer transition-colors ${getRiskBgColor(risk.riskLevel)}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-orange-800">{risk.sku}</p>
                              <p className="text-sm text-orange-600">{risk.region}</p>
                            </div>
                            <Badge className={getRiskColor(risk.riskLevel)} variant="outline">
                              {risk.riskScore}
                            </Badge>
                          </div>
                        </div>
                      </DialogTrigger>
                      <RiskDetailModal riskItem={risk} />
                    </Dialog>
                  ))}
                </div>
                {highRisks.length > 8 && (
                  <p className="text-sm text-orange-600 mt-2">
                    +{highRisks.length - 8} more high risk items
                  </p>
                )}
              </div>
            )}

            {/* Medium Risks Summary */}
            {mediumRisks.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-700 mb-2">Medium Risks ({mediumRisks.length})</h4>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {mediumRisks.length} SKU-Region combinations require monitoring. 
                    Click "View All" in data tables below for detailed analysis.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 