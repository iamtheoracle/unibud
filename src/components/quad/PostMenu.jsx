import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Pin, Trash2, Flag, Copy, Globe, Bookmark } from "lucide-react";

const MENU_ITEMS = [
  { id: "pin", label: "Pin", icon: Pin, show: (isOwner) => isOwner },
  { id: "bookmark", label: "Bookmark", icon: Bookmark, show: () => true },
  { id: "copy", label: "Copy text", icon: Copy, show: () => true },
  { id: "translate", label: "Translate", icon: Globe, show: () => true },
  { id: "report", label: "Report", icon: Flag, show: () => true, danger: false },
  { id: "delete", label: "Delete", icon: Trash2, show: (isOwner) => isOwner, danger: true },
];

export default function PostMenu({ isOwner, onAction }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (action) => {
    setOpen(false);
    onAction(action);
  };

  const visibleItems = MENU_ITEMS.filter((item) => item.show(isOwner));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center spring-tap"
      >
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-10 w-48 rounded-[16px] glass-strong elevated-shadow p-1.5 z-50"
          >
            {visibleItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[12px] font-medium transition-colors ${
                  item.danger
                    ? "text-error hover:bg-error/5"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={1.8} />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}