import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Plus, Users, BookOpen, Lock, Globe,
  ChevronRight, Hash, GraduationCap,
  Sparkles, X, Check,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap, hapticImpact } from "@/lib/haptics";
import CommunityShell from "@/components/community/CommunityShell";
import IconAction from "@/components/layout/IconAction";

const typeConfig = {
  public: { icon: Globe, color: "text-information", label: "Public" },
  private: { icon: Lock, color: "text-warning", label: "Private" },
  course: { icon: BookOpen, color: "text-primary", label: "Course" },
  exam_revision: { icon: GraduationCap, color: "text-error", label: "Exam Prep" },
  department: { icon: Users, color: "text-accent", label: "Department" },
  faculty: { icon: Users, color: "text-success", label: "Faculty" },
  project_team: { icon: Hash, color: "text-information", label: "Project" },
};

const accentColors = [
  "hsl(var(--gold))", "hsl(var(--primary))", "hsl(var(--accent))",
  "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--error))",
];

export default function StudyGroups() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", course_code: "", lecturer: "",
    department: "", faculty: "", type: "course", max_members: 30,
  });

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: groups, isLoading } = useQuery({
    queryKey: ["studyGroups"],
    queryFn: () => base44.entities.StudyGroup.list("-created_date", 50),
  });

  const { data: budRecs } = useQuery({
    queryKey: ["budGroupRecs"],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ status: "active" });
      const allGroups = await base44.entities.StudyGroup.list("-created_date", 30);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `A student is taking these courses: ${courses.map(c => c.code + " " + c.title).join(", ")}. Available study groups: ${allGroups.map(g => g.name + " (" + (g.course_code || g.subject || "general") + ")").join(", ")}. Which study group IDs would be most useful for this student? Return up to 4 IDs.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_ids: { type: "array", items: { type: "string" } },
            reasoning: { type: "string" }
          }
        }
      });
      return res;
    },
    staleTime: 300000,
  });

  let filtered = groups || [];
  if (filter !== "All") filtered = filtered.filter(g => g.type === filter.toLowerCase().replace(" ", "_"));
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(g =>
      g.name?.toLowerCase().includes(q) ||
      g.course_code?.toLowerCase().includes(q) ||
      g.subject?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q)
    );
  }

  const recommendedIds = budRecs?.recommended_ids || [];
  const recommended = (groups || []).filter(g => recommendedIds.includes(g.id));

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const shareLink = `/study-groups/${slug}`;
      const created = await base44.entities.StudyGroup.create({
        ...form,
        university: user?.university || "",
        semester: user?.semester || "Current",
        host_name: user?.full_name || user?.preferred_name || "Student",
        members_count: 1,
        status: "active",
        accent_color: accentColors[Math.floor(Math.random() * accentColors.length)],
        share_link: shareLink,
        is_joined: true,
        tags: form.course_code ? [form.course_code] : [],
      });
      qc.invalidateQueries({ queryKey: ["studyGroups"] });
      setShowCreate(false);
      setForm({ name: "", description: "", course_code: "", lecturer: "", department: "", faculty: "", type: "course", max_members: 30 });
    } catch (err) {}
  };

  const handleJoin = async (group) => {
    hapticImpact();
    // Optimistic update — update cache immediately
    qc.setQueryData(["studyGroups"], (old) => {
      if (!old) return old;
      return old.map((g) =>
        g.id === group.id
          ? { ...g, is_joined: true, members_count: (g.members_count || 0) + 1 }
          : g
      );
    });
    toast({ title: `Joined ${group.name}` });
    try {
      await base44.entities.StudyGroup.update(group.id, {
        is_joined: true,
        members_count: (group.members_count || 0) + 1,
      });
      qc.invalidateQueries({ queryKey: ["studyGroups"] });
    } catch (err) {
      // Rollback on failure
      qc.setQueryData(["studyGroups"], (old) => {
        if (!old) return old;
        return old.map((g) =>
          g.id === group.id
            ? { ...g, is_joined: false, members_count: group.members_count || 0 }
            : g
        );
      });
      toast({ title: "Failed to join group", variant: "destructive" });
    }
  };

  return (
    <CommunityShell
      title="Study Groups"
      icon={Users}
      accent="142 71% 45%"
      actions={<IconAction icon={Plus} variant="primary" onClick={() => setShowCreate(true)} label="Create group" />}
    >

      {/* Search */}
      <div className="pb-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search groups, courses..."
            className="w-full pl-10 pr-4 h-[44px] rounded-[16px] bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow" />
        </div>
      </div>

      {/* Filters */}
      <div className="pb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {["All", "Course", "Exam Revision", "Department", "Project Team"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap ${filter === f ? "bg-foreground text-background soft-shadow" : "bg-card border border-border/40 text-muted-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Bud Recommendations */}
      {!search && filter === "All" && recommended.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2.5 px-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-bold text-[14px] text-foreground">Bud Recommends</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {recommended.map((group, i) => (
              <GroupMiniCard key={group.id} group={group} onJoin={() => handleJoin(group)} delay={i * 0.05} />
            ))}
          </div>
        </div>
      )}

      {/* Groups list */}
      <div className="space-y-3">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-[100px] rounded-[20px] shimmer" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
            </div>
            <p className="text-[13px] font-semibold text-foreground">No study groups found</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Create one to get started</p>
          </div>
        ) : (
          filtered.map((group, i) => (
            <GroupCard key={group.id} group={group} onJoin={() => handleJoin(group)} delay={i * 0.04} />
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CreateGroupModal form={form} setForm={setForm} onClose={() => setShowCreate(false)} onCreate={handleCreate} user={user} />
      )}
    </CommunityShell>
  );
}

function GroupMiniCard({ group, onJoin, delay }) {
  const config = typeConfig[group.type] || typeConfig.public;
  const accent = group.accent_color || "hsl(var(--gold))";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 24 }}
      className="flex-shrink-0 w-[200px] bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 card-hover"
    >
      <div className="w-9 h-9 rounded-[12px] flex items-center justify-center mb-2" style={{ backgroundColor: accent.replace("))", ") / 0.12)") }}>
        <config.icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <p className="font-heading font-semibold text-[12px] text-foreground truncate mb-0.5">{group.name}</p>
      <p className="text-[9px] text-muted-foreground mb-2">{group.course_code || group.subject || "General"}</p>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground">{group.members_count || 0} members</span>
        <button onClick={(e) => { e.stopPropagation(); hapticTap(); onJoin(); }} className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold spring-tap press-scale">
          Join
        </button>
      </div>
    </motion.div>
  );
}

function GroupCard({ group, onJoin, delay }) {
  const config = typeConfig[group.type] || typeConfig.public;
  const accent = group.accent_color || "hsl(var(--gold))";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/study-groups/${group.id}`} className="block bg-card rounded-[20px] p-4 soft-shadow border border-border/40 card-hover">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accent.replace("))", ") / 0.12)") }}>
            <config.icon className="w-5 h-5" style={{ color: accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="font-heading font-semibold text-[14px] text-foreground truncate">{group.name}</p>
              {group.is_joined && <span className="px-1.5 py-0.5 rounded-full bg-success/10 text-success text-[8px] font-bold">JOINED</span>}
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-1 mb-1.5">{group.description || "No description"}</p>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Users className="w-3 h-3" />{group.members_count || 0}/{group.max_members || 50}
              </span>
              {group.course_code && <span className="text-[10px] text-muted-foreground">{group.course_code}</span>}
              <span className="text-[10px] font-semibold" style={{ color: accent }}>{config.label}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-3" />
        </div>
        {!group.is_joined ? (
          <button onClick={(e) => { e.preventDefault(); hapticTap(); onJoin(); }} className="w-full mt-3 py-2 rounded-[12px] bg-primary/10 text-primary text-[11px] font-semibold spring-tap press-scale">
            Join Group
          </button>
        ) : (
          <div className="w-full mt-3 py-2 rounded-[12px] bg-success/10 text-success text-[11px] font-semibold flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5" /> Joined
          </div>
        )}
      </Link>
    </motion.div>
  );
}

