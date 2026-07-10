import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Video, Zap, Keyboard, Plus, ChevronRight, Clock } from "lucide-react";
import LiveClassCard from "@/components/live/LiveClassCard";
import RecordingCard from "@/components/live/RecordingCard";
import StudyGroupCard from "@/components/live/StudyGroupCard";

export default function LiveHome() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");

  const { data: classes } = useQuery({ queryKey: ["liveClasses"], queryFn: () => base44.entities.LiveClass.list() });
  const { data: recordings } = useQuery({ queryKey: ["liveRecordings"], queryFn: () => base44.entities.LiveRecording.list("-recorded_date", 10) });
  const { data: studyGroups } = useQuery({ queryKey: ["studyGroups"], queryFn: () => base44.entities.StudyGroup.filter({ status: "active" }) });

  const liveClasses = classes?.filter(c => c.status === "live") || [];
  const todayClasses = classes?.filter(c => c.status === "scheduled") || [];
  const continueWatching = recordings?.filter(r => r.progress > 0) || [];
  const recentRecordings = recordings?.filter(r => !r.progress || r.progress === 0) || [];

  const startMeeting = async (title) => {
    const newClass = await base44.entities.LiveClass.create({
      title, course_code: "LIVE", lecturer_name: "You", status: "live",
      participants_count: 1, class_code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      recording_enabled: true, accent_color: "#6D28D9",
    });
    navigate(`/live/class/${newClass.id}`);
  };

  const handleJoinCode = () => {
    if (!joinCode.trim()) return;
    const found = classes?.find(c => c.class_code === joinCode.trim().toUpperCase());
    if (found) navigate(`/live/class/${found.id}`);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between pt-12 pb-2 px-5"
      >
        <div>
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">UNIBUD Live</h1>
          <p className="text-[12px] text-muted-foreground">Your virtual classroom</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow">
          <Video className="w-5 h-5 text-primary-foreground" />
        </div>
      </motion.div>

      <div className="px-4 pt-4 pb-2 grid grid-cols-3 gap-2.5">
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => startMeeting("Instant Meeting")} className="bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 flex flex-col items-center gap-2 card-hover">
          <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center"><Zap className="w-5 h-5 text-primary" /></div>
          <span className="text-[11px] font-semibold text-foreground">Instant</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => document.getElementById("join-input")?.focus()} className="bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 flex flex-col items-center gap-2 card-hover">
          <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center"><Keyboard className="w-5 h-5 text-primary" /></div>
          <span className="text-[11px] font-semibold text-foreground">Join Code</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => startMeeting("New Live Class")} className="bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 flex flex-col items-center gap-2 card-hover">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Plus className="w-5 h-5 text-primary" /></div>
          <span className="text-[11px] font-semibold text-foreground">Create</span>
        </motion.button>
      </div>

      <div className="px-4 pb-2">
        <div className="flex gap-2">
          <input id="join-input" type="text" value={joinCode} onChange={e => setJoinCode(e.target.value)} onKeyDown={e => e.key === "Enter" && handleJoinCode()} placeholder="Enter class code..." className="flex-1 px-4 h-[44px] rounded-[16px] bg-card border border-border/40 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow" />
          <button onClick={handleJoinCode} disabled={!joinCode.trim()} className="px-4 h-[44px] rounded-[16px] bg-primary text-primary-foreground font-semibold text-[13px] disabled:opacity-50 spring-tap">Join</button>
        </div>
      </div>

      <div className="px-4 space-y-6 pb-8 pt-3">
        {liveClasses.length > 0 && (
          <Section title="Live Now" badge={<span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />}>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">{liveClasses.map(c => <LiveClassCard key={c.id} liveClass={c} />)}</div>
          </Section>
        )}

        <Section title="Today's Classes">
          {todayClasses.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto no-scrollbar">{todayClasses.map(c => <LiveClassCard key={c.id} liveClass={c} />)}</div>
          ) : (
            <div className="bg-card rounded-2xl p-4 premium-shadow border border-border/30 text-center">
              <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-1.5" />
              <p className="text-[12px] text-muted-foreground">No more classes scheduled for today</p>
            </div>
          )}
        </Section>

        {continueWatching.length > 0 && (
          <Section title="Continue Watching">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">{continueWatching.map(r => <RecordingCard key={r.id} recording={r} />)}</div>
          </Section>
        )}

        <Section title="Recently Recorded">
          <div className="flex gap-3 overflow-x-auto no-scrollbar">{recentRecordings.map(r => <RecordingCard key={r.id} recording={r} />)}</div>
        </Section>

        {studyGroups && studyGroups.length > 0 && (
          <Section title="Study Groups">
            <div className="flex gap-3 overflow-x-auto no-scrollbar">{studyGroups.map(g => <StudyGroupCard key={g.id} group={g} />)}</div>
          </Section>
        )}

        <Section title="Office Hours">
          <div className="bg-card rounded-2xl p-4 premium-shadow border border-border/30 flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-heading font-semibold text-[14px] text-foreground">Book with your lecturer</p>
              <p className="text-[11px] text-muted-foreground">Get 1-on-1 help outside class</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, badge, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        {badge}
        <h2 className="font-heading font-bold text-[16px] text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}