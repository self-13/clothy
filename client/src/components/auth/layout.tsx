import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full font-spaceGrotesk bg-white">
      {/* Left Premium Display Panel */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-black w-1/2 px-12 relative overflow-hidden">
        {/* Abstract Background Design Element */}
        <div className="absolute inset-0 opacity-[0.03] font-bold text-[25vw] leading-none pointer-events-none select-none text-white flex items-center justify-center tracking-tighter">
          STYLE
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black opacity-80" />

        <div className="max-w-md space-y-4 text-center text-white z-10 relative">
          <h1 className="text-6xl font-bold tracking-[0.1em] font-bigShoulders uppercase text-white">
            LUXERIDGE
          </h1>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed lowercase italic">
            "explore curated fashion essentials designed for comfort, style, and everyday elegance."
          </p>
        </div>
      </div>

      {/* Right Content Panel (Forms) */}
      <div className="flex flex-1 items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white border border-zinc-100 p-8 rounded-2xl shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
