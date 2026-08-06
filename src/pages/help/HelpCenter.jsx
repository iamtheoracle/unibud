import React from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, LifeBuoy, MessageSquare, ArrowLeft, ThumbsUp, ThumbsDown, Plus, Star, Send, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const CREAM_SUBTLE = "rgba(247, 240, 232, 0.15)";
const ORANGE = "#FF8A2A";
const EASE = [0.16, 1, 0.3, 1];

const TABS = [
  { key: "kb", label: "Knowledge Base", icon: BookOpen },
  { key: "tickets", label: "Support", icon: LifeBuoy },
  { key: "feedback", label: "Feedback", icon: MessageSquare },
];

export default function HelpCenter() {
  const [tab, setTab] = React.useState("kb");

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-8 pb-40 safe-area-pt">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/home" className="w-10 h-10 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: CREAM }} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: CREAM }}>Help Center</h1>
          <p className="text-[13px]" style={{ color: CREAM_MUTED }}>Guides, support & feedback</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 h-[56px] rounded-[14px] spring-tap"
              style={{
                background: active ? "rgba(255,138,42,0.15)" : "rgba(44,33,26,0.4)",
                border: active ? "1px solid rgba(255,138,42,0.3)" : "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Icon className="w-[17px] h-[17px]" strokeWidth={2} style={{ color: active ? ORANGE : CREAM_MUTED }} />
              <span className="text-[11px] font-semibold" style={{ color: active ? ORANGE : CREAM_MUTED }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
        {tab === "kb" && <KnowledgeBase />}
        {tab === "tickets" && <SupportTickets />}
        {tab === "feedback" && <FeedbackCenter />}
      </motion.div>
    </div>
  );
}

/* ── Knowledge Base ── */
function KnowledgeBase() {
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: articles, isLoading } = useQuery({
    queryKey: ["help-articles", query],
    queryFn: () => base44.entities.HelpArticle.filter(query ? { title: { $regex: query, $options: "i" } } : {}, "sort_order", 50),
    staleTime: 60000,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ article, helpful }) => {
      const field = helpful ? "helpful_count" : "not_helpful_count";
      return base44.entities.HelpArticle.update(article.id, { [field]: (article[field] || 0) + 1 });
    },
    onSuccess: () => { qc.invalidateQueries(["help-articles"]); toast({ title: "Thanks for your feedback!" }); },
  });

  if (selected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 mb-4 text-[13px] spring-tap" style={{ color: ORANGE }}>
          <ArrowLeft className="w-4 h-4" /> Back to articles
        </button>
        <h2 className="text-[20px] font-bold mb-3" style={{ color: CREAM }}>{selected.title}</h2>
        <div className="prose prose-invert max-w-none text-[14px] leading-relaxed mb-6" style={{ color: CREAM_MUTED }}>
          <ReactMarkdown>{selected.content}</ReactMarkdown>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <span className="text-[13px]" style={{ color: CREAM_MUTED }}>Was this helpful?</span>
          <div className="flex gap-2">
            <button onClick={() => voteMutation.mutate({ article: selected, helpful: true })} className="w-9 h-9 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(34,197,94,0.12)" }}><ThumbsUp className="w-4 h-4" style={{ color: "#22C55E" }} /></button>
            <button onClick={() => voteMutation.mutate({ article: selected, helpful: false })} className="w-9 h-9 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(239,68,68,0.12)" }}><ThumbsDown className="w-4 h-4" style={{ color: "#EF4444" }} /></button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 h-[48px] px-4 rounded-[16px] mb-4" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <Search className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} style={{ color: CREAM_MUTED }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles…" className="flex-1 bg-transparent outline-none text-[14px]" style={{ color: CREAM }} />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">{[...Array(5)].map((_, i) => <div key={i} className="glass-card p-4 h-16 shimmer" />)}</div>
      ) : !articles?.length ? (
        <div className="flex flex-col items-center py-16"><BookOpen className="w-8 h-8 mb-3" style={{ color: CREAM_MUTED }} /><p className="text-[14px]" style={{ color: CREAM_MUTED }}>No articles found</p></div>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map((a, i) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, ease: EASE }}
              onClick={() => setSelected(a)}
              className="glass-card p-4 flex items-center gap-3 text-left spring-tap"
            >
              <div className="w-10 h-10 rounded-full grid place-items-center shrink-0" style={{ background: "rgba(255,138,42,0.12)" }}><BookOpen className="w-4 h-4" style={{ color: ORANGE }} /></div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold truncate" style={{ color: CREAM }}>{a.title}</p>
                <p className="text-[12px] capitalize truncate" style={{ color: CREAM_MUTED }}>{a.category.replace(/_/g, " ")}</p>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: CREAM_MUTED }} />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Support Tickets ── */
const TICKET_CATEGORIES = [
  { value: "technical", label: "Technical Issue" },
  { value: "academic_stress", label: "Academic Stress" },
  { value: "exam_anxiety", label: "Exam Anxiety" },
  { value: "financial_concerns", label: "Financial" },
  { value: "general", label: "General" },
];

