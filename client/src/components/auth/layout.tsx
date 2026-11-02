import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full font-sans bg-[#FAF9F6] text-[#121212]">
      {/* Left Editorial Display Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-[#121212] w-1/2 p-16 text-[#FAF9F6] relative overflow-hidden">
        <div>
          <Link to="/" className="font-serif text-2xl tracking-[0.16em] uppercase font-medium">
            LUXERIDGE
          </Link>
        </div>

        <div className="max-w-md space-y-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 block">
            Member Sanctuary
          </span>
          <h2 className="font-serif text-4xl text-white font-normal leading-[1.15]">
            Where Comfort Meets Enduring Elegance.
          </h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed">
            Access private releases, curate your seasonal wardrobe, and experience frictionless order management.
          </p>
        </div>

        <div className="text-xs text-zinc-500 font-light tracking-wide">
          © {new Date().getFullYear()} LUXERIDGE CLOTHING. All rights reserved.
        </div>
      </div>

      {/* Right Content Panel (Forms) */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6]">
        <div className="w-full max-w-md bg-white border border-zinc-200/80 p-8 sm:p-10 rounded-sm shadow-xs">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
