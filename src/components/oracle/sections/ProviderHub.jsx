import React, { useState } from "react";
import { Plug, Webhook, Activity, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import ProvidersTab from "./providerHub/ProvidersTab";
import WebhooksTab from "./providerHub/WebhooksTab";
import HealthTab from "./providerHub/HealthTab";
import SecretsTab from "./providerHub/SecretsTab";

const TABS = [
  { id: "providers", label: "Providers", icon: Plug, Comp: ProvidersTab },
  { id: "webhooks", label: "Webhook Center", icon: Webhook, Comp: WebhooksTab },
  { id: "health", label: "API Health", icon: Activity, Comp: HealthTab },
  { id: "secrets", label: "Secrets", icon: KeyRound, Comp: SecretsTab },
];

export default function ProviderHub() {
  const [tab, setTab] = useState("providers");
  const Active = TABS.find((t) => t.id === tab)?.Comp || ProvidersTab;
  return (
    <div>
      <div className="flex items-center gap-1 mb-4 glass-card radius-lg p-1.5 w-full overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap spring-tap", tab === t.id ? "bg-primary text-primary-foreground ice-glow" : "text-muted-foreground hover:bg-muted/40")}>
              <Icon className="w-3.5 h-3.5" />{t.label}
            </button>
          );
        })}
      </div>
      <Active />
    </div>
  );
}