function SupportTickets() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ subject: "", category: "general", message: "" });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: () => base44.entities.SupportTicket.filter({}, "-created_date", 50),
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SupportTicket.create(data),
    onSuccess: () => {
      qc.invalidateQueries(["support-tickets"]);
      toast({ title: "Ticket submitted", description: "We'll get back to you soon." });
      setForm({ subject: "", category: "general", message: "" });
      setShowForm(false);
    },
    onError: (e) => toast({ title: "Failed to submit", description: e.message, variant: "destructive" }),
  });

  if (showForm) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
        <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-[13px] spring-tap" style={{ color: ORANGE }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="h-12 px-4 rounded-[14px] bg-transparent text-[14px] outline-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-12 px-4 rounded-[14px] text-[14px] outline-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }}>
          {TICKET_CATEGORIES.map((c) => <option key={c.value} value={c.value} style={{ color: "#000" }}>{c.label}</option>)}
        </select>
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe your issue…" rows={5} className="px-4 py-3 rounded-[14px] bg-transparent text-[14px] outline-none resize-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
        <button onClick={() => createMutation.mutate(form)} disabled={!form.subject || !form.message} className="h-12 rounded-[14px] font-semibold text-[14px] flex items-center justify-center gap-2 spring-tap disabled:opacity-40" style={{ background: ORANGE, color: "#1a1208" }}>
          <Send className="w-4 h-4" /> Submit Ticket
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <button onClick={() => setShowForm(true)} className="w-full h-12 rounded-[14px] flex items-center justify-center gap-2 font-semibold text-[14px] mb-4 spring-tap" style={{ background: ORANGE, color: "#1a1208" }}>
        <Plus className="w-4 h-4" /> New Ticket
      </button>

      {isLoading ? (
        <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <div key={i} className="glass-card p-4 h-16 shimmer" />)}</div>
      ) : !tickets?.length ? (
        <div className="flex flex-col items-center py-16"><LifeBuoy className="w-8 h-8 mb-3" style={{ color: CREAM_MUTED }} /><p className="text-[14px]" style={{ color: CREAM_MUTED }}>No tickets yet</p></div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, ease: EASE }} className="glass-card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-[14px] font-semibold flex-1" style={{ color: CREAM }}>{t.subject}</p>
                <StatusBadge status={t.status} />
              </div>
              <p className="text-[12px] capitalize" style={{ color: CREAM_MUTED }}>{t.category.replace(/_/g, " ")}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { open: "rgba(59,130,246,0.15)", in_progress: "rgba(245,158,11,0.15)", resolved: "rgba(34,197,94,0.15)", escalated: "rgba(239,68,68,0.15)" };
  const text = { open: "#3B82F6", in_progress: "#F59E0B", resolved: "#22C55E", escalated: "#EF4444" };
  return <span className="text-[10px] font-bold px-2 py-1 rounded-full capitalize shrink-0" style={{ background: colors[status] || colors.open, color: text[status] || text.open }}>{status.replace(/_/g, " ")}</span>;
}

/* ── Feedback ── */
const FEEDBACK_CATEGORIES = [
  { value: "feature_request", label: "Feature Request" },
  { value: "bug_report", label: "Bug Report" },
  { value: "suggestion", label: "Suggestion" },
  { value: "compliment", label: "Compliment" },
  { value: "general", label: "General" },
];

function FeedbackCenter() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = React.useState({ category: "general", subject: "", message: "", rating: 5 });

  const { data: feedback } = useQuery({
    queryKey: ["my-feedback"],
    queryFn: () => base44.entities.Feedback.filter({}, "-created_date", 20),
    staleTime: 30000,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.Feedback.create(data),
    onSuccess: () => {
      qc.invalidateQueries(["my-feedback"]);
      toast({ title: "Feedback sent", description: "Thank you for helping us improve!" });
      setForm({ category: "general", subject: "", message: "", rating: 5 });
    },
    onError: (e) => toast({ title: "Failed to send", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-5 flex flex-col gap-4">
        <div className="flex gap-2 flex-wrap">
          {FEEDBACK_CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => setForm({ ...form, category: c.value })} className="px-3 py-1.5 rounded-full text-[12px] font-medium spring-tap" style={{ background: form.category === c.value ? "rgba(255,138,42,0.2)" : "rgba(255,255,255,0.05)", color: form.category === c.value ? ORANGE : CREAM_MUTED, border: form.category === c.value ? "1px solid rgba(255,138,42,0.3)" : "1px solid transparent" }}>{c.label}</button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setForm({ ...form, rating: n })} className="spring-tap">
              <Star className="w-7 h-7" fill={n <= form.rating ? ORANGE : "none"} strokeWidth={1.5} style={{ color: n <= form.rating ? ORANGE : CREAM_MUTED }} />
            </button>
          ))}
        </div>

        <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject (optional)" className="h-11 px-4 rounded-[12px] bg-transparent text-[14px] outline-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us what you think…" rows={4} className="px-4 py-3 rounded-[12px] bg-transparent text-[14px] outline-none resize-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />

        <button onClick={() => submitMutation.mutate(form)} disabled={!form.message} className="h-12 rounded-[14px] font-semibold text-[14px] flex items-center justify-center gap-2 spring-tap disabled:opacity-40" style={{ background: ORANGE, color: "#1a1208" }}>
          <Send className="w-4 h-4" /> Send Feedback
        </button>
      </div>

      {feedback && feedback.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: CREAM_MUTED }}>Your Feedback</p>
          <div className="flex flex-col gap-3">
            {feedback.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, ease: EASE }} className="glass-card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-semibold capitalize" style={{ color: ORANGE }}>{f.category.replace(/_/g, " ")}</span>
                  <div className="flex gap-0.5">{[...Array(f.rating || 0)].map((_, n) => <Star key={n} className="w-3 h-3" fill={ORANGE} style={{ color: ORANGE }} />)}</div>
                </div>
                {f.subject && <p className="text-[13px] font-semibold mb-1" style={{ color: CREAM }}>{f.subject}</p>}
                <p className="text-[12px] line-clamp-2" style={{ color: CREAM_MUTED }}>{f.message}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}