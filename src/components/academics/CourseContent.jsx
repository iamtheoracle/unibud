import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, BookOpen, FileText, Video, Link as LinkIcon, Pencil, Trash2, CheckCircle2, Circle, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/academics/EmptyState";
import CourseMaterialComposer from "./CourseMaterialComposer";
import CourseMaterialReader from "./CourseMaterialReader";
import { useToast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";

const EASE = [0.16, 1, 0.3, 1];
const TYPE_ICON = { lesson: FileText, reading: BookOpen, video: Video, document: FileText, slides: FileText, external: LinkIcon, assignment: FileText };

/**
 * CourseContent — the lecturer-published content of a course: lessons, readings,
 * videos, documents and external links, grouped by module and ordered. Students
 * read and mark progress; the course owner (or admin) can author and manage.
 */
export default function CourseContent({ course, user }) {
  const { toast } = useToast();
  const [composer, setComposer] = useState({ open: false, material: null });
  const [reader, setReader] = useState({ open: false, material: null });

  const canEdit = !!user && (course.created_by_id === user.id || user.role === "admin");

  const { data: materials, isLoading } = useQuery({
    queryKey: ["courseMaterials", course.id],
    queryFn: () => base44.entities.CourseMaterial.filter({ course_id: course.id }, "order", 200),
    enabled: !!course.id,
  });

  const { data: progress } = useQuery({
    queryKey: ["materialProgress", user?.id, course.id],
    queryFn: () => base44.entities.CourseMaterialProgress.filter({ user_id: user.id, course_id: course.id }, "-created_date", 500),
    enabled: !!user?.id && !!course.id,
  });

  const progressMap = useMemo(() => {
    const m = {};
    (progress || []).forEach((p) => { m[p.material_id] = p; });
    return m;
  }, [progress]);

  const visible = useMemo(() => {
    let list = materials || [];
    if (!canEdit) list = list.filter((m) => m.status === "published");
    return list;
  }, [materials, canEdit]);

  const grouped = useMemo(() => {
    const map = new Map();
    visible.forEach((m) => {
      const key = m.module || "Course materials";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    });
    return [...map.entries()];
  }, [visible]);

  const completedCount = visible.filter((m) => progressMap[m.id]?.completed).length;
  const pct = visible.length ? Math.round((completedCount / visible.length) * 100) : 0;

  async function handleDelete(m) {
    if (!confirm(`Delete "${m.title}"?`)) return;
    try {
      await base44.entities.CourseMaterial.delete(m.id);
      await queryClientInstance.invalidateQueries({ queryKey: ["courseMaterials", course.id] });
      toast({ title: "Material deleted" });
    } catch (err) {
      toast({ title: "Could not delete", description: err.message, variant: "destructive" });
    }
  }

  if (isLoading) {
    return <div className="h-40 rounded-[24px] glass-card shimmer" />;
  }

  if (visible.length === 0) {
    return (
      <div className="space-y-4">
        {canEdit && (
          <div className="flex justify-end">
            <button onClick={() => setComposer({ open: true, material: null })} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
              <Plus className="w-3.5 h-3.5" /> Add content
            </button>
          </div>
        )}
        <EmptyState message={canEdit ? "No content yet. Publish your first lesson, reading, or video." : "Your lecturer hasn't published content for this course yet."} />
        <CourseMaterialComposer open={composer.open} onClose={() => setComposer({ open: false, material: null })} course={course} material={composer.material} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground">{visible.length} item{visible.length === 1 ? "" : "s"} · {completedCount} completed</p>
          <div className="w-32 h-1.5 rounded-full bg-muted/60 mt-1.5 overflow-hidden">
            <div className="h-full bg-success rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        {canEdit && (
          <button onClick={() => setComposer({ open: true, material: null })} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      <div className="space-y-5">
        {grouped.map(([module, items]) => (
          <div key={module}>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2 px-1">{module}</p>
            <div className="space-y-2.5">
              {items.map((m, i) => {
                const Icon = TYPE_ICON[m.type] || FileText;
                const done = !!progressMap[m.id]?.completed;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
                    className="glass-card p-3.5 flex items-center gap-3"
                  >
                    <button onClick={() => setReader({ open: true, material: m })} className="flex items-center gap-3 flex-1 min-w-0 text-left spring-tap">
                      {done ? <CheckCircle2 className="w-5 h-5 text-success shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
                      <div className="w-9 h-9 rounded-[12px] bg-primary/8 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-foreground truncate">{m.title}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                          <span className="capitalize">{m.type}</span>
                          {Number(m.duration_minutes) > 0 && <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {m.duration_minutes}m</span>}
                          {m.status === "draft" && <span className="text-warning">· draft</span>}
                        </p>
                      </div>
                    </button>
                    {canEdit && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setComposer({ open: true, material: m })} className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center spring-tap" aria-label="Edit">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDelete(m)} className="w-7 h-7 rounded-full bg-error/10 flex items-center justify-center spring-tap" aria-label="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-error" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <CourseMaterialComposer open={composer.open} onClose={() => setComposer({ open: false, material: null })} course={course} material={composer.material} />
      <CourseMaterialReader open={reader.open} onClose={() => setReader({ open: false, material: null })} material={reader.material} progress={reader.material ? progressMap[reader.material.id] : null} user={user} />
    </div>
  );
}