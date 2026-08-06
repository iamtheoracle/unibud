import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

export default function FeatureFlags() {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); try { setMods(await base44.entities.PlatformModule.list("sort_order", 100)); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const toggle = async (m) => { try { await base44.entities.PlatformModule.update(m.id, { enabled: !m.enabled }); load(); } catch { toast({ title: "Toggle failed" }); } };

  return (
    <div className="space-y-5">
      <div><h1 className="text-[20px] font-heading font-bold">Feature Flags</h1><p className="text-[13px] text-muted-foreground">Enable or disable platform modules in real time.</p></div>
      {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : mods.length === 0 ? <p className="text-muted-foreground text-[13px]">No modules registered. Seed the platform module registry to begin.</p> :
        <div className="grid md:grid-cols-2 gap-3">{mods.map((m) => (
          <div key={m.id} className="glass-card radius-lg p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px]">{m.display_name}</p><p className="text-[12px] text-muted-foreground truncate">{m.description || m.key}</p><Badge variant="outline" className="mt-1 capitalize">{m.category?.replace(/_/g, " ")}</Badge></div>
            <div className="flex items-center gap-2"><span className={`text-[11px] font-semibold ${m.enabled ? "text-success" : "text-muted-foreground"}`}>{m.enabled ? "ON" : "OFF"}</span><Switch checked={!!m.enabled} onCheckedChange={() => toggle(m)} /></div>
          </div>
        ))}</div>}
    </div>
  );
}