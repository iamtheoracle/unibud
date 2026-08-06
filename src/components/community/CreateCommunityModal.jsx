import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

const TYPES = ["Department", "Club", "Interest", "Study Group", "Course", "General"];
const CATEGORIES = ["Arts", "Sports", "Tech", "Academic", "Social", "Professional", "Health", "Other"];
const PRIVACY_OPTIONS = ["Public", "Members Only"];
const EMOJIS = ["📚", "🎓", "⚽", "🎭", "💻", "🔬", "🎵", "✈️", "🏋️", "🎮", "🍕", "🌍"];

const getInitialForm = () => ({
  name: "",
  description: "",
  type: TYPES[0],
  category: CATEGORIES[0],
  privacy: PRIVACY_OPTIONS[0],
  icon: EMOJIS[0],
});

export default function CreateCommunityModal({ open, onClose, user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(getInitialForm);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setLoading(false);
      setForm(getInitialForm());
    }
  }, [open]);

  const canProceed = useMemo(() => (
    form.name.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.name.trim().length <= 60 &&
    form.description.trim().length <= 280
  ), [form.description, form.name]);

  const handleCreate = async () => {
    if (!canProceed || !user?.id || loading) return;
    setLoading(true);
    try {
      const newHub = await base44.entities.Hub.create({
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
        category: form.category,
        privacy: form.privacy,
        icon: form.icon,
        created_by_id: user.id,
        university: user.university,
        member_count: 1,
      });
      toast({ title: "Community created", description: `${form.name.trim()} is ready.` });
      onClose?.();
      navigate(`/community/${newHub.id}`);
    } catch (error) {
      toast({
        title: "Could not create community",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onClose?.()}
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed inset-x-0 bottom-0 z-[100] max-h-[88vh] overflow-y-auto rounded-t-[28px] border-t border-border/30 bg-card px-5 pb-8 pt-3 elevated-shadow"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Step {step} of 2</span>
                </div>
                <h3 className="font-heading text-[20px] font-bold text-foreground">
                  {step === 1 ? "Create Community" : "Customize Community"}
                </h3>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {step === 1 ? "Set the basics for your new community." : "Choose how your community should feel."}
                </p>
              </div>
              <button
                onClick={() => !loading && onClose?.()}
                className="flex h-9 w-9 items-center justify-center rounded-full glass spring-tap disabled:opacity-50"
                disabled={loading}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {step === 1 ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-foreground">Community name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value.slice(0, 60) }))}
                    placeholder="e.g. Robotics Society"
                    className="w-full rounded-[18px] border border-border/40 bg-background px-4 py-3 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-right text-[11px] text-muted-foreground">{form.name.length}/60</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-foreground">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value.slice(0, 280) }))}
                    placeholder="What is this community about?"
                    rows={4}
                    className="w-full rounded-[18px] border border-border/40 bg-background px-4 py-3 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-right text-[11px] text-muted-foreground">{form.description.length}/280</p>
                </div>

                <div className="space-y-2.5">
                  <p className="text-[12px] font-semibold text-foreground">Type</p>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setForm((s) => ({ ...s, type }))}
                        className={
                          "rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all spring-tap " +
                          (form.type === type
                            ? "bg-foreground text-background soft-shadow"
                            : "border border-border/40 bg-card text-muted-foreground")
                        }
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!canProceed) {
                      toast({ title: "Complete the required fields" });
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-primary-foreground soft-shadow disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <p className="text-[12px] font-semibold text-foreground">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => setForm((s) => ({ ...s, category }))}
                        className={
                          "rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all spring-tap " +
                          (form.category === category
                            ? "bg-foreground text-background soft-shadow"
                            : "border border-border/40 bg-card text-muted-foreground")
                        }
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="text-[12px] font-semibold text-foreground">Privacy</p>
                  <div className="flex gap-2">
                    {PRIVACY_OPTIONS.map((privacy) => (
                      <button
                        key={privacy}
                        onClick={() => setForm((s) => ({ ...s, privacy }))}
                        className={
                          "rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all spring-tap " +
                          (form.privacy === privacy
                            ? "bg-foreground text-background soft-shadow"
                            : "border border-border/40 bg-card text-muted-foreground")
                        }
                      >
                        {privacy}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="text-[12px] font-semibold text-foreground">Pick an icon</p>
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setForm((s) => ({ ...s, icon: emoji }))}
                        className={
                          "flex h-12 items-center justify-center rounded-[16px] border text-[22px] transition-all spring-tap " +
                          (form.icon === emoji
                            ? "border-primary bg-primary/10"
                            : "border-border/40 bg-card")
                        }
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-[18px] border border-border/40 bg-card px-4 py-3 text-[14px] font-semibold text-foreground"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading || !canProceed}
                    className="flex-1 rounded-[18px] bg-primary px-4 py-3 text-[14px] font-semibold text-primary-foreground soft-shadow disabled:opacity-50"
                  >
                    {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating...</span> : "Create"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
