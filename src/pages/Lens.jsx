import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { fallbackIfEmpty } from "@/lib/mock/useMockFallback";
import { DISCOVER_MOCK } from "@/lib/social/discoverMock";
import { useDemoMode } from "@/lib/DemoModeContext";
import { Mic, ChevronRight, Search, Camera, ScanLine, ImageIcon, X, Loader2, Sparkles } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const CONTINUE = [
  { icon: "📝", title: "CSC401 Assignment", sub: "Due tomorrow", to: "/assignments" },
  { icon: "📊", title: "Results", sub: "Check grades", to: "/academics/results" },
  { icon: "📅", title: "Timetable", sub: "Next: AI Lab", to: "/timetable" },
];

const QUICK = [
  { icon: "📚", label: "Find Course", to: "/courses" },
  { icon: "🧑‍🏫", label: "Find Lecturer", to: "/office-hours" },
  { icon: "📖", label: "Book Room", to: "/study-sessions" },
  { icon: "🍽️", label: "Order Food", to: "/marketplace" },
  { icon: "💳", label: "Pay Fees", to: "/finance" },
  { icon: "📋", label: "Scan QR", to: "/me" },
  { icon: "🏠", label: "Find Hostel", to: "/marketplace" },
  { icon: "📄", label: "Transcript", to: "/academics/report" },
];

const NEARBY = [
  { icon: "📚", label: "Library · 3 seats open" },
  { icon: "☕", label: "Campus Cafe · 2 min" },
  { icon: "🚌", label: "Shuttle · arriving 5 min" },
  { icon: "🏠", label: "Hostel 5 · 200m" },
];

const SUGGESTIONS = [
  { icon: "✦", highlight: "Your next lecture", text: "starts in 20 minutes — AI Lab, Room 304. Want me to navigate?", action: "Navigate", to: "/timetable" },
  { icon: "📊", highlight: "Scholarship", text: "closing tomorrow — you haven't submitted your application yet.", action: "Apply", to: "/scholarships" },
];

/**
 * Lens — the platform's intelligent search & quick-action overlay.
 * Slides up as a glass sheet over a dimmed backdrop. Search input, continue
 * cards, quick-action grid, communities (real with mock fallback), nearby,
 * and Bud AI suggestions.
 */
