import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { LoginModal } from './LoginModal';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="animate-pulse flex items-center space-x-4">
          <Crown className="h-8 w-8 text-secondary animate-bounce" />
          <span className="text-xl font-semibold text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-4">
          <Card className="max-w-2xl w-full shadow-2xl border-0 bg-gradient-to-br from-white to-slate-50">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <div className="relative mx-auto w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-gold-gradient rounded-full flex items-center justify-center animate-pulse">
                    <Crown className="h-12 w-12 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Lock className="h-8 w-8 text-secondary animate-bounce-slow" />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-primary mb-4">
                Private Beta Access
              </h2>
              
              <div className="mb-8 space-y-4">
                <p className="text-xl text-slate-700 font-medium">
                  ClaimsLion AI is currently in <span className="text-secondary font-bold">private beta</span>.
                </p>
                <p className="text-slate-600">
                  Access is restricted to invited enterprise partners and authorized users only.
                </p>
              </div>

              <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-secondary mr-2" />
                  <span className="font-semibold text-slate-700">What's Coming</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-slate-800">AI Analysis</div>
                    <div className="text-slate-600">Advanced insurance claims intelligence</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-slate-800">Real-time Monitoring</div>
                    <div className="text-slate-600">24/7 inventory tracking</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-slate-800">Predictive Insights</div>
                    <div className="text-slate-600">Demand forecasting & trends</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => setShowLoginModal(true)}
                  className="bg-gold-gradient hover:glow-gold-strong text-primary font-bold px-8 py-3 text-lg shadow-xl"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Enterprise Login
                </Button>
                
                <p className="text-sm text-slate-500">
                  Need access? Contact our sales team at{' '}
                  <a href="mailto:sales@retaillionai.com" className="text-secondary hover:underline font-medium">
                    sales@retaillionai.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </>
    );
  }

  return <>{children}</>;
}