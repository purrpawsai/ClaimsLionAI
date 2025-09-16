import { ExpandableChart } from "./expandable-chart";
import { BarChart3, TrendingUp } from "lucide-react";

interface ChartsProps {
  data: any;
}

export function Charts({ data }: ChartsProps) {
  // Use correct capitalized property names from JSON response
  const forecastHighlights = data?.ForecastHighlights || [];
  
  // Process ForecastHighlights into chart data
  const demandTrendsData = forecastHighlights.map((item: any) => {
    // Extract percentage change from forecast text
    const forecastText = item.Forecast || '';
    const match = forecastText.match(/(\d+)%/);
    const percentChange = match ? parseInt(match[1]) : 0;
    const isIncrease = forecastText.toLowerCase().includes('increased');
    
    return {
      name: `${item.SKU} - ${item.Region}`,
      change: isIncrease ? percentChange : -percentChange,
      sku: item.SKU,
      region: item.Region,
      forecast: forecastText
    };
  });

  const hasDemandTrends = demandTrendsData.length > 0;
  
  if (!hasDemandTrends) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
      <ExpandableChart
        title="Demand Trends"
        icon={<TrendingUp className="text-secondary mr-2 h-5 w-5" />}
        data={demandTrendsData}
        chartType="line"
        config={{
          lineConfigs: [
            {
              dataKey: "change",
              stroke: "hsl(217, 91%, 60%)",
              name: "Demand Change %"
            }
          ]
        }}
      />
    </div>
  );
}
