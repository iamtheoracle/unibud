import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

function authorOf(p) {
  return p.author_name || p.created_by_name || (p.created_by ? "Someone" : "Student");
}

/**
 * CommunityPulse — weekend / high-activity surface that Bud lifts when the
 * campus is buzzing.
 */
export default function CommunityPulse({ posts = [], recent = 0 }) {
  const navigate = useNavigate();
  const top = (posts || []).slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-accent" />
          </div>
          <h2 className="font-heading font-bold text-[14px] text-foreground">The Quad</h2>
        </div>
        <span className="text-[11px] text-muted-foreground">{recent} active today</span>
      </div>
      {top.length ? (
        <div className="space-y-2.5">
          {top.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate("/quad")}
              className="w-full text-left spring-tap"
            >
              <p className="text-[12px] text-foreground/90 line-clamp-2 leading-relaxed">
                <span className="font-semibold">{authorOf(p)}</span> · {(p.content || p.body || p.caption || "").slice(0, 90)}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-muted-foreground">Your campus feed is quiet right now.</p>
      )}
      <button
        onClick={() => navigate("/quad")}
        className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-primary/10 text-primary text-[12px] font-semibold spring-tap"
      >
        Open the Quad <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}