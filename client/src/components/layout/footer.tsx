import { useState } from "react";
import { Shield, Mail, Phone, MapPin, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const LegalModal = ({ isOpen, onClose, title, content }: LegalModalProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-primary flex items-center">
          <Shield className="mr-2 h-6 w-6 text-blue-600" />
          {title}
        </DialogTitle>
      </DialogHeader>
      <div className="prose prose-slate max-w-none">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </DialogContent>
  </Dialog>
);

const legalContent = {
  terms: `
    <h3>Terms of Use</h3>
    <p><strong>Last Updated:</strong> December 2024</p>
    
    <h4>1. Acceptance of Terms</h4>
    <p>By accessing and using ClaimsLionAI, you accept and agree to be bound by the terms and provision of this agreement.</p>
    
    <h4>2. Service Description</h4>
    <p>ClaimsLionAI provides AI-powered insurance claims processing services including fraud detection, cost analysis, and risk assessment.</p>
    
    <h4>3. User Obligations</h4>
    <p>Users must provide accurate data and use the service in compliance with applicable laws and regulations.</p>
    
    <h4>4. Intellectual Property</h4>
    <p>All content, features, and functionality are owned by ClaimsLionAI and protected by international copyright laws.</p>
    
    <h4>5. Limitation of Liability</h4>
    <p>ClaimsLionAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
  `,
  
  privacy: `
    <h3>Privacy Policy</h3>
    <p><strong>Last Updated:</strong> December 2024</p>
    
    <h4>1. Information We Collect</h4>
    <p>We collect information you provide directly, usage data, and technical information about your device and connection.</p>
    
    <h4>2. How We Use Information</h4>
    <p>We use collected information to provide, maintain, and improve our services, communicate with you, and ensure security.</p>
    
    <h4>3. Data Security</h4>
    <p>We implement enterprise-grade security measures to protect your data including encryption and access controls.</p>
    
    <h4>4. Data Sharing</h4>
    <p>We do not sell, trade, or rent your personal information to third parties without your explicit consent.</p>
    
    <h4>5. Your Rights</h4>
    <p>You have the right to access, update, delete, or port your data in accordance with applicable privacy laws.</p>
  `,
  
  dpa: `
    <h3>Data Processing Agreement</h3>
    <p><strong>Last Updated:</strong> December 2024</p>
    
    <h4>1. Purpose and Scope</h4>
    <p>This DPA governs the processing of personal data in connection with ClaimsLionAI services.</p>
    
    <h4>2. Data Controller and Processor</h4>
    <p>Customer acts as data controller, ClaimsLionAI acts as data processor for personal data submitted through the service.</p>
    
    <h4>3. Processing Instructions</h4>
    <p>Processing will be performed in accordance with customer instructions and applicable data protection laws.</p>
    
    <h4>4. Security Measures</h4>
    <p>We implement technical and organizational measures to ensure appropriate security of personal data.</p>
    
    <h4>5. Sub-processors</h4>
    <p>Any sub-processors will be subject to the same data protection obligations as outlined in this agreement.</p>
  `,
  
  sla: `
    <h3>Service Level Agreement</h3>
    <p><strong>Last Updated:</strong> December 2024</p>
    
    <h4>1. Service Availability</h4>
    <p>We guarantee 99.9% uptime for our AI analysis services, measured monthly excluding scheduled maintenance.</p>
    
    <h4>2. Performance Standards</h4>
    <p>Analysis completion time: 95% of claims processed within 5 minutes for files under 10MB.</p>
    
    <h4>3. Support Response Times</h4>
    <ul>
      <li>Critical issues: 1 hour response time</li>
      <li>High priority: 4 hours response time</li>
      <li>Medium priority: 24 hours response time</li>
      <li>Low priority: 72 hours response time</li>
    </ul>
    
    <h4>4. Service Credits</h4>
    <p>If we fail to meet our SLA commitments, you may be eligible for service credits as outlined in your subscription agreement.</p>
  `,
  
  aup: `
    <h3>Acceptable Use Policy</h3>
    <p><strong>Last Updated:</strong> December 2024</p>
    
    <h4>1. Permitted Uses</h4>
    <p>Use ClaimsLionAI for legitimate business purposes related to insurance claims processing and data analysis.</p>
    
    <h4>2. Prohibited Activities</h4>
    <ul>
      <li>Uploading malicious software or harmful content</li>
      <li>Attempting to reverse engineer our AI algorithms</li>
      <li>Using the service for illegal activities</li>
      <li>Sharing access credentials with unauthorized users</li>
    </ul>
    
    <h4>3. Data Requirements</h4>
    <p>Only upload data you have the legal right to process and analyze.</p>
    
    <h4>4. Enforcement</h4>
    <p>Violations may result in service suspension or termination without prior notice.</p>
  `,
  
  security: `
    <h3>Security & Compliance Statement</h3>
    <p><strong>Last Updated:</strong> December 2024</p>
    
    <h4>1. Security Framework</h4>
    <p>ClaimsLionAI implements a comprehensive security program based on industry best practices and standards.</p>
    
    <h4>2. Data Encryption</h4>
    <p>All data is encrypted in transit (TLS 1.3) and at rest (AES-256) using enterprise-grade encryption.</p>
    
    <h4>3. Compliance Certifications</h4>
    <ul>
      <li>SOC 2 Type II certified</li>
      <li>GDPR compliant</li>
      <li>ISO 27001 aligned</li>
      <li>CCPA compliant</li>
    </ul>
    
    <h4>4. Access Controls</h4>
    <p>Multi-factor authentication, role-based access controls, and regular access reviews ensure data security.</p>
    
    <h4>5. Incident Response</h4>
    <p>24/7 security monitoring with incident response procedures and customer notification protocols.</p>
  `
};

export default function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modalType: string) => setActiveModal(modalType);
  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-blue-500 mr-3" />
                <span className="text-2xl font-bold text-white">ClaimsLionAI</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                AI-powered claims processing that's instant, auditable, and relentless.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="text-gray-400">contact@claimslionai.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="text-gray-400">San Francisco, CA 94105</span>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-xl font-bold text-white mb-6">Legal</h4>
              <div className="space-y-3">
                <button 
                  onClick={() => openModal('terms')}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Use
                </button>
                <button 
                  onClick={() => openModal('privacy')}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => openModal('dpa')}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Data Processing Agreement
                </button>
                <button 
                  onClick={() => openModal('sla')}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Service Level Agreement
                </button>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xl font-bold text-white mb-6">Product</h4>
              <div className="space-y-3">
                <a href="#features" className="block text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">API Documentation</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Security</a>
              </div>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-xl font-bold text-white mb-6">Solutions</h4>
              <div className="space-y-3">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Purrfect Paws</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">ClaimsLion AI</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">HealthLionAI</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Enterprise</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 ClaimsLionAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <LegalModal
        isOpen={activeModal === 'terms'}
        onClose={closeModal}
        title="Terms of Use"
        content={legalContent.terms}
      />
      <LegalModal
        isOpen={activeModal === 'privacy'}
        onClose={closeModal}
        title="Privacy Policy"
        content={legalContent.privacy}
      />
      <LegalModal
        isOpen={activeModal === 'dpa'}
        onClose={closeModal}
        title="Data Processing Agreement"
        content={legalContent.dpa}
      />
      <LegalModal
        isOpen={activeModal === 'sla'}
        onClose={closeModal}
        title="Service Level Agreement"
        content={legalContent.sla}
      />
      <LegalModal
        isOpen={activeModal === 'aup'}
        onClose={closeModal}
        title="Acceptable Use Policy"
        content={legalContent.aup}
      />
      <LegalModal
        isOpen={activeModal === 'security'}
        onClose={closeModal}
        title="Security & Compliance Statement"
        content={legalContent.security}
      />
    </>
  );
}