import React, { useState } from "react";
import { Flame, Trophy, TrendingUp, MessageSquare } from "lucide-react";
import { SectionTitle, ChipRow, ItemCard, EmptyHint } from "@/components/discover/DiscoverShared";

/**
 * TrendingSection — multi-level trending (Campus → Global). Spark decides
 * which layer deserves priority; the student can switch layers themselves.
 */
export default function TrendingSection({ data }) {
  const levels = ["Campus", "Department", "Faculty", "University", "Nearby", "National", "Global"];
  const [level, setLevel] = useState("Campus");

  const challenges = (data.challenges || []).filter((c) => c.status !== "ended").slice(0, 4);
  const posts = (data.quadPosts || []).slice(0, 4);
  const empty = !challenges.length && !posts.length;

  return (
    <div className="space-y-4">
      <SectionTitle icon={Flame} title="Trending" />
      <ChipRow chips={levels} active={level} onPick={setLevel} />

      <div className="px-5 space-y-2.5">
        {challenges.map((c) => (
          <ItemCard key={c.id} icon={Trophy} title={c.title} subtitle={`${c.participants_count || 0} joined`} tag={level} to="/challenges" color="error" />
        ))}
        {posts.map((p) => (
          <ItemCard key={p.id} icon={MessageSquare} title={(p.content || "Campus post").slice(0, 70)} subtitle={`${p.reactions || 0} reactions`} tag={level} to="/quad" color="primary" />
        ))}
      </div>

      {empty && (
        <EmptyHint icon={TrendingUp} title="No trends yet" desc={`Trending ${level.toLowerCase()} activity will appear here as your campus comes alive.`} />
      )}
    </div>
  );
}