import React from "react";
import { Calendar, MapPin } from "lucide-react";

const DEMO = {
  id: "up1",
  home_team: "Arsenal",
  away_team: "Chelsea",
  home_short: "ARS",
  away_short: "CHE",
  status: "scheduled",
  competition: "Premier League",
  venue: "Emirates Stadium",
  kickoff: new Date(Date.now() + 86400000).toISOString(),
  home_color: "0 0% 100%",
  away_color: "217 91% 60%",
};

/**
 * FootballMatchCard — featured upcoming / fixture card.
 */
export default function FootballMatchCard({ match }) {
  const m = match || DEMO;
  const kickoff = new Date(m.kickoff);
  const dateStr = kickoff.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeStr = kickoff.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <section className="rounded-2xl bg-card border border-border/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{m.competition}</span>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-foreground/10 text-foreground">
          {m.status === "scheduled" ? "Upcoming" : m.status}
        </span>
      </div>
      <div className="flex items-center justify-around py-2">
        <TeamBadg short={m.home_short} name={m.home_team} color={m.home_color} />
        <div className="text-center px-4">
          <p className="text-[20px] font-bold text-foreground tabular-nums">
            {m.status === "scheduled" ? "VS" : `${m.home_score ?? 0} - ${m.away_score ?? 0}`}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{m.status === "scheduled" ? dateStr : "Kick off"}</p>
        </div>
        <TeamBadg short={m.away_short} name={m.away_team} color={m.away_color} />
      </div>
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/20 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateStr} · {timeStr}</span>
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.venue}</span>
      </div>
    </section>
  );
}

function TeamBadg({ short, name, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-bold text-background" style={{ background: `hsl(${color || "0 0% 100%"})` }}>
        {short?.slice(0, 3)}
      </span>
      <span className="text-[11px] font-semibold text-foreground text-center truncate w-full">{name}</span>
    </div>
  );
}