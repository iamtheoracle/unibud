import React from "react";
import { Bell, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function PageHeader({ title, subtitle, showProfile = true }) {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const firstName = user?.preferred_name || user?.full_name?.split(" ")[0] || "Student";

  return (
    <div className="flex items-center justify-between pt-12 pb-2 px-5">
      <div>
        <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-[12px] text-muted-foreground font-medium">{subtitle}</p>}
      </div>
      {showProfile && (
        <div className="flex items-center gap-2.5">
          <Link to="/notifications" className="relative w-10 h-10 rounded-full bg-card premium-shadow flex items-center justify-center">
            <Bell className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-primary rounded-full border-2 border-card text-[9px] font-bold text-primary-foreground flex items-center justify-center">3</span>
          </Link>
          <Link to="/me" className="w-10 h-10 rounded-full bg-primary shadow-sm flex items-center justify-center text-primary-foreground font-bold text-sm">
            {firstName.charAt(0)}
          </Link>
        </div>
      )}
    </div>
  );
}