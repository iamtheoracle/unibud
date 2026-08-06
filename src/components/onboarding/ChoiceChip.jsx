import React from "react";

/**
 * ChoiceChip — pill-shaped choice used inline in the onboarding chat.
 */
export default function ChoiceChip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-[15px] font-medium glass border border-border text-foreground spring-tap hover:border-primary/60 hover:text-primary transition-colors"
    >
      {label}
    </button>
  );
}