import React from "react";
import { Radio } from "lucide-react";

const DEMO = [
  { id: "m1", home_team: "Man United", away_team: "Liverpool", home_short: "MUN", away_short: "LIV", home_score: 1, away_score: 1, status: "live", minute: 67, competition: "Premier League", home_color: "0 0% 100%", away_color: "0 70% 50%" },
  { id: "m2", home_team: "Barcelona", away_team: "Real Madrid", home_short: "BAR", away_short: "RMA", home_score: 2, away_score: 0, status: "live", minute: 34, competition: "La Liga", home_color: "0 0% 100%", away_color: "0 0% 80%" },
  { id: "m3", home_team: "Bayern", away_team: "Dortmund", home_short: "BAY", away_short: "BVB", home_score: 0, away_score: 0, status: "halftime", minute: 45, competition: "Bundesliga", home_color: "0 0% 90%", away_color: "38 92% 50%" },
];

/**
 * FootballScoresTicker — horizontal live scores rail.
 * Monochrome, calm; a single red live dot is the only colour allowed.
 */
export default function FootballScoresTicker({ matches = [] }) {
  const live = matches.filter((m) => m.status === "live" || m.status === "halftime");
  const data = live.length > 0 ? live : DEMO;

  return (
    <section>
      <div className="flex items-center gap-1.5 mb-2">
        <Radio className="w-3.5 h-3.5 text-error" />
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Live now</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {data.map((m) => (
          <div key={m.id} className="flex-shrink-0 w-[180px] rounded-2xl bg-card border border-border/30 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground truncate">{m.competition}</span>
              <span className="flex items-center gap-1 text-[9px] font-bold text-error">
                <span className="w-1.5 h-1.5 rounded-full bg-error live-pulse" />
                {m.status === "halftime" ? "HT" : `${m.minute}'`}
              </span>
            </div>
            <ScoreRow short={m.home_short} name={m.home_team} score={m.home_score} color={m.home_color} />
            <ScoreRow short={m.away_short} name={m.away_team} score={m.away_score} color={m.away_color} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ScoreRow({ short, name, score, color }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-background flex-shrink-0" style={{ background: `hsl(${color || "0 0% 100%"})` }}>
        {short?.slice(0, 3)}
      </span>
      <span className="flex-1 text-[12px] font-semibold text-foreground truncate">{name}</span>
      <span className="text-[15px] font-bold text-foreground tabular-nums">{score}</span>
    </div>
  );
}