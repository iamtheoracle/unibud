import React from "react";
import { motion } from "framer-motion";
import { Users, MessageSquare, Calendar, Pin, ChevronRight } from "lucide-react";

/**
 * CommunityHome — the landing section of a community app.
 * Shows pinned rules, stat tiles, and quick navigation to other sections.
 */
export default function CommunityHome({ community, posts, events, members, onNavigate, accentColor }) {
  const accent = accentColor || "0 0% 100%";
  const postCount = (posts || []).length;
  const eventCount = (events || []).length;
  const memberCount = community?.members_count || (members || []).length;

  const stats = [
    { label: "Members", value: memberCount, icon: Users, to: "members" },
    { label: "Posts", value: postCount, icon: MessageSquare, to: "feed" },
    { label: "Events", value: eventCount, icon: Calendar, to: "events" },
  ];

  const quickLinks = [
    { label: "Start a Discussion", desc: "Share with your community", icon: MessageSquare, to: "feed", color: accent },
    { label: "Upcoming Events", desc: `${eventCount} scheduled`, icon: Calendar, to: "events", color: "142 71% 45%" },
    { label: "Community Chat", desc: "Talk in real time", icon: MessageSquare, to: "chat", color: "217 91% 60%" },
  ];

  return (
    <div className="space-y-4">
      {community?.rules && community.rules.length > 0 && (
        <div className="crystal-card p-4 edge-light">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4" style={{ color: `hsl(${accent})` }} />
            <h3 className="font-heading font-semibold text-[14px] text-foreground">Community Rules</h3>
          </div>
          <div className="space-y-2">
            {community.rules.slice(0, 4).map((rule, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[11px] font-bold mt-0.5" style={{ color: `hsl(${accent})` }}>{i + 1}.</span>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={() => onNavigate(s.to)}
              className="crystal-card p-3 text-center hover-lift spring-tap edge-light"
            >
              <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: `hsl(${accent})` }} strokeWidth={2.2} />
              <p className="font-heading font-bold text-[18px] text-foreground display-number">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5">
        {quickLinks.map((link, i) => {
          const Icon = link.icon;
          return (
            <motion.button
              key={link.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onNavigate(link.to)}
              className="w-full crystal-card p-3.5 flex items-center gap-3 hover-lift spring-tap edge-light"
            >
              <div
                className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                style={{ background: `hsl(${link.color} / 0.12)` }}
              >
                <Icon className="w-5 h-5" style={{ color: `hsl(${link.color})` }} strokeWidth={2.2} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-heading font-semibold text-[13px] text-foreground">{link.label}</p>
                <p className="text-[10px] text-muted-foreground">{link.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          );
        })}
      </div>

      {community?.tags && community.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {community.tags.map((tag, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full glass text-[10px] font-medium text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}