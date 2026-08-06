import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Trash2, Database, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import {
  seedLaunchContent,
  removeAllSeedContent,
  removeSeedContent,
  getLaunchContent,
  getLaunchContentStatus,
} from "@/lib/authentic/launchContent";
import LaunchBadge from "@/components/authentic/LaunchBadge";

const EASE = [0.16, 1, 0.3, 1];

/**
 * DemoContentManager — admin page for managing official launch content.
 *
 * - View all launch/demo content
 * - See authentic content ratio (real vs launch)
 * - Seed initial launch content
 * - Remove all or individual launch content items
 *
 * Route: /demo-content (admin-only via OracleWorkspaceGuard)
 */
export default function DemoContentManager() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [stat, items] = await Promise.all([
        getLaunchContentStatus(),
        getLaunchContent(),
      ]);
      setStatus(stat);
      setContent(items || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSeed = async () => {
    setActionLoading(true);
    await seedLaunchContent();
    await loadData();
    setActionLoading(false);
  };

  const handleRemoveAll = async () => {
    setActionLoading(true);
    await removeAllSeedContent();
    setConfirmRemove(false);
    await loadData();
    setActionLoading(false);
  };

  const handleRemoveOne = async (postId) => {
    await removeSeedContent(postId);
    await loadData();
  };

  const authenticPct = status ? Math.round(status.authenticRatio * 100) : 0;

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">Launch Content</h1>
          <p className="text-[12px] text-muted-foreground">Manage official launch & demo content</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap"
        >
          <RefreshCw className={`w-4 h-4 text-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Authenticity Status */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="crystal-card p-5 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-foreground">Authentic Content Ratio</p>
            <p className="text-[12px] text-muted-foreground">
              {status?.isSelfSustaining
                ? "Platform is self-sustaining with real activity"
                : "Launch content is supporting the platform"}
            </p>
          </div>
          {status?.isSelfSustaining && (
            <CheckCircle2 className="w-5 h-5 text-success" />
          )}
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${authenticPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[12px]">
          <span className="text-muted-foreground">
            <span className="font-bold text-foreground">{status?.realCount || 0}</span> real posts
          </span>
          <span className="text-muted-foreground">
            <span className="font-bold text-foreground">{status?.launchCount || 0}</span> launch posts
          </span>
          <span className="font-bold text-primary">{authenticPct}% authentic</span>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-2.5 mb-6">
        {content.length === 0 && (
          <button
            onClick={handleSeed}
            disabled={actionLoading}
            className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Seed Launch Content
          </button>
        )}
        {content.length > 0 && !confirmRemove && (
          <button
            onClick={() => setConfirmRemove(true)}
            disabled={actionLoading}
            className="flex-1 h-11 rounded-2xl glass text-destructive font-heading font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap"
          >
            <Trash2 className="w-4 h-4" />
            Remove All Launch Content
          </button>
        )}
        {confirmRemove && (
          <>
            <button
              onClick={() => setConfirmRemove(false)}
              disabled={actionLoading}
              className="flex-1 h-11 rounded-2xl glass text-foreground font-heading font-semibold text-[13px] spring-tap"
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveAll}
              disabled={actionLoading}
              className="flex-1 h-11 rounded-2xl bg-destructive text-destructive-foreground font-heading font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap"
            >
              <AlertTriangle className="w-4 h-4" />
              Confirm Removal
            </button>
          </>
        )}
      </div>

      {/* Content List */}
      {content.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Official Launch Content ({content.length})
            </p>
            <LaunchBadge />
          </div>
          <div className="space-y-2">
            {content.map((post, i) => (
              <motion.div
                key={post.id || i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE, delay: i * 0.03 }}
                className="glass rounded-2xl p-3.5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[12px] font-semibold text-foreground truncate">{post.author_name}</p>
                      <LaunchBadge />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{post.author_handle}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveOne(post.id)}
                    className="w-7 h-7 rounded-full glass flex items-center justify-center spring-tap shrink-0"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
                <p className="text-[12px] text-foreground/90 leading-relaxed line-clamp-3">{post.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {content.length === 0 && !loading && (
        <div className="glass rounded-2xl p-8 text-center">
          <Database className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-[14px] font-medium text-foreground">No launch content</p>
          <p className="text-[12px] text-muted-foreground">Seed official content to populate the platform</p>
        </div>
      )}
    </div>
  );
}