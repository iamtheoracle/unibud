import React, { useState } from "react";
import { ShieldCheck, Fingerprint, KeyRound, Smartphone, CreditCard, Radar, History, Laptop } from "lucide-react";
import { SectionCard } from "../WalletShared";
import { Switch } from "@/components/ui/switch";
import PINSetupModal from "../PINSetupModal";

const CONTROLS = [
  { key: "biometric", label: "Biometric Authentication", desc: "Unlock Wallet with Face ID or fingerprint", icon: Fingerprint },
  { key: "pin", label: "PIN Verification", desc: "Require PIN for transactions", icon: KeyRound },
  { key: "device", label: "Device Verification", desc: "Verify new devices before access", icon: Smartphone },
  { key: "contactless", label: "Contactless Payments", desc: "Allow tap-to-pay on your card", icon: CreditCard },
  { key: "online", label: "Online Payments", desc: "Allow web and in-app payments", icon: Laptop },
  { key: "fraud", label: "Fraud Detection", desc: "Oracle monitors unusual activity", icon: Radar },
];

const KEY = "wallet.security";

export default function WalletSecurity() {
  const [pinOpen, setPinOpen] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    try { return { biometric: true, pin: true, fraud: true, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return { biometric: true, pin: true, fraud: true }; }
  });
  const toggle = (k) => {
    const p = { ...prefs, [k]: !prefs[k] };
    setPrefs(p);
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
  };

  return (
    <div className="space-y-3">
      <div className="rounded-[20px] p-3.5 bg-primary/8 border border-primary/15 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-foreground leading-relaxed">Oracle secures every transaction with biometric verification, device checks, and real-time fraud detection — without unnecessary friction.</p>
      </div>

      <SectionCard title="Security Controls">
        {CONTROLS.map((c) => (
          <div key={c.key} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
            <div className="w-9 h-9 rounded-[12px] bg-primary/8 flex items-center justify-center flex-shrink-0">
              <c.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-foreground">{c.label}</p>
              <p className="text-[10px] text-muted-foreground">{c.desc}</p>
            </div>
            <Switch
              checked={!!prefs[c.key]}
              onCheckedChange={() => {
                if (c.key === "pin") setPinOpen(true);
                toggle(c.key);
              }}
            />
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Privacy & Permissions">
        {[
          { label: "Login History", desc: "Review recent sign-ins", icon: History },
          { label: "Trusted Devices", desc: "Manage devices with access", icon: Smartphone },
          { label: "Privacy Controls", desc: "Manage data and permissions", icon: ShieldCheck },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
            <div className="w-9 h-9 rounded-[12px] bg-muted flex items-center justify-center flex-shrink-0">
              <r.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-foreground">{r.label}</p>
              <p className="text-[10px] text-muted-foreground">{r.desc}</p>
            </div>
          </div>
        ))}
      </SectionCard>
      <PINSetupModal open={pinOpen} onClose={() => setPinOpen(false)} />
    </div>
  );
}