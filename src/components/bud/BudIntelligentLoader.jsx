import React from "react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion/motionPresets";
import BudScene from "@/components/bud/BudScene";

/**
 * Contextual loading messages — exported for backward compatibility.
 * Each key maps to progressive messages that cycle while work is in flight.
 */
export const BUD_LOADING_MESSAGES = {
  notes: ["Bud is reading your lecture notes...", "Summarizing key concepts...", "Almost there..."],
  scholarships: ["Finding scholarship opportunities...", "Matching your profile...", "Filtering deadlines..."],
  study_summary: ["Bud is reviewing your progress...", "Generating your study summary...", "Polishing it up..."],
  campus: ["Preparing your campus...", "Loading your communities...", "Almost ready..."],
  assignments: ["Reviewing your assignments...", "Checking deadlines...", "Sorting by priority..."],
  exams: ["Checking your exam schedule...", "Finding upcoming exams...", "Counting down..."],
  search: ["Bud is searching...", "Finding the best matches...", "Ranking results..."],
  upload: ["Bud is processing your file...", "Understanding the content...", "Almost done..."],
  grades: ["Loading your grades...", "Calculating your GPA...", "Preparing trends..."],
  events: ["Finding campus events...", "Checking your calendar...", "Sorting by date..."],
  default: ["Bud is thinking...", "Working on it...", "Almost there..."],
};

/** Maps legacy context keys to BudScene activity keys. */
const CONTEXT_TO_ACTIVITY = {
  notes: "reading",
  scholarships: "scholarship_search",
  study_summary: "study_summary",
  campus: "companion",
  assignments: "assignment_analysis",
  exams: "exam_preparation",
  search: "searching",
  upload: "scanning",
  grades: "analyzing",
  events: "scheduling",
  default: "companion",
};

const SIZE_MAP = { sm: 64, md: 92, lg: 120 };

/**
 * BudIntelligentLoader — replaces every generic loading spinner with
 * Bud performing a contextual activity (reading, typing, searching, etc.).
 *
 * Usage:
 *   <BudIntelligentLoader context="assignments" />
 *   <BudIntelligentLoader message="Bud is reading your lecture notes..." />
 */
export default function BudIntelligentLoader({ context = "default", message, size = "md" }) {
  const activity = CONTEXT_TO_ACTIVITY[context] || "companion";
  const pxSize = SIZE_MAP[size] || 92;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="py-6"
    >
      <BudScene activity={activity} size={pxSize} message={message} />
    </motion.div>
  );
}