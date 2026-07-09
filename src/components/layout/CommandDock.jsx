import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Search, Zap, ShieldAlert, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const dockActions = [
  { icon: Sparkles, label: "Bud", color: "bg-gradient-to-br from-blue-500 to-purple-500", path: "/bud" },
  { icon: Search, label: "Search", color: "bg-gradient-to-br from-slate-600 to-slate-800", path: "/search" },
  { icon: Zap, label: "Quick", color: "bg-gradient-to-br from-amber-400 to-orange-500", path: null },
  { icon: ShieldAlert, label: "SOS", color: "bg-gradient-to-br from-red-500 to-rose-600", path: null },
];

export default function CommandDock() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (action) => {
    if (action.path) {
      navigate(action.path);
    }
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-20 right-4 z-50 max-w-lg">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
              className="mb-3 glass-strong rounded-2xl p-3 space-y-1.5"
            >
              {dockActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAction(action)}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/80 transition-all"
                >
                  <div className={`w-9 h-9 rounded-xl ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                  </div>
                  <span className="font-heading font-semibold text-sm">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.9 }}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ml-auto ${
            isOpen
              ? "bg-foreground text-background"
              : "bg-gradient-to-br from-blue-500 to-purple-600 text-white unibud-glow"
          }`}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </motion.button>
      </div>
    </>
  );
}