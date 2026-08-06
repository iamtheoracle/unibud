import React from "react";
import { motion } from "framer-motion";
import { Sparkles, MessageSquare, Calendar, Award, GraduationCap, ShoppingBag } from "lucide-react";
import { SectionTitle, ItemCard, EmptyHint } from "@/components/discover/DiscoverShared";

/**
 * ForYouSection — Spark's personalized recommendation engine.
 * Blends the freshest campus posts, events, opportunities, scholarships and
 * marketplace highlights into one ranked feed. Empty until the student
 * engages (follows clubs/creators) so it never shows fake content.
 */
export default function ForYouSection({ data }) {
  const items = [];
  (data.quadPosts || []).slice(0, 4).forEach((p) => items.push({
    key: "q" + p.id, icon: MessageSquare, title: (p.content || "Campus post").slice(0, 70), subtitle: "Campus", to: "/quad", color: "primary",
  }));
  (data.events || []).slice(0, 3).forEach((e) => items.push({
    key: "e" + e.id, icon: Calendar, title: e.title, subtitle: e.date, to: "/events", color: "information",
  }));
  (data.opportunities || []).slice(0, 3).forEach((o) => items.push({
    key: "o" + o.id, icon: Award, title: o.title, subtitle: o.organization, right: o.amount, to: "/opportunities", color: "success",
  }));
  (data.scholarships || []).slice(0, 2).forEach((s) => items.push({
    key: "s" + s.id, icon: GraduationCap, title: s.title, subtitle: s.provider, to: "/scholarships", color: "success",
  }));
  (data.listings || []).slice(0, 3).forEach((l) => items.push({
    key: "l" + l.id, icon: ShoppingBag, title: l.title, right: "₦" + (l.price || 0).toLocaleString(), to: "/marketplace", color: "warning", image: l.images?.[0],
  }));

  if (!items.length) {
    return (
      <EmptyHint
        icon={Sparkles}
        title="Your For You is warming up"
        desc="Follow communities, clubs, and creators — Spark will tailor recommendations here as you engage."
      />
    );
  }

  return (
    <div>
      <SectionTitle icon={Sparkles} title="For You" action={<span className="text-[11px] text-muted-foreground">Personalized by Spark</span>} />
      <div className="px-5 space-y-2.5">
        {items.map((it, i) => (
          <motion.div key={it.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <ItemCard {...it} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}