import React from "react";

/**
 * GlassSheen — A thin gradient line at the top of glass cards
 * simulating light hitting a glass surface. Creates depth and
 * premium Liquid Glass feel.
 */
export function GlassSheen() {
  return (
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent pointer-events-none" />
  );
}

/**
 * DynamicLighting — Multi-layer radial gradients that create
 * ambient depth and a sense of dynamic light within glass containers.
 *
 * @param {string} color - CSS variable name for primary light color (e.g. "primary", "info")
 * @param {string} secondary - HSL triple string for secondary ambient glow (e.g. "265 60% 50%")
 */
export function DynamicLighting({ color = "primary", secondary = "265 60% 50%" }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse 70% 90% at 15% 0%, hsl(var(--${color}) / 0.10), transparent 60%), radial-gradient(ellipse 50% 70% at 85% 100%, hsl(${secondary} / 0.04), transparent 60%)`,
      }}
    />
  );
}

/**
 * GlassCard — A premium Liquid Glass container with built-in spring
 * entrance, hover lift, glass sheen, and optional dynamic lighting.
 */
export function GlassCard({ children, className = "", lighting = false, lightingColor, onClick, ...rest }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      className={`relative overflow-hidden rounded-[24px] glass border border-border/30 ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      {...rest}
    >
      <GlassSheen />
      {lighting && <DynamicLighting color={lightingColor} />}
      <div className="relative">{children}</div>
    </Comp>
  );
}