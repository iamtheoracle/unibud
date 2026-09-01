import React from "react";

/**
 * The official UNIBUD mountain mark.
 * Uses currentColor — set text color on parent to control mark color.
 * Do not stretch, crop, rotate, recolor, or add effects.
 */
export default function UnibudMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Back peak */}
      <path
        d="M20.5 7L29 24H12L20.5 7Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
      {/* Front peak */}
      <path
        d="M12.5 4L4 24H21L12.5 4Z"
        fill="currentColor"
      />
    </svg>
  );
}