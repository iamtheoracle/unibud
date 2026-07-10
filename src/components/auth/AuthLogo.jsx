import React from "react";
import { motion } from "framer-motion";
import UnibudLogo from "@/components/brand/UnibudLogo";

export default function AuthLogo({ delay = 0, size = "md" }) {
  const logoSize = size === "lg" ? "lg" : "md";
  const mb = size === "lg" ? "mb-7" : "mb-6";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={`flex flex-col items-center ${mb}`}
    >
      <UnibudLogo variant="light" size={logoSize} />
    </motion.div>
  );
}