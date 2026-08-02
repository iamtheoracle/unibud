import React from "react";

/**
 * TypingIndicator — animated dots shown when someone is composing.
 */
export default function TypingIndicator({ names = [] }) {
  if (names.length === 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 mb-1">
        <div className="flex gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-[10px] text-muted-foreground">Typing...</span>
      </div>
    );
  }

  const text =
    names.length === 1
      ? `${names[0]} is typing...`
      : `${names.slice(0, 2).join(", ")}${names.length > 2 ? ` and ${names.length - 2} other${names.length > 3 ? "s" : ""}` : ""} are typing...`;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 mb-1">
      <div className="flex gap-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-[10px] text-muted-foreground">{text}</span>
    </div>
  );
}