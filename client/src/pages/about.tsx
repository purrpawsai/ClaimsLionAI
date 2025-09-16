import { Card, CardContent } from "@/components/ui/card";
import { Shield, Brain, Search, Check, Zap, UserCheck } from "lucide-react";
import Footer from "@/components/layout/footer";

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-primary mb-4">About ClaimsLionAI</h2>
        <p className="text-slate-600 text-lg max-w-3xl mx-auto">
          ClaimsLionAI is a comprehensive insurance claims processing platform that leverages artificial intelligence to help insurance companies detect fraud, optimize costs, and make smarter decisions across their entire claims ecosystem.
        </p>
      </div>

      {/* Core Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Fraud Detection */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center mb-6">
              <Search className="text-red-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-4">Fraud Detection</h3>
            
            <p className="text-slate-600 mb-6">
              Advanced AI algorithms analyze patterns across claims data to identify potential fraudulent activities in real-time, protecting your business from losses.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Check className="text-green-500 w-5 h-5" />
                <span className="text-sm text-slate-600">Pattern recognition algorithms</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="text-green-500 w-5 h-5" />
                <span className="text-sm text-slate-600">Real-time fraud scoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="text-green-500 w-5 h-5" />
                <span className="text-sm text-slate-600">Automated risk alerts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims Processing */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
              <Shield className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-4">Smart Claims Processing</h3>
            
            <p className="text-slate-600 mb-6">
              Streamline your claims workflow with intelligent automation that processes documents, validates information, and accelerates claim resolution.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Check className="text-green-500 w-5 h-5" />
                <span className="text-sm text-slate-600">Document analysis & OCR</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="text-green-500 w-5 h-5" />
                <span className="text-sm text-slate-600">Automated validation</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="text-green-500 w-5 h-5" />
                <span className="text-sm text-slate-600">Workflow optimization</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center mb-6">
              <Brain className="text-purple-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-4">Cost Intelligence</h3>
            
            <p className="text-slate-600 mb-6">
              Leverage AI-powered analytics to identify cost optimization opportunities and pricing trends across your entire claims portfolio.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Check className="text-green-500 w-5 h-5" />
                <span className="text-sm text-slate-600">Cost trend analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="text-green-500 w-5 h-5" />
                <span className="text-sm text-slate-600">Predictive cost modeling</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="text-green-500 w-5 h-5" />
                <span className="text-sm text-slate-600">ROI optimization</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-primary mb-4">Our Mission</h3>
            <p className="text-slate-700 text-lg leading-relaxed">
              To revolutionize the insurance industry by providing cutting-edge AI solutions that make claims processing faster, more accurate, and completely transparent. We believe every claim deserves intelligent analysis and fair treatment.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-primary mb-4">Our Vision</h3>
            <p className="text-slate-700 text-lg leading-relaxed">
              To become the leading AI platform for insurance intelligence, enabling insurers worldwide to eliminate fraud, optimize costs, and deliver exceptional customer experiences through the power of artificial intelligence.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-primary text-center mb-8">Why Choose ClaimsLionAI?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="text-blue-600 w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Lightning Fast</h4>
            <p className="text-slate-600 text-sm">Process claims 60% faster with AI automation</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-green-600 w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Fraud Protection</h4>
            <p className="text-slate-600 text-sm">94.7% accuracy in fraud detection</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="text-purple-600 w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">AI Intelligence</h4>
            <p className="text-slate-600 text-sm">Advanced machine learning insights</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="text-orange-600 w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Enterprise Ready</h4>
            <p className="text-slate-600 text-sm">SOC 2 certified and GDPR compliant</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-red-600 w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Deep Analysis</h4>
            <p className="text-slate-600 text-sm">Comprehensive pattern recognition</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-indigo-600 w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">24/7 Monitoring</h4>
            <p className="text-slate-600 text-sm">Continuous AI surveillance</p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <Card className="mb-12">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-primary text-center mb-6">Powered by Advanced Technology</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-slate-600 text-sm">Uptime Guarantee</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">5M+</div>
              <div className="text-slate-600 text-sm">Claims Processed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">$500M+</div>
              <div className="text-slate-600 text-sm">Fraud Prevented</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-slate-600 text-sm">Insurance Partners</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Compliance */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-6">Enterprise Security & Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Security Standards</h4>
              <ul className="space-y-2 text-slate-300">
                <li>• SOC 2 Type II Certified</li>
                <li>• ISO 27001 Compliant</li>
                <li>• End-to-end encryption (AES-256)</li>
                <li>• Multi-factor authentication</li>
                <li>• Role-based access controls</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Data Protection</h4>
              <ul className="space-y-2 text-slate-300">
                <li>• GDPR & CCPA Compliant</li>
                <li>• Data residency controls</li>
                <li>• 24/7 security monitoring</li>
                <li>• Regular security audits</li>
                <li>• Incident response protocols</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Footer />
    </div>
  );
}
