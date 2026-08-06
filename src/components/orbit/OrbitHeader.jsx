import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Plus } from "lucide-react";
import { useSearch } from "@/lib/search/SearchContext";
import { useCreate } from "@/lib/CreateContext";
import { hapticTap } from "@/lib/haptics";

/**
 * OrbitHeader — premium sticky header for the Orbit Home feed.
 * Left: Orbit wordmark. Right: Universal Search, Notifications, Quick Actions.
 * All icons remain visible while scrolling.
 */
export default function OrbitHeader() {
  const navigate = useNavigate();
  const { openSearch } = useSearch();
  const { openCreate } = useCreate();

  return (
    <div className="flex items-center justify-between px-5 h-14">
      <h1 className="text-[22px] font-bold tracking-tight text-foreground select-none">
        Orbit
      </h1>
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => { hapticTap(); openSearch(); }}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap"
          aria-label="Search"
        >
          <Search className="w-[19px] h-[19px] text-foreground" strokeWidth={1.8} />
        </button>
        <button
          onClick={() => { hapticTap(); navigate("/notifications"); }}
          className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap"
          aria-label="Notifications"
        >
          <Bell className="w-[19px] h-[19px] text-foreground" strokeWidth={1.8} />
        </button>
        <button
          onClick={() => { hapticTap(); openCreate(); }}
          className="w-9 h-9 rounded-full flex items-center justify-center spring-tap"
          style={{
            background: "linear-gradient(135deg, rgba(255,138,42,0.18), rgba(255,110,20,0.12))",
          }}
          aria-label="Quick Actions"
        >
          <Plus className="w-[20px] h-[20px] text-foreground" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}