import React from "react";
import { Shield } from "lucide-react";

export default function SafetyBanner() {
  return (
    <div className="px-4 pb-6">
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2C2C2E] rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#28A745]/15 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-[#28A745]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="font-heading font-semibold text-[13px] text-white">Stay Safe on Connect</p>
          <p className="text-[11px] text-white/60 mt-0.5">Report, block, or review community guidelines anytime.</p>
        </div>
        <button className="px-3 py-1.5 rounded-full bg-white/10 text-white text-[11px] font-semibold flex-shrink-0">Learn</button>
      </div>
    </div>
  );
}