import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, ChevronRight, Check, Search } from "lucide-react";
import UnibudMark from "@/components/brand/UnibudMark";
import { hapticTap } from "@/lib/haptics";

const ease = [0.16, 1, 0.3, 1];

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "sw", label: "Swahili", native: "Kiswahili" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "zh", label: "Chinese", native: "中文" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "yo", label: "Yoruba", native: "Yorùbá" },
  { code: "ig", label: "Igbo", native: "Asụsụ Igbo" },
  { code: "ha", label: "Hausa", native: "Hausa" },
];

const REGIONS = [
  "Africa", "Asia", "Europe", "North America", "South America", "Oceania", "Middle East",
];

export default function LanguageRegion() {
  const navigate = useNavigate();
  const [step, setStep] = useState("language");
  const [selectedLang, setSelectedLang] = useState("en");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [detectedLang, setDetectedLang] = useState("");

  useEffect(() => {
    const browserLang = navigator.language?.split("-")[0] || "en";
    const match = LANGUAGES.find((l) => l.code === browserLang);
    if (match) {
      setDetectedLang(match.label);
      setSelectedLang(match.code);
    }
  }, []);

  const handleContinue = () => {
    hapticTap();
    localStorage.setItem("unibud_language", selectedLang);
    localStorage.setItem("unibud_region", selectedRegion);
    navigate("/welcome");
  };

  const filteredRegions = REGIONS.filter((r) =>
    r.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      <motion.div
        className="absolute top-[-10%] left-[-5%] w-[60%] h-[35%] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none"
        animate={{ x: [0, 30, 0], y: [0, 15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-6 pt-4 relative z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top), 2rem)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-foreground"><UnibudMark className="w-5 h-5" /></span>
          <span className="font-heading font-extrabold text-[14px] text-foreground">UNIBUD</span>
        </div>
        {step === "region" && (
          <button
            onClick={() => setStep("language")}
            className="text-[12px] font-semibold text-muted-foreground spring-tap"
          >
            Back
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 relative z-10 no-scrollbar">
        {step === "language" ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-5 h-5 text-primary" strokeWidth={2} />
              <h2 className="font-heading font-extrabold text-[22px] tracking-tight text-foreground">Language</h2>
            </div>
            {detectedLang && (
              <p className="text-[13px] text-muted-foreground mb-4">
                We detected <span className="font-semibold text-foreground">{detectedLang}</span>. You can change this anytime.
              </p>
            )}

            <div className="space-y-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { hapticTap(); setSelectedLang(lang.code); }}
                  className={`w-full flex items-center justify-between px-4 h-[54px] rounded-2xl border spring-tap transition-colors ${
                    selectedLang === lang.code
                      ? "bg-primary/8 border-primary/30"
                      : "bg-card border-border/30"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[15px] font-semibold text-foreground">{lang.native}</span>
                    <span className="text-[11px] text-muted-foreground">{lang.label}</span>
                  </div>
                  {selectedLang === lang.code && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Search className="w-5 h-5 text-primary" strokeWidth={2} />
              <h2 className="font-heading font-extrabold text-[22px] tracking-tight text-foreground">Region</h2>
            </div>
            <p className="text-[13px] text-muted-foreground mb-4">
              Select your region to personalize your experience.
            </p>

            <div className="space-y-2">
              {filteredRegions.map((region) => (
                <button
                  key={region}
                  onClick={() => { hapticTap(); setSelectedRegion(region); }}
                  className={`w-full flex items-center justify-between px-4 h-[54px] rounded-2xl border spring-tap transition-colors ${
                    selectedRegion === region
                      ? "bg-primary/8 border-primary/30"
                      : "bg-card border-border/30"
                  }`}
                >
                  <span className="text-[15px] font-semibold text-foreground">{region}</span>
                  {selectedRegion === region ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-6 pb-2 pt-3 relative z-10 bg-gradient-to-t from-background via-background/95 to-transparent"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            hapticTap();
            if (step === "language") setStep("region");
            else handleContinue();
          }}
          disabled={step === "region" && !selectedRegion}
          className="w-full h-[52px] rounded-full bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50 shadow-[0_6px_24px_hsl(var(--primary)/0.3)]"
        >
          {step === "language" ? "Continue" : "Continue"}
          <ChevronRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </motion.button>
      </div>
    </div>
  );
}