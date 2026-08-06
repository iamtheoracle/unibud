import React from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "@/components/discover/discoverCategories";
import DiscoverCard from "@/components/discover/DiscoverCard";

/**
 * ExploreView — expanded category browser. Reuses the discovery category
 * registry: linked categories render their destinations as chips; topic
 * categories render their sub-topics.
 */
export default function ExploreView() {
  const navigate = useNavigate();
  const linked = CATEGORIES.filter((c) => c.links);
  const topics = CATEGORIES.filter((c) => c.subs);

  const renderChips = (items, linked) =>
    items.map((item) => (
      <button
        key={item.label}
        onClick={() => linked && navigate(item.to)}
        disabled={!linked}
        className="px-3 py-1.5 rounded-full bg-muted/30 border border-border/40 text-[12px] font-medium text-foreground/80 spring-tap disabled:opacity-70"
      >
        {item.label}
      </button>
    ));

  return (
    <div className="flex flex-col gap-4">
      {linked.map((c) => {
        const Icon = c.icon;
        return (
          <DiscoverCard key={c.key} icon={<Icon className="w-4 h-4 text-primary" />} title={c.label}>
            <div className="flex flex-wrap gap-2">{renderChips(c.links, true)}</div>
          </DiscoverCard>
        );
      })}
      {topics.map((c) => {
        const Icon = c.icon;
        return (
          <DiscoverCard key={c.key} icon={<Icon className="w-4 h-4 text-primary" />} title={c.label}>
            <div className="flex flex-wrap gap-2">{renderChips(c.subs.map((s) => ({ label: s })), false)}</div>
          </DiscoverCard>
        );
      })}
    </div>
  );
}