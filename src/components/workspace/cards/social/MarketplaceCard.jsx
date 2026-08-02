import React from "react";
import { Link } from "react-router-dom";
import { Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function MarketplaceCard() {
  const { data: listings, isLoading } = useQuery({
    queryKey: ["card-marketplace"],
    queryFn: async () => {
      const data = await base44.entities.MarketplaceListing.filter({ status: "active" }, "-created_date", 5);
      return data || [];
    },
    staleTime: 120000,
  });

  if (isLoading) return <ListSkeleton rows={2} />;

  const list = (listings || []).slice(0, 4);

  if (list.length === 0) {
    return (
      <div className="py-2">
        <p className="text-[12px] text-muted-foreground mb-2">Buy and sell with fellow students.</p>
        <Link to="/marketplace" className="text-[12px] font-medium text-primary">Browse marketplace →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {list.map((l) => (
        <Link key={l.id} to="/marketplace" className="flex items-center gap-3 spring-tap">
          <div className="w-8 h-8 rounded-lg bg-foreground/[0.08] grid place-items-center shrink-0 overflow-hidden">
            {l.image_url ? (
              <img src={l.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Tag className="w-4 h-4 text-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{l.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {l.price != null ? `₦${Number(l.price).toLocaleString()}` : "Free"}
            </p>
          </div>
        </Link>
      ))}
      <Link to="/marketplace" className="block text-[12px] font-medium text-primary pt-1">
        Browse marketplace →
      </Link>
    </div>
  );
}