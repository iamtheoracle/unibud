import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, ShoppingBag, Gift, Layers } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  DashboardCard, SectionCard, PortalPageHeader, SmartList, StatusPill,
} from "@/components/portal/PortalUI";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

const CATEGORIES = [
  { key: "textbooks", label: "Textbooks", color: "hsl(var(--unibud-blue))" },
  { key: "electronics", label: "Electronics", color: "hsl(var(--unibud-purple))" },
  { key: "furniture", label: "Furniture", color: "hsl(var(--warning))" },
  { key: "accommodation", label: "Accommodation", color: "hsl(var(--success))" },
  { key: "tutoring", label: "Tutoring", color: "hsl(var(--primary))" },
  { key: "services", label: "Services", color: "hsl(var(--error))" },
  { key: "tickets", label: "Tickets", color: "hsl(var(--unibud-teal))" },
  { key: "other", label: "Other", color: "hsl(var(--muted-foreground))" },
];

const EASE = [0.16, 1, 0.3, 1];
const TOOLTIP_STYLE = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

export default function PortalMarketplaceAnalytics() {
  const navigate = useNavigate();
  const { data: listings } = useQuery({
    queryKey: ["portalMarketplaceAnalytics"],
    queryFn: () => base44.entities.MarketplaceListing.list("-created_date", 500),
    retry: false,
  });

  const all = listings || [];
  const active = all.filter((l) => l.status === "active" || !l.status);
  const sold = all.filter((l) => l.status === "sold");
  const reserved = all.filter((l) => l.status === "reserved");
  const giveaways = all.filter((l) => l.is_free);

  const catCounts = CATEGORIES.map((c) => ({
    ...c,
    count: all.filter((l) => l.category === c.key).length,
    activeCount: active.filter((l) => l.category === c.key).length,
  })).sort((a, b) => b.count - a.count);

  const maxCat = Math.max(1, ...catCounts.map((c) => c.count));
  const distinctCats = catCounts.filter((c) => c.count > 0).length;

  const statusData = [
    { name: "Active", value: active.length, color: "hsl(var(--success))" },
    { name: "Sold", value: sold.length, color: "hsl(var(--info))" },
    { name: "Reserved", value: reserved.length, color: "hsl(var(--warning))" },
  ].filter((d) => d.value > 0);

  const recentGiveaways = giveaways.slice(0, 8);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Marketplace Analytics"
        subtitle="Track category demand, active inventory, and giveaway activity."
        action={
          <button onClick={() => navigate("/portal/marketplace")} className="text-[12px] font-semibold text-primary hover:underline">
            Back to Marketplace
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard icon={Package} value={all.length} title="Total Listings" accent="primary" delay={0} />
        <DashboardCard icon={ShoppingBag} value={active.length} title="Active Listings" accent="success" delay={0.05} />
        <DashboardCard icon={Gift} value={giveaways.length} title="Free Giveaways" accent="warning" delay={0.1} />
        <DashboardCard icon={Layers} value={distinctCats} title="Categories Live" accent="info" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Popular categories */}
        <div className="lg:col-span-2">
          <SectionCard title="Popular Categories" description="Listing volume by category" delay={0.2}>
            <div className="p-5 space-y-3">
              {catCounts.map((c, i) => (
                <motion.div
                  key={c.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.04, ease: EASE }}
                  className="flex items-center gap-3"
                >
                  <span className="w-24 text-[12px] font-medium text-foreground truncate">{c.label}</span>
                  <div className="flex-1 h-7 rounded-[10px] bg-muted/40 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.count / maxCat) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.04, duration: 0.5, ease: EASE }}
                      className="h-full rounded-[10px] flex items-center justify-end pr-2"
                      style={{ background: c.color, opacity: 0.85 }}
                    >
                      {c.count > 0 && <span className="text-[10px] font-bold text-white console-num">{c.count}</span>}
                    </motion.div>
                  </div>
                  <span className="w-16 text-right text-[11px] text-muted-foreground console-num">{c.activeCount} active</span>
                </motion.div>
              ))}
              {distinctCats === 0 && (
                <p className="text-center text-[13px] text-muted-foreground py-8">No listing data yet.</p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Status breakdown */}
        <SectionCard title="Listing Status" description="Live inventory split" delay={0.25}>
          <div className="p-5">
            {statusData.length > 0 ? (
              <>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3} stroke="none">
                        {statusData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-2">
                  {statusData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="flex-1 text-[12px] font-medium text-foreground">{d.name}</span>
                      <span className="text-[12px] font-bold text-foreground console-num">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-[13px] text-muted-foreground py-8">No listings yet.</p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Recent giveaway activity */}
      <SectionCard
        title="Recent Giveaway Activity"
        description="Free items listed by students"
        delay={0.3}
        action={
          <button onClick={() => navigate("/portal/marketplace")} className="text-[12px] font-semibold text-primary hover:underline">
            View all
          </button>
        }
      >
        <SmartList
          items={recentGiveaways}
          emptyMessage="No giveaway activity yet"
          onRowClick={() => navigate("/portal/marketplace")}
          renderRow={(item) => (
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-[14px] bg-success/10 flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{item.title || "Untitled"}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {item.seller_name || "—"} · {item.category || "other"}{item.location ? " · " + item.location : ""}
                </p>
              </div>
              <StatusPill status="operational" label="Free" />
            </div>
          )}
        />
      </SectionCard>
    </div>
  );
}