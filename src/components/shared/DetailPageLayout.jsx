import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ParallaxHero from "@/components/ui/ParallaxHero";
import DetailTabs, { DetailTabContent } from "@/components/ui/DetailTabs";
import FloatingActionBar from "@/components/ui/FloatingActionBar";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * DetailPageLayout — the single premium layout for all UNIBUD detail pages.
 *
 * Standardizes: Community, Marketplace listing, Event, Club, Highlight,
 * Collection, Student profile, Creator profile, Department, Course.
 *
 * Structure:
 *  1. Parallax Hero (cover image, back, actions)
 *  2. Identity (avatar, title, verification, university, tags, metadata)
 *  3. Floating Action Bar (Join, Follow, Share, Save, Invite, Chat)
 *  4. Content Tabs (Overview, Posts, Members, Events, Resources, Media, etc.)
 *  5. Related Content
 *
 * Props:
 *  - coverUrl, coverHeight
 *  - onBack
 *  - heroActions: ReactNode (top-right of hero)
 *  - avatarUrl, avatarSize, avatarRing
 *  - title, subtitle, verified
 *  - university, tags: string[], metadata: { icon, text }[]
 *  - actions: FloatingActionBar action[]
 *  - tabs: { id, label, icon, count }[]
 *  - defaultTab
 *  - onTabChange
 *  - renderTabContent: (tabId) => ReactNode
 *  - related: ReactNode (rendered after tabs)
 *  - children: ReactNode (rendered above tabs, e.g. description)
 *  - loading: boolean — shows skeleton
 */
export default function DetailPageLayout({
  coverUrl,
  coverHeight = 280,
  onBack,
  heroActions,
  avatarUrl,
  avatarSize = 72,
  avatarRing = "story",
  title,
  subtitle,
  verified = false,
  university,
  tags = [],
  metadata = [],
  actions = [],
  tabs = [],
  defaultTab,
  onTabChange,
  renderTabContent,
  related,
  children,
  loading = false,
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.15], [20, 0]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div ref={scrollRef} className="min-h-screen bg-background page-enter">
      {/* Hero */}
      <ParallaxHero coverUrl={coverUrl} height={coverHeight} onBack={onBack} actions={heroActions}>
        <div className="flex items-end gap-4">
          {avatarUrl && (
            <div className="relative z-10">
              <PremiumAvatar
                src={avatarUrl}
                alt={title || ""}
                size="xl"
                ring={avatarRing}
                verified={verified}
              />
            </div>
          )}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-[22px] text-white tracking-tight leading-tight drop-shadow-lg truncate">
                {title}
              </h1>
            </div>
            {subtitle && (
              <p className="text-[13px] text-white/80 truncate mt-0.5 drop-shadow">{subtitle}</p>
            )}
            {university && (
              <div className="flex items-center gap-1 mt-1">
                <svg className="w-3 h-3 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                </svg>
                <span className="text-[11px] text-white/60 font-medium">{university}</span>
              </div>
            )}
          </div>
        </div>
      </ParallaxHero>

      {/* Sticky header (fades in on scroll) */}
      <motion.div
        style={{ opacity: headerOpacity, y: headerY }}
        className="sticky top-0 z-40 glass-strong safe-area-pt"
      >
        <div className="flex items-center gap-2 px-4 py-2.5">
          {avatarUrl && <PremiumAvatar src={avatarUrl} alt={title || ""} size="xs" />}
          <span className="font-heading font-bold text-[14px] text-foreground truncate flex-1">{title}</span>
          {verified && (
            <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 1.8 3 .2.9 2.8 2.3 1.9-1 2.8 1 2.8-2.3 1.9-.9 2.8-3 .2L12 22l-2.4-1.8-3-.2-.9-2.8L3.4 15.3l1-2.8-1-2.8 2.3-1.9.9-2.8 3-.2L12 2z" />
              <path d="M9.5 12.5l1.8 1.8 3.5-3.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </motion.div>

      {/* Body */}
      <div className="px-5 pb-32 -mt-4 relative z-20">
        {/* Tags */}
        {tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease: EASE }}
            className="flex flex-wrap gap-1.5 mb-4"
          >
            {tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full glass text-[10px] font-semibold text-muted-foreground">
                {tag}
              </span>
            ))}
          </motion.div>
        )}

        {/* Metadata */}
        {metadata.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
            className="flex flex-wrap items-center gap-4 mb-4"
          >
            {metadata.map((m, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                {m.icon && <m.icon className="w-3.5 h-3.5" strokeWidth={2} />}
                <span className="font-medium">{m.text}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Description / children */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4, ease: EASE }}
            className="text-[14px] text-foreground/75 leading-relaxed mb-5"
          >
            {children}
          </motion.div>
        )}

        {/* Content tabs */}
        {tabs.length > 0 && (
          <div className="sticky top-[44px] z-30 -mx-5 px-5 py-2 mb-4 bg-background/80 backdrop-blur-xl">
            <DetailTabs tabs={tabs} active={activeTab} onChange={handleTabChange} />
          </div>
        )}

        {/* Tab content */}
        {renderTabContent && (
          <DetailTabContent tabId={activeTab}>
            {renderTabContent(activeTab)}
          </DetailTabContent>
        )}

        {/* Related content */}
        {related && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
            className="mt-8"
          >
            {related}
          </motion.div>
        )}
      </div>

      {/* Floating action bar */}
      {actions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-pb">
          <div className="max-w-[600px] mx-auto">
            <FloatingActionBar actions={actions} />
          </div>
        </div>
      )}
    </div>
  );
}