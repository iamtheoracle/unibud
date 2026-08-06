import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, EASE } from "@/lib/motion/motionPresets";

/**
 * StaggerGrid — wraps a list of items in a staggered entrance animation.
 *
 * Usage:
 *   <StaggerGrid>
 *     {items.map(item => <StaggerGrid.Item key={item.id}>...</StaggerGrid.Item>)}
 *   </StaggerGrid>
 *
 * Or with raw children:
 *   <StaggerGrid columns={2}>
 *     <Card /> <Card /> <Card />
 *   </StaggerGrid>
 */
function StaggerGrid({ children, columns = 1, gap = "gap-3", className = "" }) {
  const gridClass = columns === 1 ? "flex flex-col" : columns === 2 ? "grid grid-cols-2" : columns === 3 ? "grid grid-cols-3" : "grid grid-cols-2 sm:grid-cols-3";
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn(gridClass, gap, className)}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = "" }) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
    >
      {children}
    </motion.div>
  );
}

StaggerGrid.Item = StaggerItem;

export default StaggerGrid;