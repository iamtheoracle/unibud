import React from "react";
import { Link } from "react-router-dom";
import { Bell, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import MorningBriefing from "@/components/home/MorningBriefing";
import AcademicSnapshot from "@/components/home/AcademicSnapshot";
import SmartRecommendations from "@/components/home/SmartRecommendations";
import QuickActions from "@/components/home/QuickActions";
import CampusLife from "@/components/home/CampusLife";
import WeatherCard from "@/components/home/WeatherCard";
import CampusPulse from "@/components/home/CampusPulse";
import TodaySchedule from "@/components/home/TodaySchedule";

export default function Home() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.preferred_name || user?.full_name?.split(" ")[0] || "Student";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between pt-12 pb-2 px-5">
        <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">UNIBUD</h1>
        <div className="flex items-center gap-2.5">
          <Link to="/notifications" className="relative w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center">
            <Bell className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-primary rounded-full border-2 border-card text-[9px] font-bold text-primary-foreground flex items-center justify-center">3</span>
          </Link>
          <Link to="/me" className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-sm flex items-center justify-center text-primary-foreground font-bold text-sm">
            {firstName.charAt(0)}
          </Link>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 pb-4">
        <h2 className="font-heading font-bold text-[20px] tracking-tight text-foreground">{greeting}, {firstName} 👋</h2>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[12px] text-muted-foreground font-medium">{user?.university || "University of Benin"}</span>
        </div>
      </div>

      <div className="px-4 space-y-5 pb-8">
        <MorningBriefing user={user} />
        <WeatherCard />
        <AcademicSnapshot />
        <TodaySchedule />
        <SmartRecommendations />
        <QuickActions />
        <CampusPulse />
        <CampusLife />
      </div>
    </div>
  );
}