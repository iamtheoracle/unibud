import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Heart, Brain, Home, Clock, Users, BookOpen,
  AlertCircle, Send, Lock, CheckCircle2,
  Loader2, ChevronRight, Phone, LifeBuoy, Sparkles,
} from "lucide-react";

const CATEGORIES = [
  { key: "academic_stress", label: "Academic Stress", icon: BookOpen, color: "text-info", bg: "bg-info/10" },
  { key: "homesickness", label: "Homesickness", icon: Home, color: "text-warning", bg: "bg-warning/10" },
  { key: "loneliness", label: "Loneliness", icon: Users, color: "text-purple", bg: "bg-purple/10" },
  { key: "exam_anxiety", label: "Exam Anxiety", icon: Brain, color: "text-error", bg: "bg-error/10" },
  { key: "burnout", label: "Burnout", icon: AlertCircle, color: "text-error", bg: "bg-error/10" },
  { key: "motivation", label: "Motivation", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  { key: "time_management", label: "Time Management", icon: Clock, color: "text-info", bg: "bg-info/10" },
  { key: "financial_concerns", label: "Financial", icon: Heart, color: "text-success", bg: "bg-success/10" },
  { key: "relationship_challenges", label: "Relationships", icon: Heart, color: "text-warning", bg: "bg-warning/10" },
  { key: "general", label: "General Support", icon: LifeBuoy, color: "text-muted-foreground", bg: "bg-muted" },
];

const ENCOURAGEMENTS = [
  "You're not alone. Whatever you're feeling is valid.",
  "It's okay to ask for help. That takes courage.",
  "One step at a time. You've got this.",
  "Your wellbeing matters more than any grade.",
];

export default function StudentSupport() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: tickets } = useQuery({
    queryKey: ["supportTickets"],
    queryFn: () => base44.entities.SupportTicket.filter({ is_anonymous: false }),
  });

  const myTickets = tickets?.filter(t => t.student_id === user?.id) || [];

  const handleSubmit = async () => {
    if (!selectedCategory || !subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.SupportTicket.create({
        subject: subject.trim(),
        category: selectedCategory,
        status: "open",
        priority: "medium",
        student_name: isAnonymous ? "Anonymous" : user?.full_name,
        student_id: isAnonymous ? null : user?.id,
        is_anonymous: isAnonymous,
        messages: [{
          sender: isAnonymous ? "Anonymous" : user?.full_name,
          text: message.trim(),
          timestamp: new Date().toISOString(),
        }],
      });
      setSubmitted(true);
      setSubject("");
      setMessage("");
      setSelectedCategory(null);
      qc.invalidateQueries({ queryKey: ["supportTickets"] });
    } catch (err) {}
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Student Support</h1>
          <p className="text-[12px] text-muted-foreground">You're not alone. We're here.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow">
          <Heart className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Encouragement banner */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] p-4 premium-shadow border border-primary/20"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--card)))" }}
        >
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-foreground font-medium leading-relaxed">
              {ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Wellbeing quick link */}
      <div className="px-4 mb-5">
        <button
          onClick={() => navigate("/wellbeing")}
          className="w-full flex items-center gap-3 p-3.5 rounded-[16px] bg-card border border-border/40 spring-tap hover:bg-muted/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-heading font-semibold text-[13px] text-foreground">Private Wellbeing Space</p>
            <p className="text-[11px] text-muted-foreground">Track your mood, write a journal, talk to Bud privately</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="px-4"
          >
            <div className="bg-card rounded-[24px] p-6 soft-shadow border border-border/40 text-center">
              <div className="w-16 h-16 rounded-[24px] bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-heading font-bold text-[16px] text-foreground mb-1">Your message has been received</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed mb-5">
                A support team member will respond soon. Remember, reaching out is a sign of strength.
              </p>
              <button onClick={() => setSubmitted(false)}
                className="w-full h-[44px] rounded-[16px] bg-primary text-primary-foreground font-semibold text-[13px] spring-tap">
                Submit Another Message
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Category selection */}
            <div className="px-4 mb-5">
              <h3 className="font-heading font-bold text-[15px] text-foreground mb-3 px-1">How can we help?</h3>
              <div className="grid grid-cols-3 gap-2.5">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.key}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-[16px] border transition-all ${
                      selectedCategory === cat.key
                        ? "border-primary bg-primary/5 soft-shadow"
                        : "border-border/40 bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-[12px] ${cat.bg} flex items-center justify-center`}>
                      <cat.icon className={`w-4 h-4 ${cat.color}`} strokeWidth={2.2} />
                    </div>
                    <span className="text-[10px] font-medium text-foreground text-center leading-tight">{cat.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Form */}
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 mb-5"
              >
                <div className="bg-card rounded-[24px] p-4 soft-shadow border border-border/40 space-y-3">
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary of what's on your mind"
                      className="w-full px-3.5 h-[44px] rounded-[14px] bg-muted/50 border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share as much or as little as you'd like..."
                      rows={4}
                      className="w-full px-3.5 py-3 rounded-[14px] bg-muted/50 border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  {/* Anonymous toggle */}
                  <button
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className="flex items-center gap-2.5 w-full"
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isAnonymous ? "bg-primary border-primary" : "border-border"}`}>
                      {isAnonymous && <Lock className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="text-[12px] text-muted-foreground">Submit anonymously</span>
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={!subject.trim() || !message.trim() || submitting}
                    className="w-full h-[48px] rounded-[16px] bg-primary text-primary-foreground font-heading font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 spring-tap"
                  >
                    {submitting ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* My conversations */}
            {myTickets.length > 0 && (
              <div className="px-4 mb-5">
                <h3 className="font-heading font-bold text-[15px] text-foreground mb-3 px-1">My Conversations</h3>
                <div className="space-y-2.5">
                  {myTickets.map((ticket, i) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 card-hover"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="font-semibold text-[13px] text-foreground flex-1">{ticket.subject}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          ticket.status === "resolved" ? "bg-success/10 text-success" :
                          ticket.status === "in_progress" ? "bg-info/10 text-info" :
                          "bg-warning/10 text-warning"
                        }`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{ticket.category.replace(/_/g, " ")}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Counselling resources */}
            <div className="px-4">
              <div className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <h3 className="font-heading font-bold text-[14px] text-foreground">Professional Help</h3>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">
                  If you're experiencing a crisis or need immediate support, please reach out to your university's counselling centre or a professional helpline.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30">
                    <LifeBuoy className="w-4 h-4 text-info flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold text-foreground">University Counselling Centre</p>
                      <p className="text-[10px] text-muted-foreground">Available Monday–Friday, 8am–5pm</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}