import {  
  Truck, 
  RefreshCw, 
  XCircle,
  Users,
  FileText,
  Shield,
  Briefcase,
  CreditCard,
  Instagram
} from "lucide-react";
import { Link } from "react-router-dom";

function ShoppingFooter() {
  return (
    <footer className="bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 border-t border-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Luxeridge
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Your ultimate fashion destination with the latest trends and styles.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex space-x-3">
                {[
                  { icon: Instagram, color: "hover:text-gray-800", bg: "hover:bg-gray-200" }
                ].map((social, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 cursor-pointer ${social.bg} ${social.color}`}
                  >
                    <social.icon className="w-4 h-4 text-gray-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CUSTOMER SERVICE */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold mb-4 text-gray-900 border-b border-gray-300 pb-2">
              CUSTOMER SERVICE
            </h3>
            <ul className="space-y-3">
              {[
                { icon: Truck, text: "Track Order" },
                { icon: RefreshCw, text: "Return Order" },
                { icon: XCircle, text: "Cancel Order" }
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 group cursor-pointer transition-all duration-300 hover:translate-x-1">
                  <item.icon className="w-4 h-4 text-gray-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold mb-4 text-gray-900 border-b border-gray-300 pb-2">
              COMPANY
            </h3>
            <ul className="space-y-3">
              {[
                { icon: FileText, text: "Terms & Conditions" },
                { icon: Shield, text: "Privacy Policy" }
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 group cursor-pointer transition-all duration-300 hover:translate-x-1">
                  <item.icon className="w-4 h-4 text-gray-600 group-hover:scale-110 transition-transform" />
                  <Link 
                    to="/privacy-policy" 
                    className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors"
                  >
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="bg-gray-900 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-300" />
              <span className="text-gray-300 text-sm">100% SECURE PAYMENT • FAST DELIVERY • 24/7 SUPPORT</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Luxeridge. All rights reserved. | Made with ❤️ for fashion lovers
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ShoppingFooter;