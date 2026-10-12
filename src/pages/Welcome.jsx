import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import UnibudMark from "@/components/brand/UnibudMark";

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
      <div className="flex items-center justify-center gap-4 px-6">
        <div className="flex items-center gap-2.5">
          <UnibudMark className="h-12 w-12 sm:h-16 sm:w-16" />
          <span className="select-none text-4xl font-black tracking-[0.08em] sm:text-6xl">
            UNIBUD
          </span>
        </div>
        <span className="border-l border-neutral-300 pl-3 text-[9px] font-semibold uppercase leading-tight tracking-[0.16em] text-neutral-600 sm:text-xs">
          ORACLE
          <br />
          ARC
        </span>
      </div>
      <div
        className="absolute bottom-12 h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-800 motion-reduce:animate-none"
        role="status"
        aria-label="Loading"
      />
    </main>
  );
}
