import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, ArrowUpRight } from "lucide-react";

export default function ShoppingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#f8f8f8] text-[#333] border-t border-zinc-200 pt-16 pb-12 font-spaceGrotesk">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <h3 className="font-bigShoulders text-3xl font-bold tracking-[0.1em] text-black">
              LUXERIDGE
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
              Explore curated fashion essentials designed for comfort, style, confidence, and effortless everyday elegance.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/_luxeridge_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-zinc-300 hover:border-black flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-zinc-300 hover:border-black flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Customer Service Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-black">
              Customer Service
            </h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>
                <Link to="/shop/account" className="hover:text-black hover:underline transition-colors flex items-center gap-1 group">
                  Track Order <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/shop/account" className="hover:text-black hover:underline transition-colors flex items-center gap-1 group">
                  Return Order <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/shop/account" className="hover:text-black hover:underline transition-colors flex items-center gap-1 group">
                  Cancel Order <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-black">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>
                <Link to="/terms-and-conditions" className="hover:text-black hover:underline transition-colors flex items-center gap-1 group">
                  Terms & Conditions <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-black hover:underline transition-colors flex items-center gap-1 group">
                  Privacy Policy <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-black">
              Join Our Club
            </h4>
            <p className="text-zinc-500 text-sm">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 border-b border-zinc-300 py-2">
              <Mail className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <input
                type="email"
                placeholder="Your email address"
                className="bg-transparent text-sm w-full focus:outline-none placeholder:text-zinc-400 text-black"
                required
              />
              <button type="submit" className="text-xs font-bold uppercase tracking-widest text-black hover:text-zinc-500 transition-colors">
                Sign Up
              </button>
            </form>
          </div>
        </div>

        {/* Footer Brand Text - Large display at bottom */}
        <div className="w-full overflow-hidden select-none border-t border-zinc-200/60 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-zinc-400 gap-4 mb-8">
            <p>© {currentYear} LUXERIDGE. All rights reserved.</p>
            <div className="flex gap-4">
              <span>100% SECURE PAYMENT</span>
              <span>•</span>
              <span>FAST DELIVERY</span>
              <span>•</span>
              <span>10-DAY RETURNS</span>
            </div>
          </div>
          <h2 className="font-bigShoulders text-[16vw] font-bold text-center text-zinc-200/50 leading-[0.8] tracking-[0.05em] uppercase w-full">
            LUXERIDGE
          </h2>
        </div>
      </div>
    </footer>
  );
}