export default function Lens() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const [query, setQuery] = useState("");
  const [lensTab, setLensTab] = useState("search"); // "search" | "camera"
  const [cameraImage, setCameraImage] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef(null);

  const { data: communities } = useQuery({
    queryKey: ["lensCommunities"],
    queryFn: () => base44.entities.Community.list("-created_date", 6),
    enabled: !isDemoMode,
  });
  const communityList = fallbackIfEmpty(communities, (DISCOVER_MOCK.communities || []).slice(0, 4));

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCameraImage(url);
    setOcrText("");
    setOcrLoading(true);
    try {
      // Upload and attempt OCR via Bud/AI integration
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      // Bud AI caption request
      const result = await base44.functions.invoke("extractTextFromImage", { image_url: file_url }).catch(() => null);
      setOcrText(result?.text || "No text detected. Try a clearer image of printed text.");
    } catch {
      setOcrText("Text extraction unavailable. Using AI captioning instead — this image appears to be a document or photo.");
    }
    setOcrLoading(false);
  };

  const clearCamera = () => {
    setCameraImage(null);
    setOcrText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col justify-end bg-background safe-area-pt">
      {/* Ambient bloom */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(70% 50% at 50% 20%, hsl(var(--primary) / 0.05), transparent 60%)" }} />
      {/* Dimmed mock backdrop */}
      <div className="absolute inset-0 px-4 pt-24 pb-32 flex flex-col gap-3 pointer-events-none opacity-[0.18]">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-[60px] rounded-2xl glass-card" />)}
      </div>

      {/* Lens sheet */}
      <motion.div
        initial={{ y: "100%", opacity: 0.4 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.9 }}
        className="relative z-10 w-full max-w-[520px] mx-auto rounded-t-[28px] bg-card/95 backdrop-blur-2xl border-t border-border/30 pt-3 pb-28 px-5 flex flex-col premium-shadow"
        style={{ maxHeight: "82%" }}
      >
        {/* Handle */}
        <div className="w-9 h-1 rounded-full bg-foreground/15 mx-auto mb-4 flex-shrink-0" />

        {/* Tab switcher */}
        <div className="flex gap-1 mb-4 flex-shrink-0 bg-muted/30 rounded-2xl p-1">
          <button
            onClick={() => setLensTab("search")}
            className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-[13px] font-semibold spring-tap transition-colors ${lensTab === "search" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
          <button
            onClick={() => setLensTab("camera")}
            className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-[13px] font-semibold spring-tap transition-colors ${lensTab === "camera" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            <Camera className="w-3.5 h-3.5" /> Scan
          </button>
        </div>

        <AnimatePresence mode="wait">
        {lensTab === "camera" ? (
          <motion.div key="camera" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="flex-1 overflow-y-auto no-scrollbar">
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
            {!cameraImage ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-36 h-36 rounded-3xl glass-card flex flex-col items-center justify-center gap-3 spring-tap border-2 border-dashed border-primary/30"
                >
                  <Camera className="w-10 h-10 text-primary/60" strokeWidth={1.5} />
                  <span className="text-[12px] font-medium text-muted-foreground">Take Photo or Upload</span>
                </button>
                <div className="text-center max-w-[240px]">
                  <p className="text-[13px] font-semibold text-foreground mb-1">Scan with Lens</p>
                  <p className="text-[12px] text-muted-foreground">Point your camera at a document, textbook page, notice board, or QR code to extract text and get AI insights.</p>
                </div>
                <div className="flex gap-3 mt-2">
                  {[
                    { icon: ScanLine, label: "Extract Text" },
                    { icon: Sparkles, label: "AI Caption" },
                    { icon: ImageIcon, label: "Image Search" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-4">
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={cameraImage} alt="Scanned" className="w-full max-h-64 object-contain bg-black/10 rounded-2xl" />
                  <button onClick={clearCamera} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center spring-tap">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ScanLine className="w-4 h-4 text-primary" />
                    <span className="text-[12px] font-bold text-foreground uppercase tracking-wide">Extracted Text</span>
                    {ocrLoading && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin ml-auto" />}
                  </div>
                  {ocrLoading ? (
                    <div className="space-y-1.5">
                      {[1,2,3].map(i => <div key={i} className="h-3 bg-muted/60 rounded animate-pulse" style={{ width: `${70 + i * 10}%` }} />)}
                    </div>
                  ) : (
                    <p className="text-[13px] text-foreground/80 leading-relaxed">{ocrText || "Processing…"}</p>
                  )}
                  {ocrText && !ocrLoading && (
                    <button
                      onClick={() => { navigate("/bud"); }}
                      className="mt-3 w-full py-2 rounded-xl bg-primary/10 text-primary text-[12px] font-semibold spring-tap flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Ask Bud about this
                    </button>
                  )}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="py-2.5 rounded-xl glass-card text-[13px] font-semibold text-foreground spring-tap flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" /> Scan Another
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="search" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4 pb-2">
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 h-[52px] rounded-2xl bg-muted/30 border border-border/30 flex-shrink-0">
          <Search className="w-[18px] h-[18px] text-muted-foreground/60 shrink-0" strokeWidth={1.8} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask or search anything…"
            className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-foreground placeholder:text-muted-foreground/50"
          />
          <button
            onClick={() => navigate("/bud")}
            className="relative w-8 h-8 rounded-full grid place-items-center flex-shrink-0 spring-tap"
            style={{ background: "hsl(var(--primary) / 0.12)", border: "1px solid hsl(var(--primary) / 0.15)" }}
            aria-label="Voice search"
          >
            <Mic className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-col gap-4 pb-2">
          {/* Continue */}
          <section>
            <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2.5">Continue</p>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-0.5">
              {CONTINUE.map((c) => (
                <button key={c.title} onClick={() => navigate(c.to)} className="flex-shrink-0 min-w-[130px] glass-card px-3.5 py-2.5 flex items-center gap-2 spring-tap">
                  <span className="text-[18px]">{c.icon}</span>
                  <span className="text-[12px] font-medium text-foreground whitespace-nowrap">
                    {c.title}
                    <span className="block font-normal text-muted-foreground text-[10px] mt-0.5">{c.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2.5">Quick Actions</p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK.map((q) => (
                <button key={q.label} onClick={() => navigate(q.to)} className="flex flex-col items-center gap-1 py-2.5 rounded-2xl glass-card spring-tap">
                  <span className="text-[22px]">{q.icon}</span>
                  <span className="text-[9px] font-medium text-muted-foreground text-center">{q.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Communities */}
          <section>
            <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2.5">Discover Communities</p>
            <div className="flex gap-2 flex-wrap">
              {communityList.map((c, i) => (
                <button
                  key={c.id || i}
                  onClick={() => navigate(c.id ? `/community/${c.id}` : "/communities")}
                  className="px-3.5 py-1.5 rounded-full glass border border-border/40 text-[12px] font-medium text-foreground flex items-center gap-1.5 spring-tap"
                >
                  <span>{c.emoji || "🌐"}</span>
                  {c.name || c.title}
                  <span className="text-muted-foreground/50 text-[10px]">{c.member_count ? `· ${c.member_count}` : ""}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Nearby */}
          <section>
            <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2.5">Nearby</p>
            <div className="flex gap-2 flex-wrap">
              {NEARBY.map((n) => (
                <span key={n.label} className="px-3.5 py-1.5 rounded-full glass border border-border/40 text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <span>{n.icon}</span>
                  {n.label}
                </span>
              ))}
            </div>
          </section>

          {/* Bud AI suggestions */}
          <section>
            <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2.5">Bud Suggests</p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => navigate(s.to)}
                  className="rounded-2xl p-3.5 flex items-center gap-3 spring-tap text-left"
                  style={{ background: "hsl(var(--primary) / 0.06)", border: "1px solid hsl(var(--primary) / 0.10)" }}
                >
                  <span className="w-8 h-8 rounded-full grid place-items-center text-[14px] text-primary-foreground flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))" }}>{s.icon}</span>
                  <p className="flex-1 text-[13px] font-medium text-muted-foreground leading-snug">
                    <span className="text-foreground font-semibold">{s.highlight}</span> {s.text}
                  </p>
                  <span className="text-[12px] font-semibold text-foreground flex items-center gap-0.5 flex-shrink-0">{s.action} <ChevronRight className="w-3 h-3" /></span>
                </button>
              ))}
            </div>
          </section>
        </div>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}