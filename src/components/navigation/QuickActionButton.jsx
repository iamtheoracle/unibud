import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 };
const LONG_PRESS_DELAY = 350;

/**
 * QuickActionButton — wraps any nav button with iOS-style long-press detection.
 * - Quick tap: fires onClick normally with whileTap feedback.
 * - Long press (350ms): fires onQuickAction(itemKey, rect), suppresses onClick.
 * - Lifts slightly during press for tactile feedback.
 */
export default function QuickActionButton({
  itemKey,
  onQuickAction,
  onClick,
  children,
  className,
  ...rest
}) {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef(null);
  const triggeredRef = useRef(false);

  const start = (e) => {
    triggeredRef.current = false;
    setIsPressed(true);
    const target = e.currentTarget;
    timeoutRef.current = setTimeout(() => {
      triggeredRef.current = true;
      setIsPressed(false);
      const rect = target?.getBoundingClientRect?.();
      onQuickAction?.(itemKey, rect);
    }, LONG_PRESS_DELAY);
  };

  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPressed(false);
  };

  // Strip spring-tap — framer-motion handles all press feedback here
  const cleanClass = className?.replace("spring-tap", "").trim();

  return (
    <motion.button
      {...rest}
      className={cleanClass}
      animate={{ scale: isPressed ? 1.06 : 1, y: isPressed ? -2 : 0 }}
      whileTap={isPressed ? undefined : { scale: 0.97 }}
      transition={SPRING}
      onTouchStart={start}
      onTouchEnd={clear}
      onTouchMove={clear}
      onTouchCancel={clear}
      onMouseDown={start}
      onMouseUp={clear}
      onMouseLeave={clear}
      onClick={(e) => {
        if (triggeredRef.current) {
          e.preventDefault();
          e.stopPropagation();
          triggeredRef.current = false;
          return;
        }
        onClick?.(e);
      }}
    >
      {children}
    </motion.button>
  );
}