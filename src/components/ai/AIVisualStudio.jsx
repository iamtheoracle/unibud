import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Image as ImageIcon, Download, X, RefreshCw, Wand2, Edit3, Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

const PRESETS = [
  { id: "illustration", label: "Illustration", prompt: "flat vector illustration, clean lines, educational style" },
  { id: "icon", label: "Icon Set", prompt: "minimalist icon set, consistent stroke width, monochrome" },
  { id: "concept", label: "Concept Art", prompt: "detailed concept artwork, atmospheric lighting" },
  { id: "mockup", label: "UI Mockup", prompt: "clean UI mockup, modern interface design, glass morphism" },
  { id: "poster", label: "Poster", prompt: "poster design, bold typography composition" },
  { id: "diagram", label: "Diagram", prompt: "clean infographic diagram, data visualization" },
];

/**
 * AIVisualStudio — AI visual creation workspace.
 *
 * Generates original images, illustrations, icons, concept art, mockups,
 * and UI concepts. Can also edit/redesign existing images.
 * Results are presented in-workspace for review and download.
 *
 * Powered by the GenerateImage integration. All AI-generated content
 * is clearly labeled.
 */
export default function AIVisualStudio({ onInsert, referenceImageUrl }) {
  const [prompt, setPrompt] = useState("");
  const [preset, setPreset] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const generate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Describe what you'd like to create.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const fullPrompt = preset ? `${prompt}. ${preset.prompt}` : prompt;
      const refUrls = referenceImageUrl ? [referenceImageUrl] : undefined;
      const res = await base44.integrations.Core.GenerateImage({
        prompt: fullPrompt,
        existing_image_urls: refUrls,
      });
      if (res?.url) {
        setResults((prev) => [
          {
            id: Date.now(),
            url: res.url,
            prompt: fullPrompt,
            isAI: true,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        toast({ title: "Image generated", description: "Your visual is ready to review." });
      }
    } catch (err) {
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [prompt, preset, referenceImageUrl, toast]);

  const download = useCallback((url) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `unibud-ai-${Date.now()}.png`;
    a.target = "_blank";
    a.click();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <Wand2 className="w-4 h-4 text-primary" />
        <span className="text-[14px] font-semibold text-foreground flex-1">AI Visual Studio</span>
        <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground glass px-2 py-0.5 rounded-full">
          AI-Generated
        </span>
      </div>

      {/* Prompt input */}
      <div className="p-4 flex-shrink-0">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to create… e.g. 'A modern university campus at sunset, glass buildings, warm light'"
          rows={3}
          className="w-full px-3.5 py-3 rounded-[14px] glass text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none spring-tap"
        />

        {/* Presets */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 -mx-1 px-1">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(preset?.id === p.id ? null : p)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap transition-all duration-300 ${
                preset?.id === p.id
                  ? "bg-primary text-primary-foreground"
                  : "glass text-foreground/70 hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {error && <p className="text-[12px] text-destructive mt-2">{error}</p>}

        <button
          onClick={generate}
          disabled={generating || !prompt.trim()}
          className="w-full mt-3 h-[46px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[14px] flex items-center justify-center gap-2.5 spring-tap disabled:opacity-50 ice-glow"
        >
          {generating ? (
            <><Loader2 className="w-[18px] h-[18px] animate-spin" /> Generating…</>
          ) : (
            <><Sparkles className="w-[18px] h-[18px]" /> {referenceImageUrl ? "Redesign" : "Generate"}</>
          )}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        {results.length === 0 ? (
          <div className="crystal-card p-8 text-center mt-2">
            <ImageIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-[13px] text-muted-foreground">Your generated visuals will appear here.</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Describe what you want and hit Generate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {results.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="crystal-card overflow-hidden"
                >
                  <div className="relative aspect-square">
                    <Image src={r.url} alt={r.prompt} className="w-full h-full" />
                    <span className="absolute top-2 left-2 text-[8px] font-bold uppercase tracking-wide text-foreground bg-background/80 px-1.5 py-0.5 rounded-full backdrop-blur">
                      AI
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">{r.prompt}</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => download(r.url)}
                        className="flex-1 h-7 rounded-lg glass hover:bg-white/[0.08] flex items-center justify-center gap-1 spring-tap text-[10px] font-semibold text-foreground"
                      >
                        <Download className="w-3 h-3" /> Save
                      </button>
                      {onInsert && (
                        <button
                          onClick={() => onInsert(r.url)}
                          className="flex-1 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-1 spring-tap text-[10px] font-semibold"
                        >
                          Insert
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}