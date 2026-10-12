import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import WelcomeLogo from "@/components/welcome/WelcomeLogo";

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      if (active) navigate("/login", { replace: true });
    }, 1100);

    base44.auth.isAuthenticated()
      .then((authenticated) => {
        if (active && authenticated) {
          window.clearTimeout(timeout);
          navigate("/", { replace: true });
        }
      })
      .catch(() => {
        // If session lookup fails, continue to the sign-in screen.
      });

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <main
      aria-label="UNIBUD loading"
      className="fixed inset-0 flex min-h-[100dvh] items-center justify-center overflow-hidden bg-white text-black"
    >
      <div className="flex w-full items-center justify-center px-6">
        <WelcomeLogo tone="black" size="xl" />
      </div>
      <div
        className="absolute bottom-12 h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-800 motion-reduce:animate-none"
        role="status"
        aria-label="Loading"
      />
    </main>
  );
}
