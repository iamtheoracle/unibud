import React from "react";
import { COMPANY_IDENTITY } from "@/lib/companyIdentity";

/**
 * Subtle "Powered by My Realm Network Limited" footer.
 * Used on auth screens and the splash — minimal, Apple-quality.
 */
export default function CompanyFooter({ className = "" }) {
  return (
    <div className={"text-center select-none " + className}>
      <p className="text-[10px] text-muted-foreground/60">Powered by</p>
      <p className="text-[11px] font-semibold text-muted-foreground/80 mt-0.5">
        {COMPANY_IDENTITY.companyName}
      </p>
      <p className="text-[9px] text-muted-foreground/45 mt-0.5">
        {COMPANY_IDENTITY.rcNumber}
      </p>
    </div>
  );
}