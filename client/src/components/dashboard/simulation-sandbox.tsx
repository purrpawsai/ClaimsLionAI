import { useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SimulationSandboxProps {
  onSimulate: (scenario: string) => void;
  onReset: () => void;
  isSimulated: boolean;
}

export function SimulationSandbox({ onSimulate, onReset, isSimulated }: SimulationSandboxProps) {
  const [open, setOpen] = useState(false);
  const [scenario, setScenario] = useState('increase_20');

  return (
    <div>
      {/* Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-5 py-3 text-lg">
              <FlaskConical className="h-6 w-6 mr-1" />
              Simulate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Simulation Sandbox</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Scenario</label>
                <select
                  className="w-full border rounded px-2 py-2"
                  value={scenario}
                  onChange={e => setScenario(e.target.value)}
                >
                  <option value="increase_20">Increase reorder by 20%</option>
                  <option value="decrease_20">Decrease reorder by 20%</option>
                  <option value="freeze">Freeze reorders (0%)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { onSimulate(scenario); setOpen(false); }} className="bg-blue-600 hover:bg-blue-700 text-white">Simulate</Button>
                {isSimulated && (
                  <Button variant="outline" onClick={() => { onReset(); setOpen(false); }}>Reset to Actuals</Button>
                )}
                <Button variant="ghost" onClick={() => setOpen(false)}><X className="h-5 w-5" /></Button>
              </div>
              <div className="text-xs text-slate-500">Simulations are temporary and do not affect your real data.</div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 