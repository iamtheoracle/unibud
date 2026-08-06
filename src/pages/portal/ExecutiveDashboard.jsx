import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, TrendingUp, Building, Activity, Globe, Server, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DashboardCard, SectionCard, PortalPageHeader } from "@/components/portal/PortalUI";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";

const growthData = [
  { month: "Jan", users: 420 }, { month: "Feb", users: 580 }, { month: "Mar", users: 710 },
  { month: "Apr", users: 890 }, { month: "May", users: 1120 }, { month: "Jun", users: 1380 },
  { month: "Jul", users: 1640 },
];

export default function ExecutiveDashboard({ user }) {
  const navigate = useNavigate();

  const { data: users } = useQuery({
    queryKey: ["portalUsers"],
    queryFn: () => base44.entities.User.list(),
    retry: false,
  });

  const universities = [...new Set((users || []).map((u) => u.university).filter(Boolean))];

  return (
    <div className="space-y-6">
      <PortalPageHeader title="Executive Dashboard" subtitle="Strategic overview, growth metrics, and business intelligence." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard icon={Users} value={users?.length || 0} title="Total Users" trend={18} accent="primary" delay={0} onClick={() => navigate("/portal/users")} />
        <DashboardCard icon={Building} value={universities.length} title="Universities" subtitle="Onboarded" accent="success" delay={0.05} onClick={() => navigate("/portal/universities")} />
        <DashboardCard icon={TrendingUp} value="18%" title="MoM Growth" trend={18} accent="info" delay={0.1} onClick={() => navigate("/portal/analytics")} />
        <DashboardCard icon={Activity} value="99.98%" title="System Health" subtitle="Uptime" status="operational" accent="success" delay={0.15} onClick={() => navigate("/portal/system-health")} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="User Growth" description="Monthly active users over the past 7 months" delay={0.2}>
          <div className="p-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "16px", border: "1px solid hsl(var(--border))", fontSize: "12px", background: "hsl(var(--card))" }} />
                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="University Breakdown" description="Users by university" delay={0.25}>
          <div className="p-5 space-y-4">
            {universities.length > 0 ? (
              universities.map((uni, i) => {
                const count = (users || []).filter((u) => u.university === uni).length;
                const pct = users.length ? (count / users.length) * 100 : 0;
                return (
                  <motion.div
                    key={uni}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] font-medium text-foreground">{uni}</span>
                      <span className="text-[12px] text-muted-foreground font-semibold">{count} users</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.35 + i * 0.05, duration: 0.6 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                      />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <Globe className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-[13px] text-muted-foreground">No university data yet</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Operations Overview" description="Key operational metrics" delay={0.35}>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "99.98%", label: "Platform Uptime", icon: Activity, color: "text-success" },
            { value: "42ms", label: "Avg API Response", icon: Server, color: "text-info" },
            { value: "87%", label: "2FA Adoption", icon: Users, color: "text-primary" },
            { value: "1,247", label: "Active Connections", icon: Zap, color: "text-warning" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="text-center p-5 rounded-[24px] bg-muted/30 border border-border/20"
            >
              <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
              <p className="text-[24px] font-heading font-extrabold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}