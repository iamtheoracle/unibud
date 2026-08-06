import React from "react";
import { motion } from "framer-motion";
import { Bell, Shield, LogOut, Flag, Settings as SettingsIcon } from "lucide-react";

/**
 * CommunitySettings — notification, privacy, and moderation settings
 * for a community. Shows membership status and quick actions.
 */
export default function CommunitySettings({ community, joined, onLeave, onReport, accentColor }) {
  const accent = accentColor || "0 0% 100%";

  const items = [
    { icon: Bell, label: "Notifications", desc: "Mention & post alerts", toggle: true, defaultOn: true },
    { icon: Shield, label: "Privacy", desc: "Who can see your membership", toggle: true, defaultOn: false },
  ];

  return (
    <div className="space-y-4">
      <div className="crystal-card p-4 edge-light">
        <div className="flex items-center gap-2 mb-3">
          <SettingsIcon className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-[14px] text-foreground">Preferences</h3>
        </div>
        <div className="space-y-1">
          {items.map((item) => (
            <ToggleRow key={item.label} item={item} accent={accent} />
          ))}
        </div>
      </div>

      {joined && (
        <div className="crystal-card p-4 edge-light space-y-2">
          <button
            onClick={onReport}
            className="w-full flex items-center gap-3 p-2.5 rounded-[14px] spring-tap hover:bg-muted/50"
          >
            <Flag className="w-4 h-4 text-muted-foreground" />
            <span className="text-[13px] text-foreground">Report Community</span>
          </button>
          <button
            onClick={onLeave}
            className="w-full flex items-center gap-3 p-2.5 rounded-[14px] spring-tap hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 text-destructive" />
            <span className="text-[13px] text-destructive font-semibold">Leave Community</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ item, accent }) {
  const [on, setOn] = React.useState(item.defaultOn);
  const Icon = item.icon;
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-[14px]">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-[13px] font-medium text-foreground">{item.label}</p>
        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className="w-11 h-6 rounded-full transition-all spring-tap relative"
        style={{ background: on ? `hsl(${accent})` : "hsl(var(--muted))" }}
      >
        <motion.div
          layout
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
          style={{ left: on ? "22px" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}