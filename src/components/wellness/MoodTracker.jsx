import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Smile, TrendingUp, Loader2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";

const MOODS = [
  { key: "great", emoji: "😄", label: "Great", score: 5, color: "text-success" },
  { key: "good", emoji: "🙂", label: "Good", score: 4, color: "text-info" },
  { key: "okay", emoji: "😐", label: "Okay", score: 3, color: "text-warning" },
  { key: "low", emoji: "😔", label: "Low", score: 2, color: "text-warning" },
  { key: "struggling", emoji: "😢", label: "Struggling", score: 1, color: "text-destructive" },
];

export default function MoodTracker() {
  const qc = useQueryClient();
  const [selectedMood, setSelectedMood] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: entries, isLoading } = useQuery({
    queryKey: ["wellnessMoods"],
    queryFn: () => base44.entities.WellnessEntry.filter({ entry_type: "mood" }, "-entry_date", 30),
  });

  const saveMood = async () => {
    if (!selectedMood) return;
    setSaving(true);
    const mood = MOODS.find((m) => m.key === selectedMood);
    await base44.entities.WellnessEntry.create({
      entry_type: "mood",
      mood: mood.key,
      mood_score: mood.score,
      entry_date: new Date().toISOString().split("T")[0],
      is_private: true,
    });
    qc.invalidateQueries({ queryKey: ["wellnessMoods"] });
    setSelectedMood(null);
    setSaving(false);
  };

  const chartData = (entries || []).slice(0, 14).reverse().map((e) => ({
    date: e.entry_date?.slice(5) || "",
    mood: e.mood_score || 3,
  }));

  return (
    <div className="space-y-4">
      <GlassCard variant="solid" className="p-5" delay={0.05}>
        <div className="flex items-center gap-2 mb-4">
          <Smile className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-[14px] text-foreground">How are you feeling?</h3>
        </div>
        <div className="flex justify-between gap-2">
          {MOODS.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedMood(m.key)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[14px] spring-tap transition-all ${
                selectedMood === m.key ? "bg-primary/10 ring-2 ring-primary/30" : "bg-muted/50"
              }`}
            >
              <span className="text-[24px]">{m.emoji}</span>
              <span className={`text-[10px] font-semibold ${selectedMood === m.key ? m.color : "text-muted-foreground"}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
        {selectedMood && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={saveMood}
            disabled={saving}
            className="w-full h-11 mt-3 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Mood"}
          </motion.button>
        )}
      </GlassCard>

      {chartData.length > 0 && (
        <GlassCard variant="solid" className="p-5" delay={0.1}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold text-[14px] text-foreground">Mood Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} hide />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {isLoading && <div className="h-20 rounded-[20px] shimmer" />}
    </div>
  );
}