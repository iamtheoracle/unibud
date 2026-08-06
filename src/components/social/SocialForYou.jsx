import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Share2, Sparkles } from "lucide-react";
import { useSocialEngine } from "@/hooks/useSocialEngine";
import EmptyState from "@/components/ui/EmptyState";

const TYPE_LABEL = {
  campus: "Campus", opportunity: "Opportunity", scholarship: "Scholarship",
  event: "Event", group: "Study Group", research: "Research", community: "Community",
};

/**
 * SocialForYou — Bud's personalized feed. The AI Personalization Engine ranks
 * everything across campus, career and community by interest + engagement,
 * and the Safety Engine flags anything suspicious.
 */
export default function SocialForYou({ onShare }) {
  const se = useSocialEngine();
  const items = se.personalized;
  const flagIds = new Set(se.safety.map((x) => x.id));

  if (!items || !items.length)
    return <EmptyState icon={Sparkles} title="Your feed is warming up" description="As campus activity flows in, Bud personalizes what matters most to you here." />;

  return (
    <div className="space-y-2.5">
      {items.map((x, i) => {
        const title = x.title || x.content || x.name || "Item";
        const sub = x.description || x.summary || x.subject || x.company || x.provider_name || "";
        const flagged = flagIds.has(x.id);
        return (
          <motion.div key={x.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className={`p-3.5 rounded-[20px] glass card-hover ${flagged ? "ring-1 ring-warning/50" : ""}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">{TYPE_LABEL[x._type] || "Post"}</span>
              {flagged && (
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                  <ShieldAlert className="w-3 h-3" /> Looks suspicious
                </span>
              )}
            </div>
            <p className="font-heading font-semibold text-[14px] text-foreground leading-snug line-clamp-2">{title}</p>
            {sub && <p className="text-[12px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{sub}</p>}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-muted-foreground/80">{x.likes != null ? `${x.likes} likes` : (x.date ? String(x.date).split("T")[0] : "")}</span>
              <button onClick={() => onShare({ title, text: sub || title, url: window.location.origin })} className="w-8 h-8 rounded-full bg-card border border-border/50 flex items-center justify-center text-foreground spring-tap" aria-label="Share">
                <Share2 className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}