function CreateGroupModal({ form, setForm, onClose, onCreate, user }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-[24px] w-full max-w-md p-5 premium-shadow border border-border/40 max-h-[85vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-[16px] text-foreground">Create Study Group</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center spring-tap">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-foreground mb-1 block">Group Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., CSC 301 Study Squad"
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-muted/50 border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-foreground mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What will this group focus on?" rows={2}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-muted/50 border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1 block">Course Code</label>
              <input value={form.course_code} onChange={e => setForm(f => ({ ...f, course_code: e.target.value }))}
                placeholder="CSC 301" className="w-full px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1 block">Lecturer</label>
              <input value={form.lecturer} onChange={e => setForm(f => ({ ...f, lecturer: e.target.value }))}
                placeholder="Dr. Adeyemi" className="w-full px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1 block">Department</label>
              <input value={form.department || user?.department || ""} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="Computer Science" className="w-full px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground mb-1 block">Faculty</label>
              <input value={form.faculty || user?.faculty || ""} onChange={e => setForm(f => ({ ...f, faculty: e.target.value }))}
                placeholder="Science" className="w-full px-3 py-2 rounded-[10px] bg-muted/50 border border-border/40 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-foreground mb-1 block">Group Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {["course", "exam_revision", "project_team", "department", "public", "private"].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-semibold capitalize spring-tap ${form.type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={onCreate} disabled={!form.name.trim()}
          className="w-full mt-4 h-11 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 spring-tap disabled:opacity-50">
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </motion.div>
    </motion.div>
  );
}