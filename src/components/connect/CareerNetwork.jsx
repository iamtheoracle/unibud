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
        <Briefcase className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-[16px] text-foreground">Career Network</h3>
      </div>
      <div className="space-y-2.5">
        {opportunities.map((opp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5 flex items-center gap-3.5 card-hover"
          >
            <div className="w-12 h-12 rounded-[16px] bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={opp.logo} alt={opp.company} className="w-7 h-7 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-[13px] text-foreground truncate">{opp.title}</p>
              <p className="text-[11px] text-muted-foreground">{opp.company} · {opp.type}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{opp.location}</span>
                {opp.verified && <span className="text-[10px] text-primary font-medium ml-1">Verified</span>}
              </div>
            </div>
            <button className="px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold spring-tap">Apply</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}