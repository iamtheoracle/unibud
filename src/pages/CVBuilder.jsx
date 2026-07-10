import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Download, Plus, Trash2, Sparkles, Briefcase, GraduationCap, FlaskConical, User } from "lucide-react";

const TEMPLATES = [
  { id: "modern", name: "Modern", description: "Clean, single-column layout with gold accents", icon: User, color: "text-primary", bg: "bg-primary/10" },
  { id: "professional", name: "Professional", description: "Two-column layout, ATS-friendly", icon: Briefcase, color: "text-info", bg: "bg-info/10" },
  { id: "academic", name: "Academic", description: "Research-focused with publications section", icon: GraduationCap, color: "text-purple", bg: "bg-purple/10" },
  { id: "research", name: "Research", description: "For academic positions and grants", icon: FlaskConical, color: "text-success", bg: "bg-success/10" },
];

const SECTION_TYPES = {
  education: { label: "Education", icon: GraduationCap, color: "text-primary", bg: "bg-primary/10" },
  experience: { label: "Work Experience", icon: Briefcase, color: "text-info", bg: "bg-info/10" },
  research: { label: "Research & Publications", icon: FlaskConical, color: "text-purple", bg: "bg-purple/10" },
  skills: { label: "Skills", icon: Sparkles, color: "text-success", bg: "bg-success/10" },
  projects: { label: "Projects", icon: FileText, color: "text-warning", bg: "bg-warning/10" },
};

const DEMO_PROFILE = {
  full_name: "Chioma Eze",
  email: "chioma.eze@university.edu.ng",
  phone: "+234 803 123 4567",
  university: "Covenant University",
  department: "Computer Science",
  level: "400 Level",
  gpa: "4.7/5.0",
  linkedin: "linkedin.com/in/chiomaeze",
  github: "github.com/chiomaeze",
  summary: "Final-year Computer Science student passionate about AI and building scalable systems. Experienced in full-stack development with a strong foundation in machine learning and cloud computing.",
  education: [
    { title: "B.Sc Computer Science", org: "Covenant University", period: "2022 — 2026", detail: "CGPA: 4.7/5.0 · Dean's List (2023, 2024)" },
  ],
  experience: [
    { title: "Software Engineering Intern", org: "Flutterwave", period: "Jun 2025 — Sep 2025", detail: "Built payment reconciliation microservice handling ₦2B+ monthly. Reduced processing time by 40%." },
    { title: "Teaching Assistant", org: "Department of Computer Science", period: "2024 — Present", detail: "Assist 200-level students with Data Structures and Algorithms coursework." },
  ],
  research: [
    { title: "African Language NLP Models", org: "AI Research Lab", period: "2025", detail: "Co-authored paper on low-resource language transformers, accepted at ACL 2025." },
  ],
  skills: ["Python", "JavaScript", "React", "Node.js", "TensorFlow", "AWS", "PostgreSQL", "Docker"],
  projects: [
    { title: "UNIBUD Study Planner", org: "", period: "2025", detail: "AI-powered study scheduling app used by 500+ students." },
    { title: "Campus Lost & Found", org: "", period: "2024", detail: "Mobile app connecting students with lost items using image matching." },
  ],
};

function SectionEditor({ type, entries, onChange }) {
  const meta = SECTION_TYPES[type];
  const Icon = meta.icon;

  const addEntry = () => {
    onChange([...entries, { title: "", org: "", period: "", detail: "" }]);
  };

  const updateEntry = (idx, field, value) => {
    const updated = [...entries];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const removeEntry = (idx) => {
    onChange(entries.filter((_, i) => i !== idx));
  };

  return (
    <div className="bg-card rounded-[20px] soft-shadow border border-border/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={"w-8 h-8 rounded-[10px] flex items-center justify-center " + meta.bg}>
            <Icon className={"w-4 h-4 " + meta.color} strokeWidth={2} />
          </div>
          <h3 className="font-heading font-semibold text-[14px] text-foreground">{meta.label}</h3>
        </div>
        <button onClick={addEntry} className="p-2 rounded-full bg-muted spring-tap">
          <Plus className="w-4 h-4 text-foreground" strokeWidth={2} />
        </button>
      </div>
      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div key={idx} className="rounded-[14px] bg-muted/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground">Entry {idx + 1}</span>
              <button onClick={() => removeEntry(idx)} className="p-1 rounded-full spring-tap">
                <Trash2 className="w-3.5 h-3.5 text-error" />
              </button>
            </div>
            <input
              type="text"
              value={entry.title}
              onChange={(e) => updateEntry(idx, "title", e.target.value)}
              placeholder="Title / Role"
              className="w-full px-3 py-2 rounded-[10px] bg-card border border-border/40 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
            />
            {type !== "skills" && (
              <input
                type="text"
                value={entry.org}
                onChange={(e) => updateEntry(idx, "org", e.target.value)}
                placeholder="Organization"
                className="w-full px-3 py-2 rounded-[10px] bg-card border border-border/40 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
              />
            )}
            {type !== "skills" && (
              <input
                type="text"
                value={entry.period}
                onChange={(e) => updateEntry(idx, "period", e.target.value)}
                placeholder="Period (e.g. 2024 — 2026)"
                className="w-full px-3 py-2 rounded-[10px] bg-card border border-border/40 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
              />
            )}
            {type !== "skills" && (
              <textarea
                value={entry.detail}
                onChange={(e) => updateEntry(idx, "detail", e.target.value)}
                placeholder="Description / Details"
                rows={2}
                className="w-full px-3 py-2 rounded-[10px] bg-card border border-border/40 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 resize-none"
              />
            )}
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-[11px] text-muted-foreground text-center py-2">No entries yet. Tap + to add.</p>
        )}
      </div>
    </div>
  );
}

