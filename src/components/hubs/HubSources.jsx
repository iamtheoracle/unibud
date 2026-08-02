import React from "react";
import { ExternalLink } from "lucide-react";

/**
 * HubSources — trusted external platforms for each hub.
 * Students open content on the original platform (YouTube, Spotify, Netflix,
 * BBC Sport, etc.), then discuss it inside UNIBUD.
 *
 * Every link clearly shows where it opens — students always know they're
 * leaving UNIBUD. Orbit never copies external content.
 */
export default function HubSources({ hub }) {
  if (!hub.sources || hub.sources.length === 0) return null;

  return (
    <div className="px-5 pb-4">
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5 px-1">
        Trusted Sources
      </h2>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
        {hub.sources.map((source) => {
          const Icon = source.icon;
          return (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 w-36 p-3 rounded-[16px] glass-card spring-tap flex flex-col gap-2"
            >
              <div
                className="w-9 h-9 rounded-[12px] grid place-items-center"
                style={{ background: `hsl(${hub.color} / 0.1)` }}
              >
                <Icon className="w-[18px] h-[18px]" style={{ color: `hsl(${hub.color})` }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-foreground">{source.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{source.label}</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground mt-auto">
                <ExternalLink className="w-3 h-3" />
                Open
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}