import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { isPortalRole } from "@/lib/portalConfig";
import { useDemoMode } from "@/lib/DemoModeContext";
import BottomNav from "@/components/layout/BottomNav";
import CommandDock from "@/components/layout/CommandDock";
import CampusTutorial from "@/components/onboarding/CampusTutorial";
import DemoModeBanner from "@/components/DemoModeBanner";

export default function AppLayout() {
  const location = useLocation();
  const { isDemoMode } = useDemoMode();
  const hideDock = ["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
    enabled: !isDemoMode,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user || isDemoMode) return;
    if (isPortalRole(user.role)) {
      navigate("/portal", { replace: true });
      return;
    }
    if (!user.university) {
      navigate("/university-selection", { replace: true });
    } else if (!user.university_connected && !user.preferred_name) {
      navigate("/university-connect", { replace: true });
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
  }, [user, navigate, isDemoMode]);

  return (
    <div className="min-h-screen bg-background">
      <DemoModeBanner />
      <div className="mx-auto relative pb-28 px-4 sm:px-5 max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl lg:pb-32">
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