import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Empty } from "@/components/lecturer/ui";

export default function ParentNotifications({ user }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { setList(await base44.entities.Notification.filter({ user_id: user.id })); } catch {} finally { setLoading(false); } })(); }, [user]);
  return (
    <div className="space-y-4 max-w-[820px]">
      <p className="text-[13px] text-muted-foreground">Notifications about your linked students.</p>
      {loading ? <p className="text-muted-foreground">Loading…</p> : list.length === 0 ? <Empty label="No notifications." /> :
        <div className="space-y-2">{list.map((n) => (
          <div key={n.id} className="glass-card radius-lg p-3 flex items-start gap-3"><Bell className="w-4 h-4 text-primary mt-0.5" /><div className="flex-1"><p className="font-semibold text-[14px]">{n.title}</p><p className="text-[12px] text-muted-foreground">{n.message}</p></div></div>
        ))}</div>}
    </div>
  );
}