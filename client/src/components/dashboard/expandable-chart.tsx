import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { Expand } from "lucide-react";

interface ExpandableChartProps {
  title: string;
  icon: React.ReactNode;
  data: any[];
  chartType: 'bar' | 'line';
  config: {
    dataKey?: string;
    lineConfigs?: Array<{
      dataKey: string;
      stroke: string;
      name: string;
    }>;
    barConfig?: {
      dataKey: string;
      fill: string;
    };
  };
}

export function ExpandableChart({ title, icon, data, chartType, config }: ExpandableChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!data || data.length === 0) {
    return null;
  }

  const ChartComponent = ({ height = 300 }: { height?: number }) => (
    <ResponsiveContainer width="100%" height={height}>
      {chartType === 'bar' ? (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey={config.barConfig?.dataKey || 'value'} fill={config.barConfig?.fill || 'hsl(38, 92%, 50%)'} />
        </BarChart>
      ) : (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {config.lineConfigs?.map((lineConfig, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={lineConfig.dataKey}
              stroke={lineConfig.stroke}
              name={lineConfig.name}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      )}
    </ResponsiveContainer>
  );

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            {icon}
            {title}
          </CardTitle>
          <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-60 group-hover:opacity-100 transition-opacity">
                <Expand className="h-4 w-4 mr-2" />
                Expand
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  {icon}
                  {title} - Expanded View
                </DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <ChartComponent height={500} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ChartComponent />
      </CardContent>
    </Card>
  );
}