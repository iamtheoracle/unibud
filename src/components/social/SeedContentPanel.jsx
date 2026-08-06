import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Trash2, BarChart3, Archive, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { seedFeed, clearSeedContent, getSeedStatus, archiveSeedContent } from "@/lib/social/seedContent";

const EASE = [0.16, 1, 0.3, 1];

const PHASE_INFO = {
  empty: { label: "No Content", desc: "Feed has no seed content yet", color: "text-muted-foreground" },
  seeded: { label: "Launch Content Active", desc: "Seed content is live and visible to students", color: "text-primary" },
  growing: { label: "Community Growing", desc: "Real student posts are appearing alongside seed content", color: "text-success" },
  transitioning: { label: "Transitioning", desc: "Orbit is gradually replacing seed content with real posts", color: "text-warning" },
  replaced: { label: "Community Active", desc: "Seed content has been archived — feed is now fully organic", color: "text-success" },
};

export default function SeedContentPanel() {
  const qc = useQueryClient();
  const [actionLoading, setActionLoading] = useState(null);
  const [result, setResult] = useState(null);

  const { data: status, isLoading } = useQuery({
    queryKey: ["seed-content-status"],
    queryFn: getSeedStatus,
    staleTime: 30000,
  });

  async function handleAction(action, fn) {
    setActionLoading(action);
    setResult(null);
    try {
      const res = await fn();
      setResult({ type: "success", data: res });
      qc.invalidateQueries({ queryKey: ["seed-content-status"] });
      qc.invalidateQueries({ queryKey: ["quadFeed"] });
      qc.invalidateQueries({ queryKey: ["home-feed-posts"] });
    } catch (err) {
      setResult({ type: "error", message: err.response?.data?.error || err.message });
    } finally {
      setActionLoading(null);
    }
  }

  const phase = status?.phase || "empty";
  const phaseInfo = PHASE_INFO[phase] || PHASE_INFO.empty;

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" strokeWidth={2.2} />
          <span className="text-[13px] font-semibold text-foreground">Feed Content Status</span>
        </div>

        {isLoading ? (
          <div className="h-20 rounded-lg shimmer" />
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[15px] font-bold ${phaseInfo.color}`}>{phaseInfo.label}</span>
            </div>
            <p className="text-[13px] text-muted-foreground mb-4">{phaseInfo.desc}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/40 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Seed Posts</p>
                <p className="text-[20px] font-bold text-foreground tabular-nums">{status?.seedPosts || 0}</p>
              </div>
              <div className="bg-secondary/40 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Real Posts</p>
                <p className="text-[20px] font-bold text-foreground tabular-nums">{status?.realPosts || 0}</p>
              </div>
            </div>

            {/* Progress bar showing seed vs real ratio */}
            {(status?.seedPosts > 0 || status?.realPosts > 0) && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-muted-foreground">Content Mix</span>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {status?.realPosts > 0 ? Math.round((status.realPosts / (status.seedPosts + status.realPosts)) * 100) : 0}% real
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted/40 overflow-hidden flex">
                  <div
                    className="h-full bg-muted-foreground/40 transition-all duration-700"
                    style={{ width: `${status?.seedPosts > 0 ? (status.seedPosts / (status.seedPosts + (status.realPosts || 0))) * 100 : 0}%` }}
                  />
                  <div
                    className="h-full bg-primary transition-all duration-700"
                    style={{ width: `${status?.realPosts > 0 ? (status.realPosts / (status.seedPosts + status.realPosts)) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Result message */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className={`rounded-xl p-4 border ${
            result.type === "success"
              ? "bg-success/10 border-success/20"
              : "bg-destructive/10 border-destructive/20"
          }`}
        >
          <div className="flex items-start gap-2">
            {result.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              {result.type === "success" ? (
                <div className="space-y-1">
                  {result.data.posts !== undefined && (
                    <p className="text-[13px] text-foreground">
                      Created {result.data.posts} posts, {result.data.comments} comments, {result.data.opportunities} opportunities, {result.data.scholarships} scholarships.
                    </p>
                  )}
                  {result.data.deletedPosts !== undefined && (
                    <p className="text-[13px] text-foreground">
                      Removed {result.data.deletedPosts} seed posts and {result.data.deletedComments} comments.
                    </p>
                  )}
                  {result.data.archived !== undefined && (
                    <p className="text-[13px] text-foreground">
                      Archived {result.data.archived} seed posts. {result.data.remaining} remaining.
                    </p>
                  )}
                  {result.data.message && (
                    <p className="text-[13px] text-muted-foreground">{result.data.message}</p>
                  )}
                </div>
              ) : (
                <p className="text-[13px] text-destructive">{result.message}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Seed */}
        <button
          onClick={() => handleAction("seed", seedFeed)}
          disabled={!!actionLoading || phase !== "empty"}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-[14px] disabled:opacity-40 spring-tap"
        >
          {actionLoading === "seed" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          Populate Launch Content
        </button>
        {phase !== "empty" && (
          <p className="text-[11px] text-muted-foreground px-1">
            Launch content is already active. Clear it first to re-seed.
          </p>
        )}

        {/* Archive (Orbit-managed replacement) */}
        <button
          onClick={() => handleAction("archive", archiveSeedContent)}
          disabled={!!actionLoading || phase === "empty" || (status?.realPosts || 0) < 30}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-secondary text-foreground font-medium text-[14px] border border-border disabled:opacity-40 spring-tap"
        >
          {actionLoading === "archive" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Archive className="w-5 h-5 text-warning" />
          )}
          Archive Oldest Seed Content
        </button>
        {(status?.realPosts || 0) < 30 && phase !== "empty" && (
          <p className="text-[11px] text-muted-foreground px-1">
            Orbit will enable this once {30 - (status?.realPosts || 0)} more real posts are created.
          </p>
        )}

        {/* Clear */}
        <button
          onClick={() => handleAction("clear", clearSeedContent)}
          disabled={!!actionLoading || phase === "empty"}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-transparent text-destructive font-medium text-[14px] border border-destructive/20 disabled:opacity-40 spring-tap"
        >
          {actionLoading === "clear" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
          Remove All Seed Content
        </button>
      </div>

      {/* Info note */}
      <div className="bg-secondary/30 rounded-xl p-4 border border-border">
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">About Launch Content:</span> Seed content is
          marked with <code className="text-[11px] bg-muted/40 px-1 py-0.5 rounded">is_seed_content</code> and
          tagged with a batch identifier. Orbit gradually archives the oldest seed posts as real student
          activity grows, ensuring a natural transition from curated launch content to an organic community feed.
          All seed posts are clearly identifiable and can be bulk-removed at any time.
        </p>
      </div>
    </div>
  );
}