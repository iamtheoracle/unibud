import React from "react";

/**
 * LiquidGlass — the core frosted-glass surface for UNIBUD.
 * Matte-black foundation, white tint, soft inner highlight, premium blur.
 */
export default function LiquidGlass({ as: Tag = "div", className = "", strong = false, children, ...props }) {
  return (
    <Tag className={`${strong ? "glass-strong" : "glass"} ${className}`} {...props}>
      {children}
    </Tag>
  );
}