import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, FileText, Lightbulb, CalendarDays, Users, FlaskConical,
  Newspaper, GraduationCap, FolderKanban, Mic, X, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Reusable content templates. Each template provides a structured draft
 * that the creator can edit before publishing as a QuadPost.
 * Templates auto-format content while allowing complete editing.
 */
const TEMPLATES = [
  {
    id: "study_guide",
    icon: BookOpen,
    label: "Study Guide",
    description: "Structured notes with key topics and summaries",
    color: "bg-primary/10",
    iconColor: "text-primary",
    postType: "study_resource",
    title: "Study Guide: [Subject/Topic]",
    body: `## Key Topics

1. **Topic 1** — Brief summary
2. **Topic 2** — Brief summary
3. **Topic 3** — Brief summary

## Important Concepts

- 

## Key Formulas / Definitions

- 

## Summary

Write your summary here.

## Practice Questions

1. ?`,
  },
  {
    id: "lecture_notes",
    icon: FileText,
    label: "Lecture Notes",
    description: "Organized notes from a class or lecture",
    color: "bg-accent/10",
    iconColor: "text-accent",
    postType: "note",
    title: "Lecture Notes: [Course Code] — [Topic]",
    body: `**Date:** 
**Course:** 
**Lecturer:** 

## Main Points

- 

## Detailed Notes

Write your notes here.

## Questions to Follow Up

- `,
  },
  {
    id: "assignment_tips",
    icon: Lightbulb,
    label: "Assignment Tips",
    description: "Share advice and strategies for assignments",
    color: "bg-warning/10",
    iconColor: "text-warning",
    postType: "discussion",
    title: "Tips for [Assignment/Topic]",
    body: `## Overview

Brief description of the assignment.

## Tips

1. **Start early** — 
2. **Understand the requirements** — 
3. **Break it down** — 

## Common Mistakes to Avoid

- 

## Resources

- `,
  },
  {
    id: "event_announcement",
    icon: CalendarDays,
    label: "Event Announcement",
    description: "Promote an upcoming campus event",
    color: "bg-success/10",
    iconColor: "text-success",
    postType: "event",
    title: "🎉 [Event Name]",
    body: `**Date:** 
**Time:** 
**Location:** 

## About the Event

Describe what the event is about.

## Who Should Attend

- 

## What to Expect

- 

## Registration

How to register or participate.`,
  },
  {
    id: "club_update",
    icon: Users,
    label: "Club Update",
    description: "Share news and updates from your club",
    color: "bg-primary/10",
    iconColor: "text-primary",
    postType: "club_update",
    title: "[Club Name] Update",
    body: `## What's New

- 

## Upcoming Activities

- 

## Meeting Schedule

- 

## How to Join

Information for new members.`,
  },
  {
    id: "research_article",
    icon: FlaskConical,
    label: "Research Article",
    description: "Share findings from a research project",
    color: "bg-accent/10",
    iconColor: "text-accent",
    postType: "research",
    title: "Research: [Title]",
    body: `## Abstract

Brief summary of the research.

## Background

Context and motivation.

## Methodology

How the research was conducted.

## Key Findings

1. 
2. 
3. 

## Conclusion

Summary and implications.`,
  },
  {
    id: "campus_news",
    icon: Newspaper,
    label: "Campus News",
    description: "Report on campus happenings and news",
    color: "bg-success/10",
    iconColor: "text-success",
    postType: "news",
    title: "[Headline]",
    body: `**Published:** 

## Summary

Brief overview of the news.

## Details

Full story here.

## Impact

Why this matters to students.

## What's Next

Follow-up information.`,
  },
  {
    id: "scholarship_announcement",
    icon: GraduationCap,
    label: "Scholarship",
    description: "Announce scholarship opportunities",
    color: "bg-primary/10",
    iconColor: "text-primary",
    postType: "achievement",
    title: "💰 [Scholarship Name]",
    body: `## Eligibility

- 

## Amount

How much is the award.

## Deadline

When to apply.

## How to Apply

Step-by-step instructions.

## Contact

Where to get more information.`,
  },
  {
    id: "project_showcase",
    icon: FolderKanban,
    label: "Project Showcase",
    description: "Showcase a completed or ongoing project",
    color: "bg-accent/10",
    iconColor: "text-accent",
    postType: "discussion",
    title: "Project: [Title]",
    body: `## Overview

What the project is about.

## Problem

What problem does it solve?

## Solution

How the project addresses the problem.

## Tech Stack / Tools

- 

## Results

Outcomes and metrics.

## Team

Credits to collaborators.`,
  },
  {
    id: "podcast_episode",
    icon: Mic,
    label: "Podcast Episode",
    description: "Announce a new podcast episode",
    color: "bg-warning/10",
    iconColor: "text-warning",
    postType: "discussion",
    title: "🎙️ New Episode: [Episode Title]",
    body: `## Episode Summary

Brief description of what this episode covers.

## Key Topics

- 
- 
- 

## Guest

Guest information if applicable.

## Listen

Where to find the episode.

## Discussion

What are your thoughts? Share below!`,
  },
];

