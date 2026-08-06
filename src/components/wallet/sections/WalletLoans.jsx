import React from "react";
import { GraduationCap, ShieldAlert, Laptop, BookOpen, ShieldCheck, ChevronRight } from "lucide-react";
import { SectionCard, Pill, WCOLOR } from "../WalletShared";

const OFFERS = [
  { title: "Tuition Loan", desc: "Spread tuition across the semester with flexible instalments.", icon: GraduationCap, color: "primary", badge: "Popular" },
  { title: "Emergency Loan", desc: "Quick funds for urgent needs, approved in minutes.", icon: ShieldAlert, color: "error" },
  { title: "Device Financing", desc: "Get a laptop or phone on affordable instalments.", icon: Laptop, color: "information" },
  { title: "Education Financing", desc: "Fund certifications, courses, and professional exams.", icon: BookOpen, color: "success" },
];

export default function WalletLoans() {
  return (
    <div className="space-y-3">
      <div className="rounded-[20px] p-3.5 bg-information/8 border border-information/15 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-information mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-foreground leading-relaxed">Oracle reviews every loan for eligibility and compliance. Offers depend on your faculty, level, and financial activity.</p>
      </div>
      {OFFERS.map((o) => {
        const c = WCOLOR[o.color];
        return (
          <SectionCard key={o.title}>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-[16px] ${c.bg} flex items-center justify-center flex-shrink-0`}>
                <o.icon className={`w-5 h-5 ${c.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-foreground">{o.title}</p>
                  {o.badge && <Pill label={o.badge} tone="primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{o.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}