import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, MapPin, Calendar, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";

export const SOCIAL_TABS = [
  { key: "campus", label: "Campus" },
  { key: "communities", label: "Communities" },
  { key: "opportunities", label: "Jobs & Internships" },
  { key: "scholarships", label: "Scholarships" },
  { key: "research", label: "Research" },
  { key: "events", label: "Events" },
  { key: "groups", label: "Study Groups" },
  { key: "trending", label: "Trending" },
  { key: "creators", label: "Creators" },
];

async function load(tab) {
  switch (tab) {
    case "campus": return base44.entities.QuadPost.list("-created_date", 30);
    case "trending": return base44.entities.QuadPost.list("-created_date", 40);
    case "creators": return base44.entities.QuadPost.list("-created_date", 40);
    case "communities": return base44.entities.Community.list("-created_date", 30);
    case "opportunities": return base44.entities.Opportunity.list("-created_date", 30);
    case "scholarships": return base44.entities.Scholarship.list("-created_date", 30);
    case "research": return base44.entities.ResearchProject.list("-created_date", 30);
    case "events": return base44.entities.CampusEvent.list("date", 30);
    case "groups": return base44.entities.StudyGroup.list("-created_date", 30);
    default: return [];
  }
}

function cardOf(tab, x) {
  if (tab === "campus" || tab === "trending" || tab === "creators")
    return { title: x.title || x.content || "Campus post", sub: x.author_name || x.created_by_name || "Campus", meta: x.likes != null ? `${x.likes} likes` : null };
  if (tab === "communities") return { title: x.name || x.title || "Community", sub: x.description || "", meta: x.members_count != null ? `${x.members_count} members` : null };
  if (tab === "opportunities") return { title: x.title || x.name || "Opportunity", sub: x.company || x.organization || x.provider_name || "", meta: x.deadline ? `Due ${String(x.deadline).split("T")[0]}` : (x.location || null) };
  if (tab === "scholarships") return { title: x.title || x.name || "Scholarship", sub: x.provider_name || x.provider || "", meta: x.amount != null ? `₦${Number(x.amount).toLocaleString()}` : null };
  if (tab === "research") return { title: x.title || x.name || "Project", sub: x.summary || x.description || "", meta: x.field || x.category || null };
  if (tab === "events") return { title: x.title || x.name || "Event", sub: x.location || "", meta: x.date ? String(x.date).split("T")[0] : null };
  if (tab === "groups") return { title: x.title || x.name || "Study Group", sub: x.subject || x.description || "", meta: x.members_count != null ? `${x.members_count} members` : null };
  return { title: x.title || x.name || "Item", sub: "", meta: null };
}

export default function SocialFeed({ tab, onShare }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    let live = true;
    setItems(null);
    load(tab).then((r) => { if (live) setItems(r || []); }).catch(() => { if (live) setItems([]); });
    return () => { live = false; };
  }, [tab]);

  if (!items) return <div className="py-10 flex justify-center"><div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>;
  let list = items;
  if (tab === "trending") list = [...items].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 12);
  if (tab === "creators") list = [...items].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 8);
  if (!list.length)
    return <EmptyState icon={Users} title="Nothing here yet" description="Check back as the community grows." />;

  return (
    <div className="space-y-2.5">
      {list.map((x, i) => {
        const c = cardOf(tab, x);
        return (
          <motion.div key={x.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="p-3.5 rounded-[20px] glass card-hover">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-heading font-semibold text-[14px] text-foreground leading-snug truncate">{c.title}</p>
                {c.sub && <p className="text-[12px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{c.sub}</p>}
                {c.meta && (
                  <p className="text-[11px] text-muted-foreground/80 mt-1 inline-flex items-center gap-1">
                    {tab === "events" && <Calendar className="w-3 h-3" />}
                    {(tab === "opportunities" || tab === "events") && c.meta?.startsWith("Due") === false && <MapPin className="w-3 h-3" />}
                    {c.meta}
                  </p>
                )}
              </div>
              <button onClick={() => onShare({ title: c.title, text: c.sub || c.title, url: window.location.origin })} className="flex-shrink-0 w-9 h-9 rounded-full bg-card border border-border/50 flex items-center justify-center text-foreground spring-tap" aria-label="Share">
                <Share2 className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}