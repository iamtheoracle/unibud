import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { SectionTitle, ChipRow, ItemCard, PromptCard } from "@/components/discover/DiscoverShared";

/**
 * TopicSection — a dedicated experience for Sports, Entertainment and
 * Technology. Each keeps its own subcategory chips (Football, Anime, AI…)
 * so related content stays together. No fake content: official spaces and a
 * personalization prompt until the student follows relevant clubs/creators.
 */
export default function TopicSection({ category }) {
  const [sub, setSub] = useState(category.subs?.[0] || null);
  const Icon = category.icon;
  const focus = (sub || category.label).toLowerCase();

  const links = category.key === "technology"
    ? [
        { label: "Research Hub", to: "/research" },
        { label: "Communities", to: "/communities" },
        { label: "Clubs", to: "/clubs" },
        { label: "Challenges", to: "/challenges" },
      ]
    : [
        { label: "Communities", to: "/communities" },
        { label: "Clubs", to: "/clubs" },
        { label: "Events", to: "/events" },
        { label: "Marketplace", to: "/marketplace" },
      ];

  return (
    <div className="space-y-4">
      <SectionTitle icon={Icon} title={category.label} action={<span className="text-[11px] text-muted-foreground">Spark is learning</span>} />
      {category.subs?.length > 0 && <ChipRow chips={category.subs} active={sub} onPick={setSub} />}

      <div className="px-5 space-y-2.5">
        {links.map((l) => (
          <ItemCard key={l.to} icon={Icon} title={l.label} subtitle={`Explore ${l.label}`} to={l.to} color={category.color} />
        ))}
      </div>

      <PromptCard
        icon={Sparkles}
        title={`Personalize ${category.label}`}
        desc={`Follow ${focus} clubs and creators — Spark will surface ${focus} updates, scores, and releases here as you engage.`}
        color={category.color}
      />
    </div>
  );
}