import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Trophy, Building2, Landmark, Store, Sparkles, Hash, Bookmark, Loader2 } from "lucide-react";
import { useFollow } from "@/lib/discovery/useFollow";

const TYPE_META = {
  person: { label: "People", icon: User, color: "217 91% 60%" },
  club: { label: "Clubs", icon: Trophy, color: "262 83% 58%" },
  department: { label: "Departments", icon: Building2, color: "142 71% 45%" },
  university: { label: "Universities", icon: Landmark, color: "262 83% 58%" },
  business: { label: "Businesses", icon: Store, color: "38 92% 50%" },
  interest: { label: "Interests", icon: Sparkles, color: "142 71% 45%" },
  topic: { label: "Topics", icon: Hash, color: "217 91% 60%" },
};

export default function Following() {
  const { follows, toggle, loading } = useFollow();

  const grouped = useMemo(() => {
    const m = {};
    follows.forEach((f) => { (m[f.target_type] ||= []).push(f); });
    return m;
  }, [follows]);

  const types = Object.keys(grouped);

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <header className="mb-5">
        <h1 className="font-heading font-extrabold text-[28px] text-foreground tracking-tight">Following</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Everything you follow — people, clubs, interests & more.</p>
      </header>

      {follows.length === 0 ? (
        <div className="rounded-[24px] p-8 glass-card text-center">
          <div className="w-14 h-14 rounded-[18px] bg-primary/8 flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-7 h-7 text-primary" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">Nothing followed yet</p>
          <p className="text-[12px] text-muted-foreground mt-1 mb-4">
            Follow people, clubs, departments, universities, businesses, interests and topics to personalize your feeds.
          </p>
          <Link to="/discover" className="inline-block px-4 py-2.5 rounded-[16px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">
            Explore Discover
          </Link>
        </div>
      ) : (
        types.map((t) => {
          const meta = TYPE_META[t] || TYPE_META.interest;
          const Icon = meta.icon;
          const items = grouped[t];
          return (
            <motion.section
              key={t}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-[9px] flex items-center justify-center" style={{ background: `hsl(${meta.color} / 0.14)` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: `hsl(${meta.color})` }} />
                </div>
                <h2 className="text-[13px] font-semibold text-foreground">{meta.label}</h2>
                <span className="text-[11px] text-muted-foreground">{items.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {items.map((f) => (
                  <div key={f.id} className="rounded-[20px] p-4 glass-card spring-tap">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-foreground truncate">{f.target_name}</p>
                        {f.target_meta?.subtitle && (
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{f.target_meta.subtitle}</p>
                        )}
                      </div>
                      <button
                        onClick={() => toggle({ type: f.target_type, id: f.target_id, name: f.target_name, meta: f.target_meta })}
                        disabled={loading}
                        className="text-[11px] font-semibold text-primary px-2.5 py-1 rounded-full bg-primary/8 spring-tap disabled:opacity-50"
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          );
        })
      )}
    </div>
  );
}