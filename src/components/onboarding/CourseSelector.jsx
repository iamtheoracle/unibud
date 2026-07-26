import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Check, ChevronDown, PenLine, GraduationCap } from "lucide-react";
import { getCoursesByFaculty, searchCourses } from "@/data/nigerianCourses";
import { normalizeCourse } from "@/lib/academics/courseNormalizer";
import { hapticTap } from "@/lib/haptics";

export default function CourseSelector({ open, onSelect, onClose, institutionName }) {
  const [q, setQ] = useState("");
  const [manual, setManual] = useState(false);
  const [manualText, setManualText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [confirm, setConfirm] = useState(null); // { original, normalized, faculty, department }
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebounced(manualText), 250);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [manualText]);

  const normalization = useMemo(() => (manualText.trim() ? normalizeCourse(manualText) : null), [manualText]);
  const searchResults = useMemo(() => (debounced ? searchCourses(debounced).slice(0, 12) : []), [debounced]);
  const browseResults = useMemo(() => (q ? searchCourses(q).slice(0, 40) : getCoursesByFaculty()), [q]);

  const pick = (course) => {
    hapticTap();
    onSelect({ name: course.name, original: course.name, faculty: course.faculty, department: course.department, manual: false });
  };

  const confirmManual = () => {
    if (!manualText.trim()) return;
    const n = normalization;
    // High-confidence match that differs from original → require confirmation
    if (n?.matched && n.normalized && n.normalized.toLowerCase() !== manualText.trim().toLowerCase()) {
      hapticTap();
      setConfirm({ original: manualText.trim(), normalized: n.normalized, faculty: n.faculty, department: n.department });
      return;
    }
    // Match identical to input, or no match → store as-is, normalized where possible
    hapticTap();
    onSelect({
      name: n?.normalized || manualText.trim(),
      original: manualText.trim(),
      faculty: n?.faculty || "",
      department: n?.department || "",
      manual: true,
    });
  };

  const acceptSuggestion = (course) => {
    hapticTap();
    onSelect({ name: course.name, original: manualText.trim(), faculty: course.faculty, department: course.department, manual: true });
    setConfirm(null);
  };

  const acceptNormalized = () => {
    hapticTap();
    onSelect({ name: confirm.normalized, original: confirm.original, faculty: confirm.faculty, department: confirm.department, manual: true });
    setConfirm(null);
  };

  const keepOriginal = () => {
    hapticTap();
    onSelect({ name: confirm.original, original: confirm.original, faculty: "", department: "", manual: true });
    setConfirm(null);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] bg-background"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="sticky top-0 z-10 glass-strong safe-area-pt">
            <div className="px-5 pt-3 pb-3 max-w-[600px] mx-auto">
              <div className="flex items-center justify-between mb-1">
                <h1 className="font-heading font-bold text-[20px] text-foreground">Select your course</h1>
                <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted/60 flex items-center justify-center spring-tap">
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
              {institutionName && <p className="text-[12px] text-muted-foreground mb-3">Programmes for <span className="font-semibold text-foreground">{institutionName}</span></p>}
            </div>
            <div className="px-5 pb-3 max-w-[600px] mx-auto flex gap-2">
              <button onClick={() => setManual(false)} className={`flex-1 py-2 rounded-[14px] text-[13px] font-semibold spring-tap ${!manual ? "bg-primary text-primary-foreground" : "glass text-foreground/70"}`}>Browse</button>
              <button onClick={() => setManual(true)} className={`flex-1 py-2 rounded-[14px] text-[13px] font-semibold spring-tap flex items-center justify-center gap-1.5 ${manual ? "bg-primary text-primary-foreground" : "glass text-foreground/70"}`}><PenLine className="w-3.5 h-3.5" /> Type manually</button>
            </div>
            {!manual && (
              <div className="px-5 pb-3 max-w-[600px] mx-auto">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search programmes"
                    className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-card border border-border/40 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="px-5 pb-32 pt-3 max-w-[600px] mx-auto">
            {!manual ? (
              q ? (
                <div className="space-y-1">
                  {browseResults.length === 0 ? (
                    <BrowseEmpty query={q} onManual={() => { setManual(true); setManualText(q); }} />
                  ) : (
                    browseResults.map((c) => <CourseRow key={c.name + c.faculty} course={c} onClick={() => pick(c)} />)
                  )}
                </div>
              ) : (
                browseResults.map((grp) => (
                  <div key={grp.faculty} className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2 px-1">
                      <ChevronDown className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[13px] font-bold text-foreground">{grp.faculty}</span>
                    </div>
                    <div className="space-y-1">
                      {grp.courses.map((c) => <CourseRow key={c.name + c.faculty} course={c} onClick={() => pick(c)} />)}
                    </div>
                  </div>
                ))
              )
            ) : (
              <ManualEntry
                text={manualText}
                setText={setManualText}
                normalization={normalization}
                searchResults={searchResults}
                onConfirm={confirmManual}
                onPickSuggestion={acceptSuggestion}
              />
            )}
          </div>

          {/* Confirmation sheet */}
          <AnimatePresence>
            {confirm && (
              <motion.div className="fixed inset-0 z-[80] bg-black/40 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirm(null)}>
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 320 }}
                  className="w-full max-w-[600px] mx-auto glass-strong rounded-t-[28px] p-5 pb-8 safe-area-pb"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[13px] font-bold text-foreground">Spark recognized your course</span>
                  </div>
                  <p className="text-[14px] text-foreground mb-4">
                    You typed <span className="font-semibold">"{confirm.original}"</span>. We'll save it as
                    <span className="font-semibold text-primary"> {confirm.normalized}</span>
                    {confirm.faculty && <span className="text-muted-foreground"> ({confirm.faculty})</span>}.
                  </p>
                  <p className="text-[11px] text-muted-foreground mb-4">Your original text is preserved for search and analytics.</p>
                  <div className="space-y-2">
                    <button onClick={acceptNormalized} className="w-full h-[48px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap">
                      <Check className="w-4 h-4" /> Save as {confirm.normalized}
                    </button>
                    <button onClick={keepOriginal} className="w-full h-[44px] rounded-2xl glass text-foreground font-heading font-semibold text-[14px] spring-tap">
                      Keep "{confirm.original}" as written
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CourseRow({ course, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[16px] hover:bg-muted/40 active:bg-muted/60 transition-colors text-left spring-tap">
      <span className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
        <GraduationCap className="w-4 h-4 text-primary" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-foreground truncate">{course.name}</p>
        <p className="text-[11px] text-muted-foreground truncate">{course.department} · {course.faculty}</p>
      </div>
    </button>
  );
}

function ManualEntry({ text, setText, normalization, searchResults, onConfirm, onPickSuggestion }) {
  return (
    <div>
      <div className="relative mb-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          placeholder="e.g. Comp Sci, Mass Comm, Civil Eng"
          className="w-full px-4 py-3 rounded-[16px] bg-card border border-border/40 text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
      </div>

      {text.trim() && normalization?.matched && (
        <div className="glass-card rounded-[18px] p-3.5 mb-3 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[13px] text-foreground">
              Matches <span className="font-semibold text-primary">{normalization.normalized}</span>
              {normalization.faculty && <span className="text-muted-foreground"> · {normalization.faculty}</span>}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">We'll ask you to confirm on save.</p>
          </div>
        </div>
      )}

      {text.trim() && normalization && !normalization.matched && normalization.suggestions.length > 0 && (
        <div className="mb-3">
          <p className="text-[12px] font-semibold text-muted-foreground mb-2 px-1">Did you mean…</p>
          <div className="space-y-1">
            {normalization.suggestions.map((c) => (
              <button key={c.name + c.faculty} onClick={() => onPickSuggestion(c)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[16px] glass spring-tap text-left">
                <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{c.department}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {text.trim() && normalization && !normalization.matched && normalization.suggestions.length === 0 && (
        <div className="glass-card rounded-[18px] p-3.5 mb-3 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-foreground">
            We don't have an exact match yet. Save it as you typed it — Bud will help confirm the details later.
          </p>
        </div>
      )}

      <button
        onClick={onConfirm}
        disabled={!text.trim()}
        className="w-full h-[48px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-40"
      >
        <Check className="w-4 h-4" /> Save course
      </button>
    </div>
  );
}

function BrowseEmpty({ query, onManual }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
        <GraduationCap className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-[15px] font-semibold text-foreground">No programme matches "{query}"</p>
      <p className="text-[12px] text-muted-foreground mt-1 mb-4 max-w-[280px]">
        Not every programme is listed. You can type it manually — Spark will normalize it for you.
      </p>
      <button onClick={onManual} className="px-4 h-10 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold spring-tap flex items-center gap-1.5">
        <PenLine className="w-3.5 h-3.5" /> Type manually
      </button>
    </div>
  );
}