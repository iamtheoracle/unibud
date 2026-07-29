import React from "react";
import { motion } from "framer-motion";
import { Megaphone, Pin, Shield, Info } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

/**
 * CommunityAnnouncements — pinned posts, official notices, and community
 * information. Combines community rules and meta into an info hub.
 */
export default function CommunityAnnouncements({ community, accentColor }) {
  const accent = accentColor || "0 0% 100%";
  const rules = community?.rules || [];
  const tags = community?.tags || [];

  const meta = [
    { label: "Type", value: community?.type, icon: Info },
    { label: "University", value: community?.university, icon: Shield },
    { label: "Faculty", value: community?.faculty, icon: Shield },
    { label: "Department", value: community?.department, icon: Shield },
    { label: "Level", value: community?.level, icon: Info },
    { label: "Members", value: community?.members_count, icon: Megaphone },
  ].filter((m) => m.value);

  return (
    <div className="space-y-4">
      {rules.length > 0 && (
        <div className="crystal-card p-4 edge-light">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4" style={{ color: `hsl(${accent})` }} />
            <h3 className="font-heading font-semibold text-[14px] text-foreground">Community Rules</h3>
          </div>
          <div className="space-y-2">
            {rules.map((rule, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[11px] font-bold mt-0.5" style={{ color: `hsl(${accent})` }}>{i + 1}.</span>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {meta.length > 0 && (
        <div className="crystal-card p-4 edge-light">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-heading font-semibold text-[14px] text-foreground">About</h3>
          </div>
          <div className="space-y-2.5">
            {meta.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[12px] text-muted-foreground">{m.label}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-foreground capitalize">{m.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="crystal-card p-4 edge-light">
          <h3 className="font-heading font-semibold text-[14px] text-foreground mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full glass text-[11px] font-medium text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {rules.length === 0 && meta.length === 0 && tags.length === 0 && (
        <EmptyState icon={Megaphone} title="No info available" description="Community details will appear here." />
      )}
    </div>
  );
}