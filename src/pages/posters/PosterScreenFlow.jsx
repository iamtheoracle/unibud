import React from "react";
import { motion } from "framer-motion";
import BudOrb from "@/components/brand/BudOrb";
import {
  STUDENT_JOURNEY, LECTURER_JOURNEY, INSTITUTION_ADMIN_JOURNEY,
  APPLICANT_JOURNEY, OPERATIONS_JOURNEY,
} from "@/lib/posterData";
import { PosterHero, PosterSection, FlowChip } from "@/components/posters/PosterShared";
import { SPRING } from "@/lib/glassPresets";

const FLOW_ROWS = [
  { label: "Student", items: STUDENT_JOURNEY, color: "text-primary", accent: "border-primary/20" },
  { label: "Lecturer", items: LECTURER_JOURNEY, color: "text-info", accent: "border-info/20" },
  { label: "Institution Admin", items: INSTITUTION_ADMIN_JOURNEY, color: "text-warning", accent: "border-warning/20" },
  { label: "Applicant (Pre-University)", items: APPLICANT_JOURNEY, color: "text-success", accent: "border-success/20" },
  { label: "Operations Center", items: OPERATIONS_JOURNEY, color: "text-purple", accent: "border-purple/20" },
];

export default function PosterScreenFlow() {
  return (
    <div className="min-h-screen portal-bg p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Hero */}
        <PosterHero
          number="04"
          title="Screen & Workflow Map"
          subtitle="Complete end-to-end journeys for every role — showing how Bud and Oracle support every user without becoming separate apps."
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING.bouncy}
            className="flex items-center gap-2 px-4 py-2 rounded-[18px] glass border border-primary/20 gold-glow"
          >
            <BudOrb className="w-6 h-6 text-primary" />
            <span className="font-heading font-bold text-[13px] text-foreground">Bud supports every role</span>
          </motion.div>
        </PosterHero>

        {/* Parallel Flows */}
        {FLOW_ROWS.map((row, rowIdx) => (
          <PosterSection
            key={row.label}
            title={row.label}
            description={row.label === "Student" ? "The primary journey — 14 steps from splash to alumni" : `${row.items.length} steps`}
            delay={0.1 + rowIdx * 0.1}
          >
            <div className="flex flex-wrap items-center gap-1">
              {row.items.map((step, i) => (
                <React.Fragment key={step.name}>
                  <FlowChip {...step} delay={0.15 + rowIdx * 0.1 + i * 0.04} />
                  {i < row.items.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ ...SPRING.smooth, delay: 0.15 + rowIdx * 0.1 + i * 0.04 + 0.02 }}
                      className="w-4 h-px bg-muted-foreground/20 flex-shrink-0 origin-left"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </PosterSection>
        ))}

      </div>
    </div>
  );
}