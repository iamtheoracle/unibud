import React, { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { X, Minus, Maximize2, Minimize2, GripVertical } from "lucide-react";
import { useWindowManager } from "@/lib/desktop/WindowManagerContext";
import { cn } from "@/lib/utils";

const MIN_W = 360;
const MIN_H = 280;

/**
 * DesktopWindow — a floating, draggable, resizable glass window.
 *
 * Props:
 *  - window: { id, title, x, y, width, height, isMinimized, isMaximized, zIndex }
 *  - children: content
 */
export default function DesktopWindow({ window: win, children }) {
  const wm = useWindowManager();
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDragStart = useCallback((e) => {
    if (win.isMaximized) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = win.x;
    const origY = win.y;
    setDragging(true);

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const newX = Math.max(0, Math.min(window.innerWidth - 100, origX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, origY + dy));
      wm.updateWindowPosition(win.id, newX, newY);
    };
    const onUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [win, wm]);

  const handleResizeStart = useCallback((e) => {
    e.stopPropagation();
    if (win.isMaximized) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origW = win.width;
    const origH = win.height;

    const onMove = (ev) => {
      const dw = ev.clientX - startX;
      const dh = ev.clientY - startY;
      const newW = Math.max(MIN_W, origW + dw);
      const newH = Math.max(MIN_H, origH + dh);
      wm.updateWindowSize(win.id, newW, newH);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [win, wm]);

  if (win.isMinimized) return null;

  const style = win.isMaximized
    ? { left: 0, top: 0, width: "100%", height: "100%", zIndex: win.zIndex }
    : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={style}
      onMouseDown={() => wm.focusWindow(win.id)}
      className={cn(
        "absolute flex flex-col overflow-hidden",
        "crystal-card rounded-[14px]",
        dragging ? "cursor-grabbing" : ""
      )}
    >
      {/* Title bar */}
      <div
        ref={dragRef}
        onMouseDown={handleDragStart}
        onDoubleClick={() => wm.toggleMaximize(win.id)}
        className={cn(
          "flex items-center gap-2 h-9 px-3 flex-shrink-0 border-b border-border/40",
          "bg-gradient-to-b from-white/[0.04] to-transparent",
          win.isMaximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        )}
      >
        <span className="text-[11px] font-bold text-foreground/90 truncate flex-1">{win.title}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); wm.minimizeWindow(win.id); }}
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 spring-tap"
          >
            <Minus className="w-3 h-3 text-muted-foreground" strokeWidth={2.5} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); wm.toggleMaximize(win.id); }}
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 spring-tap"
          >
            {win.isMaximized ? <Minimize2 className="w-3 h-3 text-muted-foreground" strokeWidth={2.5} /> : <Maximize2 className="w-3 h-3 text-muted-foreground" strokeWidth={2.5} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); wm.closeWindow(win.id); }}
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-destructive/80 spring-tap"
          >
            <X className="w-3 h-3 text-muted-foreground" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Resize handle */}
      {!win.isMaximized && (
        <div
          ref={resizeRef}
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end"
        >
          <GripVertical className="w-3 h-3 text-muted-foreground/50 rotate-45" strokeWidth={2} />
        </div>
      )}
    </motion.div>
  );
}