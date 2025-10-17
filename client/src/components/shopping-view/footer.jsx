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
    <footer className="bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 border-t border-gray-200 shadow-inner">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Luxeridge
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                Your ultimate fashion destination with the latest trends and styles.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex space-x-4 mt-6">
                <a 
                  href="https://www.instagram.com/_luxeridge_?igsh=aXFoa3cwN2w2amVy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="text-sm font-medium">Follow us on Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* CUSTOMER SERVICE */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-purple-500 after:to-pink-500">
              CUSTOMER SERVICE
            </h3>
            <ul className="space-y-4">
              {[
                { icon: Truck, text: "Track Order", link: "/shop/account" },
                { icon: RefreshCw, text: "Return Order", link: "/shop/account" },
                { icon: XCircle, text: "Cancel Order", link: "/shop/account" }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.link}
                    className="flex items-center gap-3 group hover:translate-x-2 transition-all duration-300 ease-in-out"
                  >
                    <span className="p-2 rounded-lg bg-gray-100 group-hover:bg-purple-100 transition-colors">
                      <item.icon className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
                    </span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                      {item.text}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-purple-500 after:to-pink-500">
              COMPANY
            </h3>
            <ul className="space-y-4">
              {[
                { icon: FileText, text: "Terms & Conditions", link: "/terms-and-conditions" },
                { icon: Shield, text: "Privacy Policy", link: "/privacy-policy" }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.link}
                    className="flex items-center gap-3 group hover:translate-x-2 transition-all duration-300 ease-in-out"
                  >
                    <span className="p-2 rounded-lg bg-gray-100 group-hover:bg-purple-100 transition-colors">
                      <item.icon className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
                    </span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                      {item.text}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 bg-gray-800/50 px-6 py-3 rounded-full">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <span className="text-gray-200 text-sm font-medium tracking-wide">
                100% SECURE PAYMENT • FAST DELIVERY • 24/7 SUPPORT
              </span>
            </div>
            
            <div className="text-gray-400 text-sm font-medium">
              © {new Date().getFullYear()} Luxeridge. All rights reserved. | Made with{" "}
              <span className="text-red-500 animate-pulse">❤️</span> for fashion lovers
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ShoppingFooter;