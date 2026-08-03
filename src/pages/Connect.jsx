import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Phone, Users, ChevronRight, BookOpen, UserPlus, Bell } from "lucide-react";
import ConnectMessages from "@/components/connect/ConnectMessages";
import ConnectCalls from "@/components/connect/ConnectCalls";
import ConnectCollaboration from "@/components/connect/ConnectCollaboration";
import StudyGroupDirectory from "@/components/study/StudyGroupDirectory";
import { ConnectRequests, ConnectNotifications } from "@/components/connect/ConnectRequests";
import { useConnectPlatformCore } from "@/lib/os/useConnectPlatformCore";

const EASE = [0.16, 1, 0.3, 1];

const TABS = [
  { key: "messages", label: "Chats", icon: MessageSquare },
  { key: "groups", label: "Groups", icon: BookOpen },
  { key: "requests", label: "Requests", icon: UserPlus },
  { key: "calls", label: "Calls", icon: Phone },
  { key: "notifications", label: "Alerts", icon: Bell },
  { key: "collaboration", label: "Teams", icon: Users },
];

export default function Connect() {
  const navigate = useNavigate();
  const { orderedTabs } = useConnectPlatformCore();
  const [activeTab, setActiveTab] = useState(orderedTabs[0] || "messages");

  // Context-prioritized tab ordering — tabs are reordered by Platform Core
  // based on the active context (social/academic/hybrid).
  // Social: messages, calls prioritized.
  // Academic: groups, collaboration prioritized.
  // Navigation never changes — only tab priority shifts.
  const orderedTabDefs = orderedTabs
    .map((key) => TABS.find((t) => t.key === key))
    .filter(Boolean);

  return (
    <div className="w-full max-w-[520px] mx-auto px-6 pt-6 pb-28 safe-area-pt">
      <h1 className="text-[28px] font-bold tracking-tight text-foreground mb-7">Connect</h1>

      {/* Tabs — underline style */}
      <div className="flex gap-6 border-b border-border">
        {orderedTabDefs.map((t) => {
          const on = t.key === activeTab;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`relative flex items-center gap-1.5 text-[14px] font-medium spring-tap pb-3 ${on ? "text-foreground" : "text-muted-foreground"}`}
            >
              <Icon className="w-[15px] h-[15px]" strokeWidth={on ? 2.1 : 1.7} />
              {t.label}
              {on && <motion.div layoutId="connect-tab" className="absolute -bottom-px left-0 w-full h-[2px] rounded-full bg-primary" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
            </button>
          );
        })}
      </div>

      <div className="pt-5">
        {activeTab === "messages" && <ConnectMessages />}
        {activeTab === "calls" && <ConnectCalls />}
        {activeTab === "collaboration" && <ConnectCollaboration />}
        {activeTab === "groups" && <StudyGroupDirectory />}
        {activeTab === "requests" && <ConnectRequests />}
        {activeTab === "notifications" && <ConnectNotifications />}
      </div>
    </div>
  );
}