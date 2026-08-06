import React from "react";
import { Image } from "@/components/ui/image";

const LOGO_URL = "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/7de0fdf43_6C287179-9048-4978-AA9F-F2B45C76A69A.png";

/**
 * BrandMark — UNIBUD logo mark for use in headers, footers, loading states.
 * Renders the mountain + wordmark logo.
 */
export default function BrandMark({ className = "", size = "md" }) {
  const sizes = {
    sm: "w-[80px]",
    md: "w-[120px]",
    lg: "w-[180px]",
    xl: "w-[240px]",
  };
  return (
    <Image
      src={LOGO_URL}
      alt="UNIBUD — The Future Starts Together."
      fittingType="fit"
      className={`${sizes[size]} h-auto ${className}`}
    />
  );
}