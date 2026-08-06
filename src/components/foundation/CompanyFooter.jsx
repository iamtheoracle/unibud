import React from "react";
import { COMPANY_IDENTITY } from "@/lib/companyIdentity";

/**
 * CompanyFooter — subtle platform provenance line.
 * "Powered by My Realm Network Limited · RC 9645700"
 */
export default function CompanyFooter({ className = "" }) {
  return (
    <div className={`text-center ${className}`}>
      <p className="text-[10px] text-muted-foreground/70 font-medium tracking-wide">
        Powered by{" "}
        <span className="text-muted-foreground font-semibold">{COMPANY_IDENTITY.companyName}</span>
      </p>
      <p className="text-[9px] text-muted-foreground/50 mt-0.5 tracking-widest uppercase">
        {COMPANY_IDENTITY.rcNumber}
      </p>
    </div>
  );
}