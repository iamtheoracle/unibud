import React from "react";
import { Briefcase, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const opportunities = [
  { title: "Software Engineering Intern", company: "Paystack", type: "Internship", location: "Lagos, NG", logo: "https://logo.clearbit.com/paystack.com", verified: true },
  { title: "Frontend Developer (Graduate)", company: "Flutterwave", type: "Graduate Program", location: "Remote", logo: "https://logo.clearbit.com/flutterwave.com", verified: true },
  { title: "Data Analyst Trainee", company: "Kuda Bank", type: "Trainee", location: "Lagos, NG", logo: "https://logo.clearbit.com/kuda.com", verified: true },
];

export default function CareerNetwork() {
  return (
    <div className="px-4 pb-8">
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Briefcase className="w-4 h-4 text-[#28A745]" />
        <h3 className="font-heading font-bold text-[16px] text-[#1A1A1A]">Career Network</h3>
      </div>
      <div className="space-y-2.5">
        {opportunities.map((opp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-black/[0.04] p-3.5 flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-[#F5F5F7] flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={opp.logo} alt={opp.company} className="w-7 h-7 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-[13px] text-[#1A1A1A] truncate">{opp.title}</p>
              <p className="text-[11px] text-[#86868B]">{opp.company} · {opp.type}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-[#86868B]" />
                <span className="text-[10px] text-[#86868B]">{opp.location}</span>
                {opp.verified && <span className="text-[10px] text-[#28A745] font-medium ml-1">Verified</span>}
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-full bg-[#28A745] text-white text-[11px] font-semibold">Apply</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}