/**
 * CreatorTemplates — reusable templates section for Creator Studio.
 * Each template creates a draft QuadPost pre-filled with structured content.
 */
export default function CreatorTemplates({ user }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selected, setSelected] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [publishing, setPublishing] = useState(false);

  function selectTemplate(tpl) {
    setSelected(tpl);
    setDraftTitle(tpl.title);
    setDraftBody(tpl.body);
  }

  async function publishDraft() {
    if (!user?.id) return;
    setPublishing(true);
    try {
      await base44.entities.QuadPost.create({
        content: `${draftTitle}\n\n${draftBody}`,
        author_name: user.full_name || user.email || "Creator",
        author_image: user.image || "",
        type: selected.postType,
        visibility: "campus",
        draft_status: "draft",
        tags: [selected.label.toLowerCase().replace(/\s+/g, "_")],
      });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
      toast({ title: "Draft created", description: "Review and publish from your posts." });
      setSelected(null);
      navigate("/creator-studio");
    } catch (err) {
      toast({ title: "Could not create draft", description: err.message, variant: "destructive" });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="glass-card p-3.5 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[12px] text-foreground/80 leading-relaxed">
          Templates auto-format your content with proven structures. Edit everything before publishing — they're starting points, not rigid formats.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {TEMPLATES.map((tpl, i) => (
          <motion.button
            key={tpl.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
            onClick={() => selectTemplate(tpl)}
            className="glass-card p-3 text-left spring-tap"
          >
            <div className={`w-9 h-9 rounded-[12px] ${tpl.color} flex items-center justify-center mb-2`}>
              <tpl.icon className={`w-4.5 h-4.5 ${tpl.iconColor}`} />
            </div>
            <p className="text-[12px] font-semibold text-foreground leading-tight">{tpl.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{tpl.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Editor sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 38 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-[600px] mx-auto liquid-mirror rounded-t-[28px] p-5 pb-8 max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-[10px] ${selected.color} flex items-center justify-center`}>
                    <selected.icon className={`w-4 h-4 ${selected.iconColor}`} />
                  </div>
                  <h3 className="text-[16px] font-bold text-foreground">{selected.label}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center spring-tap">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Title</label>
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="w-full mb-3 mt-1 px-3 py-2.5 rounded-[12px] bg-muted/40 border border-border/30 text-[13px] text-foreground focus:outline-none focus:border-primary/40"
              />

              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Content</label>
              <textarea
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                rows={14}
                className="w-full mt-1 mb-4 px-3 py-2.5 rounded-[12px] bg-muted/40 border border-border/30 text-[13px] text-foreground font-mono leading-relaxed focus:outline-none focus:border-primary/40 resize-none"
              />

              <div className="flex gap-2">
                <button onClick={() => setSelected(null)} className="flex-1 h-11 rounded-full bg-muted/50 text-[13px] font-semibold text-foreground spring-tap">
                  Cancel
                </button>
                <button
                  onClick={publishDraft}
                  disabled={publishing || !draftTitle.trim()}
                  className="flex-1 h-11 rounded-full bg-primary text-[13px] font-bold text-primary-foreground spring-tap disabled:opacity-50"
                >
                  {publishing ? "Creating…" : "Save as Draft"}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">Drafts appear in your Posts tab — review and publish when ready.</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}