import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, Panel, EmptyState, LoadingState, StatusPill } from "@/components/management/management-ui";
import { Bell, CheckCheck } from "lucide-react";

export default function OperatorNotifications({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); try { setItems(await base44.entities.Notification.list("-created_date", 60)); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const read = async (n) => {
    if (n.is_read) return;
    try { await base44.entities.Notification.update(n.id, { is_read: true, read_at: new Date().toISOString() }); load(); } catch {}
  };
  const markAll = async () => { try { await Promise.all(items.filter((n) => !n.is_read).map((n) => base44.entities.Notification.update(n.id, { is_read: true, read_at: new Date().toISOString() }))); load(); } catch {} };

  return (
    <div>
      <SectionHeader title="Notifications" desc="Task assignments, deadline alerts, escalations, approval requests and system messages."
        actions={<button onClick={markAll} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary"><CheckCheck className="w-3.5 h-3.5" />Mark all read</button>} />
      <Panel>
        {loading ? <LoadingState /> : items.length === 0 ? <EmptyState icon={Bell} message="No notifications." /> : (
          <div className="space-y-1.5">
            {items.map((n) => (
              <button key={n.id} onClick={() => read(n)} className={`w-full text-left flex gap-2.5 p-2.5 rounded-xl transition-colors ${n.is_read ? "hover:bg-muted/30" : "bg-primary/5 hover:bg-primary/10"}`}>
                <div className={`w-1.5 rounded-full shrink-0 ${n.is_read ? "bg-transparent" : "bg-primary"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium truncate">{n.title}</p>
                  <p className="text-[12px] text-muted-foreground truncate">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.created_date ? new Date(n.created_date).toLocaleString() : ""}</p>
                </div>
                {n.priority === "critical" && <StatusPill status="overdue" />}
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}