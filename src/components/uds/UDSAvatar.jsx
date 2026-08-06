import React from "react";
import { cn } from "@/lib/utils";

/** UDSAvatar — image or initials, pill-shaped, token-colored. */
export default function UDSAvatar({ name = "", src = "", size = 40, className }) {
  const initials = name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return (
    <div className={cn("flex items-center justify-center bg-primary/15 text-primary font-heading font-semibold overflow-hidden flex-shrink-0", className)} style={{ width: size, height: size, borderRadius: 9999 }}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (initials || "—")}
    </div>
  );
}