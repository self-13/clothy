import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, ArrowRight, Check } from "lucide-react";

export default function ShoppingFooter() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#F5F3EE] text-[#121212] border-t border-zinc-200/80 pt-20 pb-12 font-sans">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-zinc-200/70">
          
          {/* Brand Philosophy */}
          <div className="md:col-span-5 space-y-6">
            <span className="font-serif text-2xl md:text-3xl tracking-[0.16em] uppercase font-medium block">
              LUXERIDGE
            </span>
            <p className="text-zinc-600 text-sm leading-relaxed max-w-sm">
              Consciously tailored garments engineered for comfort, modern silhouette, and timeless elegance. Made to be worn, lived in, and loved.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/_luxeridge_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-zinc-300 hover:border-black flex items-center justify-center hover:bg-[#121212] hover:text-white transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 stroke-[1.7]" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-zinc-300 hover:border-black flex items-center justify-center hover:bg-[#121212] hover:text-white transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 stroke-[1.7]" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Assistance
            </h4>
            <ul className="space-y-3 text-xs uppercase tracking-[0.12em] font-medium text-zinc-600">
              <li>
                <Link to="/shop/account" className="hover:text-black transition-colors block py-0.5">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/shop/account" className="hover:text-black transition-colors block py-0.5">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/shop/account" className="hover:text-black transition-colors block py-0.5">
                  Order History
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Company
            </h4>
            <ul className="space-y-3 text-xs uppercase tracking-[0.12em] font-medium text-zinc-600">
              <li>
                <Link to="/terms-and-conditions" className="hover:text-black transition-colors block py-0.5">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-black transition-colors block py-0.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/shop/listing" className="hover:text-black transition-colors block py-0.5">
                  All Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Editorial Journal
            </h4>
            <p className="text-zinc-600 text-xs leading-relaxed">
              Receive private preview invitations and seasonal releases.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 py-3">
                <Check className="w-4 h-4" />
                <span>Thank you. You are on the private list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center border-b border-zinc-400 py-2 focus-within:border-black transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-transparent text-xs w-full focus:outline-none placeholder:text-zinc-400 text-[#121212]"
                  required
                />
                <button
                  type="submit"
                  className="p-1 text-[#121212] hover:translate-x-1 transition-transform"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Credits & Giant Wordmark */}
        <div className="pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 gap-4 mb-12 font-sans tracking-wide">
            <p>© {currentYear} LUXERIDGE CLOTHING. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider text-zinc-400">
              <span>Pure Comfort</span>
              <span>•</span>
              <span>Crafted Elegance</span>
              <span>•</span>
              <span>Conscious Design</span>
            </div>
          </div>

          {/* Architectural Brand Wordmark Sign-Off */}
          <div className="w-full overflow-hidden select-none text-center">
            <span className="font-serif text-[15vw] font-normal tracking-[0.08em] uppercase text-zinc-300/40 leading-none block select-none pointer-events-none">
              LUXERIDGE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
