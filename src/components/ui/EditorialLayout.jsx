import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * EditorialLayout — UNIBUD's unified layout primitive.
 *
 * Replaces card-heavy dashboards with an editorial rhythm:
 *   Section → Content → Divider → Content → Divider → ...
 *
 * Usage:
 *   <EditorialLayout>
 *     <EditorialLayout.Section title="Today" action={<Button>See all</Button>}>
 *       <YourContent />
 *     </EditorialLayout.Section>
 *     <EditorialLayout.Section title="Assignments">
 *       <YourContent />
 *     </EditorialLayout.Section>
 *   </EditorialLayout>
 */

const FADE_UP = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

function EditorialLayout({ children, className }) {
  return (
    <div className={cn("divide-y divide-border/40", className)}>
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} {...FADE_UP} transition={{ ...FADE_UP.transition, delay: i * 0.04 }}>
          {child}
        </motion.div>
      ))}
    </div>
  );
}

function Section({ title, action, children, className }) {
  return (
    <section className={cn("py-6 first:pt-0 last:pb-0", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-heading font-heading font-bold text-foreground tracking-tight">
              {title}
            </h2>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

function Divider({ className, label }) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3 py-2", className)}>
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-label text-muted-foreground/60 font-body uppercase">{label}</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>
    );
  }
  return <div className={cn("h-px bg-border/40", className)} />;
}

EditorialLayout.Section = Section;
EditorialLayout.Divider = Divider;
export default EditorialLayout;
export { Section as EditorialSection, Divider as EditorialDivider };