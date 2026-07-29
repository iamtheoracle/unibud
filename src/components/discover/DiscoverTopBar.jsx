import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function initials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "U";
}

/**
 * DiscoverTopBar — greeting + UNIBUD OS wordmark + notification + avatar.
 */
export default function DiscoverTopBar({ user }) {
  const navigate = useNavigate();
  const name = user?.full_name || "Scholar";
  return (
    <div className="flex justify-between items-center px-1 pt-2 pb-3">
      <div>
        <p className="text-[12px] font-medium text-muted-foreground">{greeting()}</p>
        <p className="font-heading font-bold text-[20px] text-foreground tracking-tight leading-tight">
          {name} <span className="text-primary">✦</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-heading font-extrabold text-[15px] tracking-tight">
          <span className="text-primary">UNIBUD</span>
          <span className="text-muted-foreground/40 font-light">OS</span>
        </span>
        <button
          onClick={() => navigate("/notifications")}
          className="relative w-9 h-9 rounded-full glass grid place-items-center spring-tap"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
        </button>
        <button
          onClick={() => navigate("/me")}
          className="w-9 h-9 rounded-full grid place-items-center font-semibold text-[13px] text-primary-foreground spring-tap"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
            boxShadow: "0 0 18px hsl(var(--primary) / 0.30)",
          }}
        >
          {initials(name)}
        </button>
      </div>
    </div>
  );
}