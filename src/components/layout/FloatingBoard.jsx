import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minimize2, Maximize2, Lock, Unlock, PanelRight, Maximize } from "lucide-react";

const STORAGE_KEY = "unibud-floating-board";
const SNAP_THRESHOLD = 24;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;
const BUBBLE_SIZE = 56;

const MODES = {
  BUBBLE: "bubble",
  PANEL: "panel",
  FULLSCREEN: "fullscreen",
  FLOATING: "floating",
};

/**
 * FloatingBoard — a complete resizable, movable workspace.
 *
 * Capabilities:
 * - Fully resizable by dragging edges or corners
 * - Freely movable anywhere on screen
 * - Snap to screen edges
 * - Save last position + size automatically
 * - Minimize into floating bubble
 * - Expand into side panel
 * - Expand into full-screen workspace
 * - Lock/unlock position
 * - Smooth animations
 * - Mobile and desktop optimized
 */
export default function FloatingBoard({ children, title = "Bud", initialMode = MODES.FLOATING }) {
  const [mode, setMode] = useState(initialMode);
  const [locked, setLocked] = useState(false);
  const [pos, setPos] = useState({ x: 40, y: 80 });
  const [size, setSize] = useState({ w: 380, h: 520 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(null);
  const boardRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, posX: 0, posY: 0 });

  // Load saved state
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.pos) setPos(saved.pos);
      if (saved.size) setSize(saved.size);
      if (saved.mode) setMode(saved.mode);
      if (saved.locked !== undefined) setLocked(saved.locked);
    } catch {}
  }, []);

  // Save state on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pos, size, mode, locked }));
  }, [pos, size, mode, locked]);

  // ── Drag (move) ──
  const onDragStart = useCallback((e) => {
    if (locked || mode !== MODES.FLOATING) return;
    const point = e.touches ? e.touches[0] : e;
    dragStart.current = { x: point.clientX, y: point.clientY, posX: pos.x, posY: pos.y };
    setDragging(true);
    e.preventDefault();
  }, [locked, mode, pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - dragStart.current.x;
      const dy = point.clientY - dragStart.current.y;
      let newX = dragStart.current.posX + dx;
      let newY = dragStart.current.posY + dy;
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      newX = Math.max(0, Math.min(maxX, newX));
      newY = Math.max(0, Math.min(maxY, newY));
      // Snap to edges
      if (newX < SNAP_THRESHOLD) newX = 0;
      if (newX > window.innerWidth - size.w - SNAP_THRESHOLD) newX = window.innerWidth - size.w;
      if (newY < SNAP_THRESHOLD) newY = 0;
      setPos({ x: newX, y: newY });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, size.w]);

  // ── Resize ──
  const onResizeStart = useCallback((dir) => (e) => {
    if (locked || mode !== MODES.FLOATING) return;
    e.preventDefault();
    e.stopPropagation();
    const point = e.touches ? e.touches[0] : e;
    resizeStart.current = { x: point.clientX, y: point.clientY, w: size.w, h: size.h, posX: pos.x, posY: pos.y };
    setResizing(dir);
  }, [locked, mode, size, pos]);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e) => {
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - resizeStart.current.x;
      const dy = point.clientY - resizeStart.current.y;
      const start = resizeStart.current;
      let newW = start.w, newH = start.h, newX = start.posX, newY = start.posY;

      if (resizing.includes("e")) newW = Math.max(MIN_WIDTH, start.w + dx);
      if (resizing.includes("s")) newH = Math.max(MIN_HEIGHT, start.h + dy);
      if (resizing.includes("w")) {
        newW = Math.max(MIN_WIDTH, start.w - dx);
        newX = start.posX + (start.w - newW);
      }
      if (resizing.includes("n")) {
        newH = Math.max(MIN_HEIGHT, start.h - dy);
        newY = start.posY + (start.h - newH);
      }
      setSize({ w: newW, h: newH });
      setPos({ x: newX, y: newY });
    };
    const onUp = () => setResizing(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [resizing]);

  // ── Bubble mode ──
  if (mode === MODES.BUBBLE) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={() => setMode(MODES.FLOATING)}
        className="fixed z-[9998] crystal-dock rounded-full flex items-center justify-center spring-tap"
        style={{ left: pos.x, top: pos.y, width: BUBBLE_SIZE, height: BUBBLE_SIZE }}
      >
        <div className="w-7 h-7 rounded-full bg-foreground/90 flex items-center justify-center glow-pulse">
          <div className="w-3 h-3 rounded-full bg-background" />
        </div>
      </motion.button>
    );
  }

  // ── Compute styles based on mode ──
  const boardStyle = () => {
    if (mode === MODES.FULLSCREEN) {
      return { left: 0, top: 0, width: "100vw", height: "100vh", borderRadius: 0 };
    }
    if (mode === MODES.PANEL) {
      return { right: 0, top: 0, width: "min(420px, 100vw)", height: "100vh", borderRadius: 0 };
    }
    return { left: pos.x, top: pos.y, width: size.w, height: size.h };
  };

  const resizeHandles = mode === MODES.FLOATING ? ["n", "s", "e", "w", "ne", "nw", "se", "sw"] : [];

  return (
    <AnimatePresence>
      <motion.div
        ref={boardRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed z-[9998] crystal-dock flex flex-col overflow-hidden ${dragging ? "cursor-grabbing" : ""}`}
        style={boardStyle()}
      >
        {/* Header / drag handle */}
        <div
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          className={`flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] ${mode === MODES.FLOATING && !locked ? "cursor-grab" : ""} select-none flex-shrink-0`}
        >
          <div className="w-6 h-6 rounded-full bg-foreground/90 flex items-center justify-center flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-background" />
          </div>
          <span className="text-[13px] font-semibold text-foreground flex-1 truncate">{title}</span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setLocked(!locked)}
              className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center spring-tap text-muted-foreground hover:text-foreground"
              title={locked ? "Unlock position" : "Lock position"}
            >
              {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setMode(MODES.BUBBLE)}
              className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center spring-tap text-muted-foreground hover:text-foreground"
              title="Minimize to bubble"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            {mode !== MODES.PANEL && (
              <button
                onClick={() => setMode(MODES.PANEL)}
                className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center spring-tap text-muted-foreground hover:text-foreground"
                title="Side panel"
              >
                <PanelRight className="w-3.5 h-3.5" />
              </button>
            )}
            {mode !== MODES.FULLSCREEN && (
              <button
                onClick={() => setMode(MODES.FULLSCREEN)}
                className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center spring-tap text-muted-foreground hover:text-foreground"
                title="Full screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            {mode !== MODES.FLOATING && (
              <button
                onClick={() => setMode(MODES.FLOATING)}
                className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center spring-tap text-muted-foreground hover:text-foreground"
                title="Floating"
              >
                <Maximize className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {children}
        </div>

        {/* Resize handles — only in floating mode */}
        {resizeHandles.map((dir) => (
          <div
            key={dir}
            onMouseDown={onResizeStart(dir)}
            onTouchStart={onResizeStart(dir)}
            className="absolute z-10"
            style={resizeHandleStyle(dir)}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

function resizeHandleStyle(dir) {
  const base = { position: "absolute", background: "transparent" };
  const size = 8;
  if (dir === "n") return { ...base, top: -size / 2, left: size, right: size, height: size, cursor: "ns-resize" };
  if (dir === "s") return { ...base, bottom: -size / 2, left: size, right: size, height: size, cursor: "ns-resize" };
  if (dir === "e") return { ...base, right: -size / 2, top: size, bottom: size, width: size, cursor: "ew-resize" };
  if (dir === "w") return { ...base, left: -size / 2, top: size, bottom: size, width: size, cursor: "ew-resize" };
  if (dir === "ne") return { ...base, top: -size / 2, right: -size / 2, width: size * 2, height: size * 2, cursor: "nesw-resize" };
  if (dir === "nw") return { ...base, top: -size / 2, left: -size / 2, width: size * 2, height: size * 2, cursor: "nwse-resize" };
  if (dir === "se") return { ...base, bottom: -size / 2, right: -size / 2, width: size * 2, height: size * 2, cursor: "nwse-resize" };
  if (dir === "sw") return { ...base, bottom: -size / 2, left: -size / 2, width: size * 2, height: size * 2, cursor: "nesw-resize" };
  return base;
}