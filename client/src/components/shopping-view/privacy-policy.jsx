import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black py-16 border-b border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-white mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how LUXERIDGE protects and manages your personal information.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12">
          
          {/* Last Updated */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>Last Updated:</strong> {new Date().getFullYear()}
            </p>
          </div>

          {/* Single Continuous Content Section */}
          <div className="space-y-8 text-gray-700 leading-relaxed">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Introduction</h2>
              <p className="mb-4">
                At LUXERIDGE we are committed to protecting your privacy and information.
              </p>
              <p>
                It is the policy of LUXERIDGE to act in accordance with current legislation and to meet
                the current best practice on the Internet. We aim to be responsible, relevant and secure
                when using your data.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Our Privacy Commitment</h2>
              <p className="mb-4">
                We never give out any of your personal information to 3rd parties, such as your name, 
                postcode, email address etc. If we feel there might be something of interest or use to you, 
                we will inform you ourselves using the details you have given.
              </p>
              <p>
                We do not log personal data via cookies, and we do not link any of your personal data 
                with third parties to build our customers' demographic.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Data Collection & Use</h2>
              <p className="mb-4">
                We collect data for the following purposes: Technical administration of the website, 
                to enhance your experience of the site, customer service and LUXERIDGE promotion.
              </p>
              <p className="mb-4">
                If we wish to use your personal data for any new purposes, we will ask for your 
                consent to such use in advance.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Data Sharing & Legal Compliance</h2>
              <p>
                We reserve the right to share your personal information if we are obliged to by law 
                and to enable us to apply our terms and conditions and other agreements. This includes 
                exchanging information with other organizations for fraud and credit risk reduction.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Data Security</h2>
              <p>
                Unfortunately, no data transmission over the Internet is 100% secure. As a result, 
                while we try to protect your personal information, LUXERIDGE cannot guarantee the security 
                of any information you transmit to us, and you do so at your own risk.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-black mb-4">Your Rights</h2>
              <p className="mb-6">
                If at any time you wish to be completely removed from all our systems or if you just 
                want to update any personal data we have about you or your business, then please 
                contact us by any means.
              </p>
            </div>

            {/* Fraud & Scam Awareness */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-black">Fraud & Scam Awareness</h2>
              </div>
              
              <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                <p className="text-gray-800 leading-relaxed mb-4 font-semibold">
                  LUXERIDGE never contacts customers to request advance payments, extra charges, 
                  or any financial transaction after an order has been placed.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Please exercise caution and do not engage with any such fraudulent calls, messages, 
                  or phishing attempts.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you encounter such activity, you are advised to immediately report the incident 
                  to the National Cyber Cell (Helpline: 1930) or lodge a complaint at{" "}
                  <a 
                    href="https://cybercrime.gov.in/Webform/Helpline.aspx" 
                    className="text-black hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://cybercrime.gov.in/Webform/Helpline.aspx
                  </a>.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Thank you for trusting LUXERIDGE with your personal information. 
              We are committed to protecting your privacy and providing a secure shopping experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;