import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import DiscoveryCard from "@/components/discovery/DiscoveryCard";
import PeopleCard from "@/components/discovery/PeopleCard";

export default function DiscoverySection({ id, title, icon: Icon, to, items, type }) {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-foreground" strokeWidth={2} />
          <h2 className="text-[13px] font-semibold text-foreground">{title}</h2>
          <span className="text-[10px] text-muted-foreground/60">{items.length}</span>
        </div>
        {to && (
          <Link to={to} className="text-[11px] font-semibold text-primary spring-tap flex items-center gap-0.5">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {items.map((item, i) =>
          type === "people" ? (
            <PeopleCard key={item.id || i} person={item} index={i} />
          ) : (
            <DiscoveryCard key={item.id || i} item={item} type={type} index={i} />
          )
        )}
      </div>
    </section>
  );
}