export default function CVBuilder() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("edit");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [profile, setProfile] = useState(DEMO_PROFILE);

  const updateProfile = (field, value) => setProfile({ ...profile, [field]: value });

  const handleExport = () => {
    const cvContent = `${profile.full_name}\n${profile.email} | ${profile.phone}\n${profile.linkedin} | ${profile.github}\n\nSUMMARY\n${profile.summary}\n\nEDUCATION\n${profile.education.map(e => `${e.title}\n${e.org} | ${e.period}\n${e.detail}`).join("\n\n")}\n\nEXPERIENCE\n${profile.experience.map(e => `${e.title}\n${e.org} | ${e.period}\n${e.detail}`).join("\n\n")}\n\nRESEARCH\n${profile.research.map(e => `${e.title}\n${e.org} | ${e.period}\n${e.detail}`).join("\n\n")}\n\nSKILLS\n${profile.skills.join(", ")}\n\nPROJECTS\n${profile.projects.map(e => `${e.title} (${e.period})\n${e.detail}`).join("\n\n")}`;
    const blob = new Blob([cvContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.full_name.replace(/\s+/g, "_")}_CV.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">CV Builder</h1>
          <p className="text-[12px] text-muted-foreground">Build your professional CV</p>
        </div>
        <button onClick={handleExport} className="px-4 h-10 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold flex items-center gap-1.5 spring-tap gold-glow">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="bg-card rounded-[16px] p-1 soft-shadow border border-border/40 flex">
          {["edit", "templates", "preview"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={"flex-1 py-2.5 rounded-[12px] text-[11px] font-semibold capitalize transition-all " + (activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "edit" && (
        <div className="px-4 space-y-3">
          <div className="bg-card rounded-[20px] soft-shadow border border-border/40 p-4 space-y-3">
            <h3 className="font-heading font-semibold text-[14px] text-foreground">Personal Info</h3>
            <input type="text" value={profile.full_name} onChange={(e) => updateProfile("full_name", e.target.value)} placeholder="Full Name" className="w-full px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] text-foreground focus:outline-none focus:border-primary/40" />
            <div className="grid grid-cols-2 gap-2">
              <input type="email" value={profile.email} onChange={(e) => updateProfile("email", e.target.value)} placeholder="Email" className="px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] text-foreground focus:outline-none focus:border-primary/40" />
              <input type="tel" value={profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} placeholder="Phone" className="px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] text-foreground focus:outline-none focus:border-primary/40" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={profile.linkedin} onChange={(e) => updateProfile("linkedin", e.target.value)} placeholder="LinkedIn" className="px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] text-foreground focus:outline-none focus:border-primary/40" />
              <input type="text" value={profile.github} onChange={(e) => updateProfile("github", e.target.value)} placeholder="GitHub" className="px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] text-foreground focus:outline-none focus:border-primary/40" />
            </div>
            <textarea value={profile.summary} onChange={(e) => updateProfile("summary", e.target.value)} placeholder="Professional Summary" rows={3} className="w-full px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] text-foreground focus:outline-none focus:border-primary/40 resize-none" />
          </div>

          <SectionEditor type="education" entries={profile.education} onChange={(entries) => updateProfile("education", entries)} />
          <SectionEditor type="experience" entries={profile.experience} onChange={(entries) => updateProfile("experience", entries)} />
          <SectionEditor type="research" entries={profile.research} onChange={(entries) => updateProfile("research", entries)} />
          <SectionEditor type="projects" entries={profile.projects} onChange={(entries) => updateProfile("projects", entries)} />

          <div className="bg-card rounded-[20px] soft-shadow border border-border/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-[10px] bg-success/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-success" strokeWidth={2} />
              </div>
              <h3 className="font-heading font-semibold text-[14px] text-foreground">Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-success/10 text-success text-[11px] font-medium flex items-center gap-1.5">
                  {skill}
                  <button onClick={() => updateProfile("skills", profile.skills.filter((_, idx) => idx !== i))} className="hover:text-error">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add skill..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  updateProfile("skills", [...profile.skills, e.target.value.trim()]);
                  e.target.value = "";
                }
              }}
              className="w-full mt-3 px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
            />
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="px-4 space-y-3">
          {TEMPLATES.map((tpl, i) => {
            const Icon = tpl.icon;
            const isSelected = selectedTemplate === tpl.id;
            return (
              <motion.button
                key={tpl.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={"w-full text-left bg-card rounded-[20px] p-4 border-2 spring-tap flex items-center gap-3 " + (isSelected ? "border-primary gold-glow" : "border-border/40 soft-shadow")}
              >
                <div className={"w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 " + tpl.bg}>
                  <Icon className={"w-6 h-6 " + tpl.color} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-[14px] text-foreground">{tpl.name}</p>
                  <p className="text-[11px] text-muted-foreground">{tpl.description}</p>
                </div>
                {isSelected && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Sparkles className="w-3 h-3 text-primary-foreground" /></div>}
              </motion.button>
            );
          })}
        </div>
      )}

      {activeTab === "preview" && (
        <div className="px-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-[20px] soft-shadow border border-border/40 p-5">
            <div className="border-b border-border/30 pb-3 mb-3">
              <h2 className="font-heading font-extrabold text-[20px] text-foreground">{profile.full_name}</h2>
              <p className="text-[11px] text-muted-foreground mt-1">{profile.email} · {profile.phone}</p>
              <p className="text-[11px] text-muted-foreground">{profile.linkedin} · {profile.github}</p>
            </div>
            {profile.summary && (
              <div className="mb-3">
                <h3 className="font-heading font-bold text-[11px] text-primary uppercase tracking-wide mb-1">Summary</h3>
                <p className="text-[12px] text-foreground leading-relaxed">{profile.summary}</p>
              </div>
            )}
            {profile.education.length > 0 && (
              <div className="mb-3">
                <h3 className="font-heading font-bold text-[11px] text-primary uppercase tracking-wide mb-1">Education</h3>
                {profile.education.map((e, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-[12px] font-semibold text-foreground">{e.title}</p>
                    <p className="text-[11px] text-muted-foreground">{e.org} · {e.period}</p>
                    {e.detail && <p className="text-[11px] text-foreground mt-0.5">{e.detail}</p>}
                  </div>
                ))}
              </div>
            )}
            {profile.experience.length > 0 && (
              <div className="mb-3">
                <h3 className="font-heading font-bold text-[11px] text-primary uppercase tracking-wide mb-1">Experience</h3>
                {profile.experience.map((e, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-[12px] font-semibold text-foreground">{e.title}</p>
                    <p className="text-[11px] text-muted-foreground">{e.org} · {e.period}</p>
                    {e.detail && <p className="text-[11px] text-foreground mt-0.5">{e.detail}</p>}
                  </div>
                ))}
              </div>
            )}
            {profile.research.length > 0 && (
              <div className="mb-3">
                <h3 className="font-heading font-bold text-[11px] text-primary uppercase tracking-wide mb-1">Research</h3>
                {profile.research.map((e, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-[12px] font-semibold text-foreground">{e.title}</p>
                    <p className="text-[11px] text-muted-foreground">{e.org} · {e.period}</p>
                    {e.detail && <p className="text-[11px] text-foreground mt-0.5">{e.detail}</p>}
                  </div>
                ))}
              </div>
            )}
            {profile.skills.length > 0 && (
              <div className="mb-3">
                <h3 className="font-heading font-bold text-[11px] text-primary uppercase tracking-wide mb-1">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-foreground font-medium">{s}</span>)}
                </div>
              </div>
            )}
            {profile.projects.length > 0 && (
              <div>
                <h3 className="font-heading font-bold text-[11px] text-primary uppercase tracking-wide mb-1">Projects</h3>
                {profile.projects.map((e, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-[12px] font-semibold text-foreground">{e.title} <span className="text-[10px] text-muted-foreground font-normal">· {e.period}</span></p>
                    {e.detail && <p className="text-[11px] text-foreground mt-0.5">{e.detail}</p>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}