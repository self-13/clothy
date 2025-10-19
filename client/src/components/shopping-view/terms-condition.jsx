import { FileText, Shield, AlertTriangle } from "lucide-react";

function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black py-16 border-b border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-white mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Terms & Conditions
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Please read these terms carefully before using Luxeridge services
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

          {/* Continuous Content Section */}
          <div className="space-y-8 text-gray-700 leading-relaxed">
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">INTRODUCTION AND OVERVIEW OF LUXERIDGE</h2>
              <p className="mb-4">
                This policy applies to all the luxeridge platforms (the "Site" or "Web Site" or "Mobile Application" or "App" or "Us" or "We" or "Social Media Platforms"), which is operated and owned by Luxeridge Apparels Pvt. Ltd., marketed and/or managed by luxeridge Apparels Pvt. Ltd.
              </p>
              <p className="mb-4">
                It is LUXERIDGE policy to comply with general laws for protecting user information and bank details shared for the purpose of availing LUXERIDGE services. This regulates the processing of information relating to you and grants you various rights in respect of your personal data.
              </p>
              <p className="mb-4">
                Any Images, Data or Files Uploaded on the website must not be used without the consent of the authorized personnel of the brand.
              </p>
              <p>
                The Web Site contains links to other websites over which we have no control. Luxeridge is not responsible for the privacy policies or practices of other web sites to which you choose to link from theluxeridge.com. We encourage you to review the privacy policies of those other web sites so you can understand how they collect, use and share your information.
              </p>
            </div>

            {/* Privacy Policy Section */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">PRIVACY POLICY</h2>
              <p className="mb-4">
                This Privacy Policy is intended for all Users of theluxeridge.com. LUXERIDGE is dedicated to respecting and protecting the privacy of our Users. All information User provides, such as phone number, home address, current location, e-mail addresses or any additional personal information found on the site, will be used solely to support User relationship with LUXERIDGE.
              </p>
              <p className="mb-4">
                LUXERIDGE strives to develop innovative methods to serve Users even better. LUXERIDGE is designed to operate efficiently while keeping the user's privacy in mind.
              </p>
              <p className="mb-4">
                This Privacy Policy outlines the types of personal information that LUXERIDGE gathers from its users and takes steps to safeguard it. In order to provide a personalized browsing experience, LUXERIDGE may collect information from you, which may include technical or other related information from the device used to access LUXERIDGE platforms including without limitation to your current location.
              </p>
              <p className="mb-4">
                By registering or using or visiting LUXERIDGE platforms, you explicitly accept, without limitation or qualification, the collection, use and transfer of the personal information provided by you in the manner described in the Terms & Conditions and Privacy Policy. Kindly read the Terms & Conditions and the Privacy Policy carefully as it affects your rights and liabilities under law. If you do not accept the Terms and Conditions and this Privacy Policy, PLEASE DO NOT USE LUXERIDGE SERVICES.
              </p>
              <p>
                LUXERIDGE reserves the right to take any rightful legal action against the customer if any fraudulent activity is identified such as multiple usage & abuse of coupon code, wrong claims for orders etc.
              </p>
            </div>

            {/* Fraud Awareness */}
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-bold text-black">Fraud & Scam Awareness</h3>
              </div>
              <p className="text-gray-800 leading-relaxed mb-4 font-semibold">
                LUXERIDGE never contacts customers to request advance payments, extra charges, or any financial transaction after an order has been placed.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Please exercise caution and do not engage with any such fraudulent calls, messages, or phishing attempts.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you encounter such activity, you are advised to immediately report the incident to the National Cyber Cell (Helpline: 1930) or lodge a complaint at{" "}
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

            {/* User's Consent */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">USER'S CONSENT</h2>
              <p className="mb-4">
                By using or visiting LUXERIDGE platforms, you expressly consent to the Terms and conditions and our Privacy Policy and to LUXERIDGE processing of Personal Information for the purposes given under the Terms & Conditions and this Privacy Policy, subject to the local laws, in the following ways:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>to create a personalized account containing your contact information, email-id, address, bank details etc based on information you provide or imported from other sites or applications, or any information provided by third parties;</li>
                <li>to contact you about any Website updates, informational and service-related communications, including important security updates;</li>
                <li>to inform you of other services available from LUXERIDGE or its affiliates;</li>
                <li>to enable you to provide feedback, and contact LUXERIDGE customer service in case of any problem with the services or emergency;</li>
                <li>to conduct surveys, make promotions, advertise and to provide the results thereof;</li>
                <li>to help your friends, contacts, and potential customers find your profile and connect with you;</li>
                <li>to detect, investigate and prevent activities that may violate our policies and are illegal.</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">CONTACT</h2>
              <p className="text-gray-700 mb-2">For questions or concerns relating to privacy, feel free to contact us at:</p>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> <a href="adnanaalam169@gmail.com" className="text-black hover:underline font-medium">adnanaalam169@gmail.com</a></p>
                <p className="text-gray-700"><strong>Whatsapp:</strong> +91 84178 00573</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">DISCLAIMER</h2>
              <p className="mb-4">
                WE RESERVE THE RIGHT TO CHANGE THE TERMS AND PRIVACY POLICY FROM TIME TO TIME AS WE DEEM FIT, WITHOUT ANY PRIOR INTIMATION TO YOU. YOUR CONTINUED USE OF THE WEB SITE SIGNIFIES YOUR ACCEPTANCE OF ANY AMENDMENT TO THESE TERMS. YOU ARE THEREFORE ADVISED TO READ THE PRIVACY POLICY ON A REGULAR BASIS. IN CASE YOU DISAGREE WITH ANY OF THE TERMS AND PRIVACY POLICIES OR ANY AMENDMENTS THEREAFTER, YOU MAY TERMINATE YOUR USE OF THIS WEBSITE IMMEDIATELY.
              </p>
              <p>
                WE FOLLOW GENERALLY ACCEPTED STANDARDS TO PROTECT THE PERSONAL INFORMATION SUBMITTED TO US, INCLUDING THE USE OF SERVICES FROM THIRD PARTY SERVICE PROVIDERS. THEREFORE, WHILE WE STRIVE TO USE COMMERCIALLY ACCEPTABLE MEANS TO PROTECT YOUR PERSONAL INFORMATION, WE CANNOT GUARANTEE ABSOLUTE SECURITY AND THEREBY USAGE IN A MANNER THAT IS INCONSISTENT WITH THIS PRIVACY POLICY.
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              By using LUXERIDGE services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;