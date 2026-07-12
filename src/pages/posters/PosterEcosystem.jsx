import React from "react";
import { motion } from "framer-motion";
import {
  STUDENT_EXPERIENCE, INSTITUTION_EXPERIENCE, KNOWLEDGE_NETWORK,
} from "@/lib/posterData";
import { PosterHeader, PosterSection, EntityCard } from "@/components/posters/PosterShared";
import { SPRING, scaleEntranceDelay, slideInRight } from "@/lib/glassPresets";
import { GlassSheen } from "@/components/portal/Glass";

export default function PosterEcosystem() {
  return (
    <div className="min-h-screen portal-bg p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PosterHeader
          number="03"
          title="Ecosystem"
          subtitle="Everything connected — universities, countries, marketplace, scholarships, jobs, housing, transport, research, libraries, alumni, and the Oracle Knowledge Network."
        />

        {/* Oracle Knowledge Network */}
        <PosterSection title="Oracle Knowledge Network" description="The global education graph — connected as one" delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {KNOWLEDGE_NETWORK.map((item, i) => (
              <motion.div
                key={item.name}
                {...scaleEntranceDelay(0.15 + i * 0.04)}
                whileHover={{ y: -4, transition: SPRING.hover }}
                className="relative overflow-hidden p-5 rounded-[22px] glass border border-border/20 text-center"
              >
                <GlassSheen />
                <div className={`w-12 h-12 rounded-[16px] ${item.bg} flex items-center justify-center mx-auto mb-3`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} strokeWidth={2.2} />
                </div>
                <p className="text-[20px] font-heading font-extrabold text-foreground">{item.count}</p>
                <h4 className="font-heading font-bold text-[12px] text-foreground mt-1">{item.name}</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </PosterSection>

        {/* Student Experience */}
        <PosterSection title="Student Experience" description="Seventeen modules that make up the complete student journey" delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {STUDENT_EXPERIENCE.map((item, i) => (
              <motion.div
                key={item.name}
                {...scaleEntranceDelay(0.2 + i * 0.03)}
                whileHover={{ y: -3, transition: SPRING.hover }}
                className="relative overflow-hidden p-4 rounded-[20px] glass border border-border/20"
              >
                <GlassSheen />
                <div className={`w-10 h-10 rounded-[14px] ${item.bg} flex items-center justify-center mb-2.5`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={2.2} />
                </div>
                <h4 className="font-heading font-bold text-[13px] text-foreground">{item.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </PosterSection>

        {/* Institution Experience */}
        <PosterSection title="Institution Experience" description="Ten modules for university administration and governance" delay={0.2}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {INSTITUTION_EXPERIENCE.map((item, i) => (
              <motion.div
                key={item.name}
                {...scaleEntranceDelay(0.25 + i * 0.04)}
                whileHover={{ y: -3, transition: SPRING.hover }}
                className="relative overflow-hidden p-4 rounded-[20px] glass border border-border/20"
              >
                <GlassSheen />
                <div className={`w-10 h-10 rounded-[14px] ${item.bg} flex items-center justify-center mb-2.5`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={2.2} />
                </div>
                <h4 className="font-heading font-bold text-[13px] text-foreground">{item.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </PosterSection>

        {/* Ecosystem Stats */}
        <PosterSection title="Platform Scale" description="The global UNIBUD ecosystem at a glance" delay={0.25}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Users", value: "128,560+", color: "text-primary" },
              { label: "Institutions", value: "1,248+", color: "text-purple" },
              { label: "Countries", value: "85+", color: "text-info" },
              { label: "Uptime", value: "99.99%", color: "text-success" },
              { label: "Bud Active", value: "24/7", color: "text-warning" },
              { label: "System Status", value: "Operational", color: "text-success" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                {...scaleEntranceDelay(0.3 + i * 0.04)}
                className="text-center p-4 rounded-[18px] glass border border-border/20"
              >
                <p className={`text-[20px] font-heading font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </PosterSection>

        {/* Footer — Four Pillars */}
        <PosterSection title="Four Pillars" description="The foundation of UNIBUD" delay={0.3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "ONE PLATFORM", desc: "All tools. All roles. One system.", icon: "🏗️" },
              { title: "ONE COMPANION", desc: "Bud is always with you.", icon: "✨" },
              { title: "ONE ECOSYSTEM", desc: "Learn. Connect. Grow.", icon: "🌍" },
              { title: "ONE FUTURE", desc: "The future starts together.", icon: "🚀" },
            ].map((pillar, i) => (
              <motion.div
                key={pillar.title}
                {...scaleEntranceDelay(0.35 + i * 0.05)}
                className="flex flex-col items-center p-5 rounded-[22px] glass border border-primary/15 text-center"
              >
                <div className="text-3xl mb-2">{pillar.icon}</div>
                <h4 className="font-heading font-extrabold text-[13px] text-primary tracking-wide">{pillar.title}</h4>
                <p className="text-[11px] text-muted-foreground mt-1">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </PosterSection>
      </div>
    </div>
  );
}