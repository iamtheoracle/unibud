import React, { useState } from "react";
import { motion } from "framer-motion";
import SocialFeed, { SOCIAL_TABS } from "@/components/social/SocialFeed";
import SocialForYou from "@/components/social/SocialForYou";
import ShareSheet from "@/components/social/ShareSheet";
import ConnectedAccounts from "@/components/social/ConnectedAccounts";
import SocialAI from "@/components/social/SocialAI";

/**
 * SocialHub — a unified, AI-curated academic & career feed inside UNIBUD.
 * Not a copy of social media: Bud surfaces campus, community, career and
 * scholarship signals, with opt-in connections and one-tap sharing.
 */
export default function SocialHub() {
  const [tab, setTab] = useState("foryou");
  const [share, setShare] = useState(null);

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Curated by Bud</p>
        <h1 className="font-heading font-bold text-[24px] text-foreground leading-tight">Social</h1>
        <p className="text-[12px] text-muted-foreground mt-1">Your academic & career world — one calm feed.</p>
      </motion.div>

      <div className="mt-5">
        <SocialAI />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {[{ key: "foryou", label: "For You" }, ...SOCIAL_TABS].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-3.5 h-9 rounded-full text-[12px] font-semibold spring-tap whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "glass text-foreground/80"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "foryou" ? <SocialForYou onShare={setShare} /> : <SocialFeed tab={tab} onShare={setShare} />}
      </div>

      <div className="mt-6">
        <ConnectedAccounts />
      </div>

      <ShareSheet open={!!share} onClose={() => setShare(null)} title={share?.title} text={share?.text} url={share?.url} />
    </div>
  );
}