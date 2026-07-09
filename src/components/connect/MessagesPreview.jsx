import React from "react";
import { MessageCircle, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

const conversations = [
  { name: "Chioma Eze", lastMsg: "Are you joining the study group tomorrow?", time: "2m", unread: 2, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
  { name: "CSC 302 Study Group", lastMsg: "David: I've uploaded the past questions PDF", time: "15m", unread: 5, isGroup: true, avatar: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&q=80" },
  { name: "Dr. Adeyemi", lastMsg: "Sure, I'll review your assignment this evening.", time: "1h", unread: 0, verified: true, avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80" },
  { name: "Aisha Bello", lastMsg: "Thanks for the notes! 🙏", time: "3h", unread: 0, avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80" },
];

export default function MessagesPreview() {
  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-[16px] text-foreground">Messages</h3>
        </div>
        <button className="text-[12px] font-semibold text-primary spring-tap">See all</button>
      </div>
      <div className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden">
        {conversations.map((c, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors text-left ${
              i < conversations.length - 1 ? "border-b border-border/30" : ""
            }`}
          >
            <div className="relative flex-shrink-0">
              <img src={c.avatar} alt={c.name} className="w-11 h-11 rounded-full object-cover" />
              {c.isGroup && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary border-2 border-card flex items-center justify-center">
                  <svg className="w-2 h-2 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-heading font-semibold text-[13px] text-foreground truncate">{c.name}</span>
                {c.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary fill-primary/20 flex-shrink-0" />}
              </div>
              <p className={`text-[11px] truncate ${c.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{c.lastMsg}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[10px] text-muted-foreground">{c.time}</span>
              {c.unread > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 bg-primary rounded-full text-primary-foreground text-[10px] font-bold flex items-center justify-center">{c.unread}</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}