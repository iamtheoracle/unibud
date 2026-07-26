import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2, LifeBuoy, Flag, ScrollText } from "lucide-react";

/**
 * AdminInsights — Spark-powered Smart Insights card.
 * Aggregates pending approvals, open support tickets, the moderation queue
 * and recent audit activity into a single live pulse for administrators.
 */
export default function AdminInsights({ role }) {
  const { data, isLoading } = useQuery({
    queryKey: ["adminInsights", role],
    queryFn: async () => {
      const [tasks, tickets, reports, audit] = await Promise.all([
        base44.entities.ManagementTask.filter({ status: "pending" }).catch(() => []),
        base44.entities.SupportTicket.filter({ status: "open" }).catch(() => []),
        base44.entities.ContentReport.filter({ status: "pending" }).catch(() => []),
        base44.entities.AuditLog.list("-created_date", 5).catch(() => []),
      ]);
      return {
        pendingApprovals: tasks.length,
        openTickets: tickets.length,
        moderationQueue: reports.length,
        recentAudit: audit,
      };
    },
    refetchInterval: 30000,
  });

  const tiles = [
    { key: "approvals", label: "Pending Approvals", value: data?.pendingApprovals ?? 0, icon: CheckCircle2, color: "32 92% 50%" },
    { key: "tickets", label: "Open Tickets", value: data?.openTickets ?? 0, icon: LifeBuoy, color: "0 78% 55%" },
    { key: "moderation", label: "Moderation Queue", value: data?.moderationQueue ?? 0, icon: Flag, color: "262 83% 58%" },
  ];

  return (
    <div className="rounded-[24px] p-5 glass-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center">
          <ScrollText className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-foreground">Smart Insights</h2>
          <p className="text-[11px] text-muted-foreground">Live operational pulse</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5">
            {tiles.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.key} className="rounded-[16px] p-3 bg-muted/30">
                  <div className="w-7 h-7 rounded-[9px] flex items-center justify-center mb-2" style={{ background: `hsl(${t.color} / 0.14)` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: `hsl(${t.color})` }} />
                  </div>
                  <p className="text-[20px] font-bold text-foreground leading-none">{t.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{t.label}</p>
                </div>
              );
            })}
          </div>

          {data?.recentAudit?.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold text-muted-foreground mb-2">Recent Activity</p>
              <div className="space-y-1.5">
                {data.recentAudit.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                    <span className="text-foreground/80 truncate">{a.action || a.event || "Activity"}</span>
                    <span className="text-muted-foreground ml-auto shrink-0">{a.actor_name || a.created_by_id?.slice(-6) || ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}