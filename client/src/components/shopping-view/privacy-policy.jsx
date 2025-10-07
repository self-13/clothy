import { Shield, Lock, Eye, UserCheck, Database, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-white mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we protect and manage your personal information.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-8 md:p-12">
          
          {/* Last Updated */}
          <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm text-indigo-700">
              <strong>Last Updated:</strong> {new Date().getFullYear()}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold text-gray-800">Introduction</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              At StyleHub, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold text-gray-800">Information We Collect</h2>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Name and contact details</li>
                  <li>Shipping and billing addresses</li>
                  <li>Payment information</li>
                  <li>Order history and preferences</li>
                </ul>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="font-semibold text-gray-800 mb-2">Technical Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>IP address and browser type</li>
                  <li>Device information</li>
                  <li>Cookies and usage data</li>
                  <li>Website interaction patterns</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold text-gray-800">How We Use Your Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                <h3 className="font-semibold text-gray-800 mb-2">Order Processing</h3>
                <p className="text-sm text-gray-600">
                  Process and fulfill your orders, manage payments, and arrange shipping.
                </p>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                <h3 className="font-semibold text-gray-800 mb-2">Customer Support</h3>
                <p className="text-sm text-gray-600">
                  Provide customer service and respond to your inquiries and requests.
                </p>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                <h3 className="font-semibold text-gray-800 mb-2">Personalization</h3>
                <p className="text-sm text-gray-600">
                  Personalize your shopping experience and recommend products you may like.
                </p>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                <h3 className="font-semibold text-gray-800 mb-2">Marketing</h3>
                <p className="text-sm text-gray-600">
                  Send you promotional communications with your consent.
                </p>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <UserCheck className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold text-gray-800">Data Protection</h2>
            </div>
            
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-gray-800 mb-4">We implement appropriate security measures including:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>SSL encryption for data transmission</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Regular security assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span>Access controls and authentication</span>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold text-gray-800">Your Rights</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                You have the right to access, correct, or delete your personal information. 
                You may also object to or restrict certain processing of your data.
              </p>
              
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Contact Us</h3>
                <p className="text-gray-600 mb-3">
                  For any privacy-related questions or to exercise your rights, please contact us:
                </p>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Privacy Team
                </Button>
              </div>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          {/* Footer Note */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Thank you for trusting StyleHub with your personal information. 
              We are committed to protecting your privacy and providing a secure shopping experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;