import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, Building, DollarSign, Activity, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { KpiCard, SectionCard } from "@/components/portal/PortalUI";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const growthData = [
  { month: "Jan", users: 420 }, { month: "Feb", users: 580 }, { month: "Mar", users: 710 },
  { month: "Apr", users: 890 }, { month: "May", users: 1120 }, { month: "Jun", users: 1380 },
  { month: "Jul", users: 1640 },
];

export default function ExecutiveDashboard({ user }) {
  const { data: users } = useQuery({
    queryKey: ["portalUsers"],
    queryFn: () => base44.entities.User.list(),
    retry: false,
  });

  const universities = [...new Set((users || []).map((u) => u.university).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">Executive Dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Strategic overview, growth metrics, and business intelligence.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Users" value={users?.length || 0} trend={18} accent="primary" />
        <KpiCard icon={Building} label="Universities" value={universities.length} sublabel="Onboarded" accent="success" />
        <KpiCard icon={TrendingUp} label="MoM Growth" value="18%" trend={18} accent="info" />
        <KpiCard icon={Activity} label="System Health" value="99.98%" sublabel="Uptime" accent="success" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="User Growth" description="Monthly active users over the past 7 months">
          <div className="p-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", fontSize: "12px" }} />
                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="University Breakdown" description="Users by university">
          <div className="p-5 space-y-3">
            {universities.length > 0 ? (
              universities.map((uni) => {
                const count = (users || []).filter((u) => u.university === uni).length;
                const pct = users.length ? (count / users.length) * 100 : 0;
                return (
                  <div key={uni}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-medium text-foreground">{uni}</span>
                      <span className="text-[12px] text-muted-foreground">{count} users</span>
                    </div>
                    <div className="h-2 rounded-full bg-border/30 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-[13px] text-muted-foreground">No university data yet</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Operations Overview" description="Key operational metrics">
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-[24px] font-heading font-extrabold text-primary">99.98%</p>
            <p className="text-[11px] text-muted-foreground">Platform Uptime</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-heading font-extrabold text-success">42ms</p>
            <p className="text-[11px] text-muted-foreground">Avg API Response</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-heading font-extrabold text-info">87%</p>
            <p className="text-[11px] text-muted-foreground">2FA Adoption</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-heading font-extrabold text-warning">3</p>
            <p className="text-[11px] text-muted-foreground">Open Support Tickets</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}