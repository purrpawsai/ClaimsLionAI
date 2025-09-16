import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Brain, Search, ChartBar, CheckCircle, File, Play, UserCheck, ShoppingCart, Heart, PawPrint } from "lucide-react";
import { useState, useEffect } from "react";
import Footer from "@/components/layout/footer";

// Animated text component for ClaimsLionAI
const AnimatedText = () => {
  const modules = ["Fraud Detection", "Claims Processing", "Risk Assessment", "Cost Analysis"];
  const [currentModule, setCurrentModule] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentModule((prev) => (prev + 1) % modules.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-blue-300 font-semibold transition-all duration-500">
      {modules[currentModule]}
    </span>
  );
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-8 h-8 text-blue-300" />
                <span className="text-blue-200 font-medium">AI-Powered Claims Intelligence</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                AI-powered insurance intelligence.
                <span className="text-blue-300 block">Instant. Intelligent. Actionable.</span>
              </h1>
              <p className="text-xl text-blue-100 mb-4 leading-relaxed">
                Transform your insurance data analysis with cutting-edge AI that detects fraud patterns, analyzes cost trends, and provides actionable insights for smarter decision-making.
              </p>
              
              <div className="mb-8 text-lg font-semibold text-blue-100">
                <AnimatedText />. All in One.
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-blue-800 hover:bg-blue-50 px-8 py-4 text-lg">
                    <Play className="w-5 h-5 mr-2" />
                    Try Demo
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-800 px-8 py-4 text-lg">
                    <UserCheck className="w-5 h-5 mr-2" />
                    Login
                  </Button>
                </Link>
              </div>
              
              {/* Metrics Row */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-300 mb-2">94.7%</div>
                  <div className="font-semibold text-blue-200">Fraud Detection Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-300 mb-2">60%</div>
                  <div className="font-semibold text-blue-200">Faster Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-300 mb-2">24/7</div>
                  <div className="font-semibold text-blue-200">AI Monitoring</div>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* Dashboard Preview */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <span className="text-white/70 text-sm">ClaimsLion Dashboard</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-green-200 font-medium">Claim #CL-2024-001</span>
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">APPROVED</span>
                      </div>
                      <p className="text-green-100 text-sm mt-1">Vehicle damage assessment completed</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-200 font-medium">Claim #CL-2024-002</span>
                        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">PROCESSING</span>
                      </div>
                      <p className="text-blue-100 text-sm mt-1">Analyzing policy documents...</p>
                    </div>
                    <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-200 font-medium">AI Insights</span>
                        <ChartBar className="w-5 h-5 text-yellow-400" />
                      </div>
                      <p className="text-yellow-100 text-sm mt-1">3 fraud patterns detected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful AI-Driven Analysis</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your insurance data into actionable intelligence with advanced AI analysis
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">AI-Powered Intelligence</h3>
                </div>
                <p className="text-gray-700 text-lg mb-6">
                  Transform your insurance data with cutting-edge AI that detects fraud patterns, analyzes cost trends, and uncovers hidden insights across your entire portfolio.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Advanced fraud detection algorithms</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Cost optimization insights</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Pattern discovery and risk assessment</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-900 to-purple-900 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">AI Analysis in Progress...</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Fraud Pattern Detection</span>
                    <span className="text-green-400">✓ Complete</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cost Trend Analysis</span>
                    <span className="text-green-400">✓ Complete</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Risk Assessment</span>
                    <span className="text-yellow-400">⟳ Processing</span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-sm text-gray-300 mb-2">AI Intelligence Engine</div>
                  <div className="text-purple-400 font-mono text-xs">
                    {`{"patterns": 23, "confidence": 94.7, "anomalies_detected": 47}`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Intelligence Section - MAIN FEATURE */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">AI Intelligence - Our Core Platform</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlock the power of advanced AI to transform your insurance data into actionable intelligence
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold">AI Intelligence Dashboard</h4>
                  </div>
                  <p className="text-purple-100">Live insights and pattern detection</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Search className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-red-800">Fraud Pattern Detected</span>
                      </div>
                      <p className="text-red-700 text-sm">Red Camry models showing 23% higher claim frequency in Riyadh region</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <ChartBar className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-blue-800">Cost Trend Alert</span>
                      </div>
                      <p className="text-blue-700 text-sm">Mazda repair costs increased 15% in Q4 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-600 to-blue-700 text-white shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold">AI Intelligence Platform</h3>
                </div>
                <p className="text-purple-100 text-lg mb-6">
                  Discover hidden trends, fraud patterns, and pricing gaps across your entire insurance data with advanced AI analytics.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-1 rounded">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-medium">Advanced Pattern Recognition</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-1 rounded">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-medium">Real-time Fraud Detection</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-1 rounded">
                      <ChartBar className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-medium">Cost Optimization Intelligence</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-1 rounded">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-medium">Risk Assessment & Prediction</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solutions Ecosystem */}
      <section id="solutions" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete AI Solutions Ecosystem</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expand your AI capabilities across different industries with our integrated platform
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <PawPrint className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Purrfect Paws</h3>
                </div>
                <p className="text-gray-700 mb-6">AI-powered pet insurance claims processing with veterinary document analysis and treatment validation.</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Explore Pet Insurance AI
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-orange-600 p-3 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">ClaimsLion AI</h3>
                </div>
                <p className="text-gray-700 mb-6">Intelligent retail analytics for inventory optimization, demand forecasting, and customer behavior insights.</p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Explore Retail AI
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-red-600 p-3 rounded-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">HealthLionAI</h3>
                </div>
                <p className="text-gray-700 mb-6">Advanced healthcare analytics for medical claims processing, diagnosis support, and treatment optimization.</p>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Explore Health AI
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Claims Process?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join forward-thinking insurance companies already using ClaimsLion AI to process claims faster, more accurately, and with complete transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-blue-800 hover:bg-blue-50 px-8 py-4 text-lg">
                Start Free Demo
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-800 px-8 py-4 text-lg">
                Login to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
