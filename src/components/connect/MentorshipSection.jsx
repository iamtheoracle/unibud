import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const mentors = [
  { name: "Dr. Adeyemi", role: "Lecturer · CS Dept", expertise: "Algorithms, Data Structures", rating: 4.9, sessions: 95, avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80", verified: true },
  { name: "Prof. Okafor", role: "Mathematics Faculty", expertise: "Linear Algebra, Calculus", rating: 4.8, sessions: 120, avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80", verified: true },
  { name: "Emeka Nwosu", role: "Alumni · Class of '23", expertise: "Software Engineering at Google", rating: 5.0, sessions: 48, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80", verified: true },
];

export default function MentorshipSection() {
  return (
    <div className="px-4 pb-8">
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-[16px] text-foreground">Find a Mentor</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {mentors.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5 flex-shrink-0 w-[205px] card-hover"
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <img src={m.avatar} alt={m.name} className="w-11 h-11 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-[12px] text-foreground truncate">{m.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{m.role}</p>
              </div>
              {m.verified && (
                <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              )}
            </div>
            <p className="text-[10px] text-foreground mb-2 leading-snug">{m.expertise}</p>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-semibold text-warning">★ {m.rating}</span>
              <span className="text-[10px] text-muted-foreground">{m.sessions} sessions</span>
            </div>
            <button className="w-full py-2 rounded-[12px] bg-primary text-primary-foreground text-[11px] font-semibold spring-tap">Request</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}