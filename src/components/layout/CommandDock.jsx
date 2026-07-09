import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CommandDock() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-[88px] right-4 z-50 max-w-lg">
      <motion.button
        onClick={() => navigate("/bud")}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[#28A745] to-[#1a7a35] text-white shadow-[0_4px_24px_rgba(40,167,69,0.4)]"
      >
        <Sparkles className="w-6 h-6" strokeWidth={2} />
      </motion.button>
    </div>
  );
}