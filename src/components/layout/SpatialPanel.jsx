import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * SpatialPanel — a reusable, draggable floating glass panel.
 * Used for floating menus, search, notifications, context menus, and any
 * content that should "float" rather than be locked to the screen.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title: string
 *  - initialX, initialY: number — position
 *  - width: number
 *  - children: content
 *  - variant: "glass" | "strong" | "mirror"
 */
export default function SpatialPanel({
  open,
  onClose,
  title,
  initialX,
  initialY,
  width = 360,
  children,
  variant = "glass",
  draggable = true,
}) {
  const [pos, setPos] = useState({
    x: initialX ?? (window.innerWidth - width) / 2,
    y: initialY ?? 80,
  });
  const dragData = useRef(null);

  const handleDragStart = useCallback((e) => {
    if (!draggable) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = pos.x;
    const origY = pos.y;
    dragData.current = { startX, startY, origX, origY };

    const onMove = (ev) => {
      if (!dragData.current) return;
      const dx = ev.clientX - dragData.current.startX;
      const dy = ev.clientY - dragData.current.startY;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 100, dragData.current.origX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 60, dragData.current.origY + dy)),
      });
    };
    const onUp = () => {
      dragData.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [pos, draggable]);

  const surfaceClass = {
    glass: "glass",
    strong: "glass-strong",
    mirror: "mirror-glass-350",
  }[variant] || "glass";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: EASE }}
          style={{ left: pos.x, top: pos.y, width }}
          className={cn(
            "fixed z-[6000] rounded-[16px] overflow-hidden",
            surfaceClass,
            draggable && "cursor-grab active:cursor-grabbing"
          )}
          onMouseDown={handleDragStart}
        >
          {title && (
            <div className="flex items-center gap-2 h-9 px-3 border-b border-border/30 flex-shrink-0">
              {draggable && <GripHorizontal className="w-3.5 h-3.5 text-muted-foreground/50" strokeWidth={2} />}
              <span className="text-[11px] font-bold text-foreground flex-1">{title}</span>
              {onClose && (
                <button onClick={onClose} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 spring-tap">
                  <X className="w-3 h-3 text-muted-foreground" strokeWidth={2.5} />
                </button>
              )}
            </div>
          )}
          <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}