import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingBag, TrendingUp, DollarSign, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DashboardCard, SectionCard, PortalPageHeader, StatusPill, SmartList } from "@/components/portal/PortalUI";

export default function PortalMarketplace() {
  const { data: listings } = useQuery({
    queryKey: ["portalMarketplace"],
    queryFn: () => base44.entities.MarketplaceListing.list("-created_date", 20),
    retry: false,
  });

  const activeListings = (listings || []).filter((l) => l.status === "active" || !l.status);

  return (
    <div className="space-y-6">
      <PortalPageHeader title="Marketplace" subtitle="Campus marketplace oversight and revenue tracking." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard icon={Package} value={listings?.length || 0} title="Total Listings" accent="primary" delay={0} />
        <DashboardCard icon={ShoppingBag} value={activeListings.length} title="Active Listings" accent="success" delay={0.05} />
        <DashboardCard icon={DollarSign} value="₦248k" title="Monthly Volume" trend={12} accent="warning" delay={0.1} />
        <DashboardCard icon={TrendingUp} value="8.2%" title="Conversion Rate" trend={3} accent="info" delay={0.15} />
      </div>

      <SectionCard title="Recent Listings" description="Latest marketplace activity" delay={0.2}>
        <SmartList
          items={listings || []}
          emptyMessage="No marketplace listings yet"
          renderRow={(listing) => (
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{listing.title || "Untitled"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{listing.category || "General"} · ₦{listing.price || "—"}</p>
              </div>
              <StatusPill status={listing.status === "active" ? "operational" : "info"} label={listing.status || "active"} />
            </div>
          )}
        />
      </SectionCard>
    </div>
  );
}