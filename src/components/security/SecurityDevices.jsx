import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { MonitorSmartphone, Trash2, Star, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const detect = () => {
  const ua = navigator.userAgent;
  const os = /Mac/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "Unknown";
  const browser = /Chrome/.test(ua) ? "Chrome" : /Safari/.test(ua) ? "Safari" : /Firefox/.test(ua) ? "Firefox" : /Edge/.test(ua) ? "Edge" : "Browser";
  return { os, browser };
};

export default function SecurityDevices({ user }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => { setLoading(true); try { setDevices(await base44.entities.Device.filter({ user_id: user.id }, "-last_active")); } catch {} finally { setLoading(false); } };
  useEffect(() => { if (user?.id) load(); }, [user?.id]);

  const register = async () => {
    setBusy(true);
    const { os, browser } = detect();
    try { await base44.entities.Device.create({ user_id: user.id, user_name: user.full_name || user.email, device_name: `${os} · ${browser}`, os, browser, location: "Approximate", last_active: new Date().toISOString(), is_current: true }); load(); toast({ title: "Device registered" }); }
    catch { toast({ title: "Could not register" }); }
    finally { setBusy(false); }
  };
  const rename = async (d, name) => { try { await base44.entities.Device.update(d.id, { device_name: name }); load(); } catch {} };
  const trust = async (d) => { try { await base44.entities.Device.update(d.id, { is_trusted: !d.is_trusted }); load(); } catch {} };
  const remove = async (id) => { try { await base44.entities.Device.delete(id); load(); } catch {} };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><MonitorSmartphone className="w-5 h-5 text-primary" /><h2 className="text-[18px] font-heading font-bold">Device Management</h2></div><Button size="sm" onClick={register} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}Register this device</Button></div>

      {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : devices.length === 0 ? <p className="text-muted-foreground text-[13px]">No devices registered yet.</p> :
        <div className="space-y-2">{devices.map((d) => (
          <div key={d.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <MonitorSmartphone className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0"><Input defaultValue={d.device_name} onBlur={(e) => e.target.value !== d.device_name && rename(d, e.target.value)} className="h-7 bg-transparent border-0 px-0 font-semibold text-[14px] focus-visible:ring-0" /><p className="text-[12px] text-muted-foreground">{d.os} · {d.browser} · {d.location || "—"} · {d.last_active ? new Date(d.last_active).toLocaleDateString() : "—"}</p></div>
            {d.is_trusted && <span className="text-[11px] text-success font-semibold flex items-center gap-1"><Star className="w-3.5 h-3.5" />Trusted</span>}
            <button onClick={() => trust(d)} className="p-1.5 text-muted-foreground hover:text-primary" title="Toggle trust"><Star className={`w-4 h-4 ${d.is_trusted ? "fill-primary text-primary" : ""}`} /></button>
            <button onClick={() => remove(d.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}</div>}
    </div>
  );
}