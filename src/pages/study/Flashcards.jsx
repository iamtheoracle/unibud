import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import Sheet from "@/components/academics/Sheet";
import EmptyState from "@/components/academics/EmptyState";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const today = () => new Date().toISOString().split("T")[0];

function sm2(card, quality) {
  let ease = card.ease_factor || 2.5, interval = card.interval_days || 0;
  if (quality === 0) { interval = 1; ease = Math.max(1.3, ease - 0.2); }
  else if (quality === 1) { interval = Math.max(1, Math.round(interval * 1.2) || 1); ease = Math.max(1.3, ease - 0.15); }
  else if (quality === 2) { interval = Math.round((interval || 1) * ease); }
  else { interval = Math.round((interval || 1) * ease * 1.3); ease = Math.max(1.3, ease + 0.15); }
  const due = new Date(); due.setDate(due.getDate() + interval);
  return { ease_factor: ease, interval_days: interval, due_date: due.toISOString().split("T")[0], last_reviewed: new Date().toISOString(), review_count: (card.review_count || 0) + 1 };
}

export default function Flashcards() {
  const qc = useQueryClient();
  const { data: cards } = useQuery({ queryKey: ["flashcards"], queryFn: () => base44.entities.Flashcard.list("-due_date", 300) });
  const [reviewing, setReviewing] = useState(false);
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ front: "", back: "", deck: "General", difficulty: "medium" });
  const [gen, setGen] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  const decks = useMemo(() => { const m = {}; (cards || []).forEach((c) => { m[c.deck || "General"] = (m[c.deck || "General"] || 0) + 1; }); return Object.entries(m); }, [cards]);
  const dueCount = (cards || []).filter((c) => !c.due_date || c.due_date <= today()).length;

  const update = useMutation({ mutationFn: ({ id, v }) => base44.entities.Flashcard.update(id, v), onSuccess: () => qc.invalidateQueries({ queryKey: ["flashcards"] }) });
  const del = useMutation({ mutationFn: (id) => base44.entities.Flashcard.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["flashcards"] }) });
  const create = useMutation({ mutationFn: (v) => base44.entities.Flashcard.create(v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["flashcards"] }); toast({ title: "Flashcard added" }); setAdding(false); } });

  const startReview = () => { const q = (cards || []).filter((c) => !c.due_date || c.due_date <= today()); if (!q.length) { toast({ title: "No cards due" }); return; } setQueue(q); setIdx(0); setFlipped(false); setReviewing(true); };
  const rate = (quality) => { const c = queue[idx]; update.mutate({ id: c.id, v: sm2(c, quality) }); if (idx + 1 < queue.length) { setIdx(idx + 1); setFlipped(false); } else { setReviewing(false); toast({ title: "Review complete" }); } };

  const generate = async () => {
    if (!gen.trim()) { toast({ title: "Enter a topic" }); return; }
    setGenLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: `Generate 10 study flashcards on: ${gen}. Each card has a front (question) and back (answer).`, response_json_schema: { type: "object", properties: { cards: { type: "array", items: { type: "object", properties: { front: { type: "string" }, back: { type: "string" } } } } } } });
      const list = res?.cards || [];
      if (list.length) { await base44.entities.Flashcard.bulkCreate(list.map((f) => ({ front: f.front, back: f.back, deck: gen.trim(), difficulty: "medium" }))); qc.invalidateQueries({ queryKey: ["flashcards"] }); toast({ title: `Generated ${list.length} flashcards` }); }
      else toast({ title: "No cards generated" });
    } catch { toast({ title: "Generation failed" }); }
    finally { setGenLoading(false); }
  };

  const card = queue[idx];

  if (reviewing && card) {
    return (
      <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
        <PageHeader title="Review" action={<button onClick={() => setReviewing(false)} className="text-[12px] font-semibold text-muted-foreground spring-tap">Exit</button>} />
        <p className="text-[11px] text-muted-foreground mb-3 text-center">Card {idx + 1} of {queue.length}</p>
        <AnimatePresence mode="wait">
          <motion.div key={card.id} initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: -90 }} transition={{ duration: 0.3 }} onClick={() => setFlipped(!flipped)} className="glass-card p-8 min-h-[260px] flex flex-col items-center justify-center text-center cursor-pointer">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">{flipped ? "Back" : "Front"}</p>
            <p className="text-[16px] font-heading font-semibold text-foreground leading-relaxed">{flipped ? card.back : card.front}</p>
            {!flipped && <p className="text-[11px] text-muted-foreground mt-6">Tap to flip</p>}
          </motion.div>
        </AnimatePresence>
        {flipped && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[["Again", 0], ["Hard", 1], ["Good", 2], ["Easy", 3]].map(([l, q]) => <button key={l} onClick={() => rate(q)} className="py-3 rounded-2xl glass font-semibold text-[12px] text-foreground spring-tap">{l}</button>)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Flashcards" action={<button onClick={() => setAdding(true)} className="text-[12px] font-semibold text-primary spring-tap">+ Add</button>} />
      <div className="glass-card p-4 mb-4 border border-primary/15 bg-primary/8 flex items-center justify-between">
        <div><p className="text-[14px] font-heading font-semibold text-foreground">{dueCount} due</p><p className="text-[11px] text-muted-foreground">{(cards || []).length} cards total</p></div>
        <button onClick={startReview} className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-[13px] spring-tap ice-glow">Start review</button>
      </div>
      <div className="glass-card p-4 mb-4">
        <p className="text-[12px] font-semibold text-muted-foreground mb-2">Generate with Bud</p>
        <div className="flex gap-2">
          <input value={gen} onChange={(e) => setGen(e.target.value)} placeholder="Topic e.g. Cell biology" className="flex-1 h-[44px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" />
          <button onClick={generate} disabled={genLoading} className="px-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-[13px] spring-tap disabled:opacity-50">{genLoading ? "…" : "Generate"}</button>
        </div>
      </div>
      <p className="text-[13px] font-bold text-foreground px-1 mb-2">Decks</p>
      {!decks.length ? <EmptyState message="No flashcards yet. Add one or generate a deck with Bud." /> : (
        <div className="space-y-3">
          {decks.map(([name, count]) => (
            <div key={name} className="glass-card p-4 flex items-center justify-between">
              <div><p className="text-[14px] font-semibold text-foreground">{name}</p><p className="text-[11px] text-muted-foreground">{count} card{count !== 1 ? "s" : ""}</p></div>
            </div>
          ))}
        </div>
      )}
      <Sheet open={adding} onClose={() => setAdding(false)} title="New Flashcard">
        <div className="space-y-3.5">
          <GlassInput label="Front (question)" value={form.front} onChange={(e) => setForm({ ...form, front: e.target.value })} />
          <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Back (answer)</label><textarea value={form.back} onChange={(e) => setForm({ ...form, back: e.target.value })} rows={3} className="mt-1.5 w-full p-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/60" /></div>
          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Deck" value={form.deck} onChange={(e) => setForm({ ...form, deck: e.target.value })} />
            <div><label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Difficulty</label><select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60">{["easy", "medium", "hard"].map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}</select></div>
          </div>
        </div>
        <button onClick={() => { if (!form.front || !form.back) { toast({ title: "Front and back required" }); return; } create.mutate({ ...form, due_date: today() }); }} disabled={create.isPending} className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center spring-tap disabled:opacity-50 ice-glow">{create.isPending ? "Saving…" : "Save Card"}</button>
      </Sheet>
    </div>
  );
}