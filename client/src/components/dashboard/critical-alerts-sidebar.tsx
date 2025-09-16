import { useState } from "react";
import { AlertTriangle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CriticalAlertsSidebarProps {
  alerts: any[];
}

export function CriticalAlertsSidebar({ alerts }: CriticalAlertsSidebarProps) {
  const [minimized, setMinimized] = useState(false);
  const criticalAlerts = alerts.filter(
    (a) => a.category?.toLowerCase() === "fraud indicator" || 
           a.category?.toLowerCase() === "pricing mismatch" ||
           a.category?.toLowerCase() === "risk concentration"
  );

  if (criticalAlerts.length === 0 && minimized) return null;

  return (
    <div
      className={`fixed top-20 right-0 z-50 transition-all duration-300 ${
        minimized ? "translate-x-full" : "translate-x-0"
      }`}
      style={{ width: minimized ? 48 : 340 }}
    >
      <div className="bg-white shadow-lg border-l border-red-200 h-[70vh] rounded-l-xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600 h-5 w-5" />
            <span className="font-semibold text-red-700 text-lg">Critical Insights</span>
            <Badge variant="destructive">{criticalAlerts.length}</Badge>
          </div>
          <button
            className="ml-2 p-1 rounded hover:bg-red-100"
            onClick={() => setMinimized(true)}
            title="Minimize"
          >
            <ChevronRight className="h-5 w-5 text-red-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {criticalAlerts.length === 0 ? (
            <div className="text-slate-500 text-sm">No critical insights 🎉</div>
          ) : (
            criticalAlerts.map((insight, idx) => (
              <button
                key={idx}
                className="w-full text-left p-3 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors flex flex-col gap-1"
                // onClick={() => scrollToRow(insight)} // For future scroll-to-row logic
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-800">{insight.title || "Insight"}</span>
                  <span className="text-xs text-red-600">{insight.category || "Category"}</span>
                </div>
                <div className="text-sm text-red-700">{insight.pattern_summary || insight.suggested_action || "No details available"}</div>
              </button>
            ))
          )}
        </div>
      </div>
      {minimized && (
        <button
          className="absolute top-1/2 -left-6 bg-red-50 border border-red-200 rounded-full p-1 shadow hover:bg-red-100"
          onClick={() => setMinimized(false)}
          title="Expand"
        >
          <ChevronLeft className="h-5 w-5 text-red-600" />
        </button>
      )}
    </div>
  );
} 