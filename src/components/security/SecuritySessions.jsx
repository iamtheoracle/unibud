import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { LogOut, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function SecuritySessions({ user }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); try { setDevices(await base44.entities.Device.filter({ user_id: user.id }, "-last_active")); } catch {} finally { setLoading(false); } };
  useEffect(() => { if (user?.id) load(); }, [user?.id]);

  const signOutEverywhere = async () => {
    try { await base44.entities.Device.deleteMany({ user_id: user.id }); } catch {}
    toast({ title: "Signed out everywhere" });
    setTimeout(() => base44.auth.logout("/login"), 600);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><LogOut className="w-5 h-5 text-primary" /><h2 className="text-[18px] font-heading font-bold">Session Management</h2></div>

      <div className="glass-card radius-lg p-4 flex items-center gap-3"><Clock className="w-4 h-4 text-muted-foreground" /><div className="flex-1"><p className="text-[13px] font-semibold">Idle timeout</p><p className="text-[12px] text-muted-foreground">Sessions expire automatically after inactivity to protect your account.</p></div></div>

      <div>
        <p className="text-[13px] font-heading font-semibold mb-2">Active sessions ({devices.length})</p>
        {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : devices.length === 0 ? <p className="text-muted-foreground text-[13px]">No active sessions.</p> :
          <div className="space-y-2">{devices.map((d) => (
            <div key={d.id} className="glass-card radius-lg p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0"><p className="font-semibold text-[14px] truncate">{d.device_name}</p><p className="text-[12px] text-muted-foreground">{d.os} · {d.browser} · last active {d.last_active ? new Date(d.last_active).toLocaleString() : "—"}</p></div>
              {d.is_current && <span className="text-[11px] text-success font-semibold">This device</span>}
            </div>
          ))}</div>}
      </div>

      <Button variant="danger" onClick={signOutEverywhere}><LogOut className="w-4 h-4 mr-1" />Sign out everywhere</Button>
    </div>
  );
}