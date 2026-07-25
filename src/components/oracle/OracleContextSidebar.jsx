import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, TrendingUp, Users, LifeBuoy } from "lucide-react";

export default function OracleContextSidebar({ module }) {
  const [stats, setStats] = useState({ users: 0, tickets: 0 });
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    (async () => {
      try { const u = await base44.entities.User.list("-created_date", 1); setStats((s) => ({ ...s, users: u.length })); } catch {}
      try { const t = await base44.entities.SupportTicket.filter({ status: "open" }); setStats((s) => ({ ...s, tickets: t.length })); } catch {}
      try { const a = await base44.entities.AuditLog.list("-created_date", 6); setFeed(a); } catch {}
    })();
  }, [module?.id]);

  const Icon = module?.icon;
  return (
    <div className="w-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          {Icon && <div className="w-9 h-9 rounded-lg bg-primary/15 grid place-items-center"><Icon className="w-4 h-4 text-primary" /></div>}
          <div><p className="text-[14px] font-heading font-semibold">{module?.label}</p><p className="text-[11px] text-muted-foreground">{module?.group}</p></div>
        </div>
        <p className="text-[12px] text-muted-foreground mt-3">{module?.desc}</p>
      </div>

      <div className="p-4 border-b border-border space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Platform</p>
        <Stat icon={Users} label="Users" value={stats.users} />
        <Stat icon={LifeBuoy} label="Open tickets" value={stats.tickets} />
      </div>

      <div className="p-4 flex-1 min-h-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Activity className="w-3 h-3" />Recent Activity</p>
        {feed.length === 0 ? <p className="text-[12px] text-muted-foreground">No recent activity.</p> :
          <div className="space-y-2.5">
            {feed.map((a) => (
              <div key={a.id} className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="min-w-0"><p className="text-[12px] font-medium truncate">{a.action || a.summary || "Action"}</p><p className="text-[11px] text-muted-foreground truncate">{a.actor_name || a.created_by_id || "System"} · {a.created_date ? new Date(a.created_date).toLocaleString() : ""}</p></div>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}

const Stat = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 py-1"><Icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[12px] text-muted-foreground flex-1">{label}</span><span className="text-[13px] font-heading font-semibold">{value}</span></div>
);