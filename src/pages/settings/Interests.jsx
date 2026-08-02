import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import InterestSelection from "@/components/communities/InterestSelection";
import { useInterests } from "@/hooks/useInterests";

/**
 * Interests settings page — lets students update their interest selections.
 * Accessible from Settings → Interests & Preferences.
 */
export default function Interests() {
  const navigate = useNavigate();
  const { interests } = useInterests();
  const [completed, setCompleted] = useState(false);

  return (
    <div className="min-h-screen pb-32 safe-area-pt">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-[520px] mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap"
            aria-label="Back"
          >
            <ChevronLeft className="w-[20px] h-[20px] text-foreground" strokeWidth={2} />
          </button>
          <h1 className="text-[18px] font-bold tracking-tight text-foreground">Interests</h1>
        </div>
      </header>

      {completed ? (
        <div className="max-w-[520px] mx-auto px-5 pt-8 flex flex-col items-center text-center">
          <p className="text-[14px] text-muted-foreground">
            Your interests have been updated. I'll use these to recommend communities.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-5 py-2.5 rounded-full bg-foreground text-background text-[13px] font-semibold spring-tap"
          >
            Done
          </button>
        </div>
      ) : (
        <InterestSelection
          initialInterests={interests}
          editMode
          onComplete={() => setCompleted(true)}
        />
      )}
    </div>
  );
}