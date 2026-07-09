import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import BottomNav from "@/components/layout/BottomNav";
import CommandDock from "@/components/layout/CommandDock";
import CampusTutorial from "@/components/onboarding/CampusTutorial";

export default function AppLayout() {
  const location = useLocation();
  const hideDock = ["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (!user.university) {
      navigate("/university-selection", { replace: true });
    } else if (!user.preferred_name) {
      navigate("/student-profile", { replace: true });
    } else if (!user.onboarding_completed) {
      const STEP_ROUTES = {
        learning_preferences: "/onboarding/learning-preferences",
        academic_goals: "/onboarding/academic-goals",
        study_schedule: "/onboarding/study-schedule",
        interests: "/onboarding/interests",
        meet_bud: "/onboarding/meet-bud",
        preparing_campus: "/onboarding/preparing-campus",
      };
      navigate(STEP_ROUTES[user.onboarding_step] || "/onboarding/learning-preferences", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto relative pb-28">
        <Outlet />
      </div>
      {!hideDock && (
        <>
          <BottomNav />
          <CommandDock />
        </>
      )}
      <CampusTutorial user={user} />
    </div>
  );
}