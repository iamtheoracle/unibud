import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileText, Trash2, Star, Loader2, Download } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function ResumeManager({ resumes, setResumes }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newResume = {
        url: file_url,
        name: file.name,
        uploadedAt: new Date().toISOString(),
        isDefault: resumes.length === 0,
      };
      const next = [...resumes, newResume];
      setResumes(next);
      localStorage.setItem("career_resumes", JSON.stringify(next));
      toast({ title: "Resume uploaded", description: file.name });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
    e.target.value = "";
  };

  const setDefault = (url) => {
    const next = resumes.map((r) => ({ ...r, isDefault: r.url === url }));
    setResumes(next);
    localStorage.setItem("career_resumes", JSON.stringify(next));
    toast({ title: "Default resume updated" });
  };

  const deleteResume = (url) => {
    const next = resumes.filter((r) => r.url !== url);
    if (next.length > 0 && !next.some((r) => r.isDefault)) next[0].isDefault = true;
    setResumes(next);
    localStorage.setItem("career_resumes", JSON.stringify(next));
    toast({ title: "Resume deleted" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[16px] font-bold text-foreground">My Resumes</h2>
          <p className="text-[11px] text-muted-foreground">Upload resumes to attach to applications</p>
        </div>
        <label className="px-3 py-2 rounded-[12px] bg-primary text-primary-foreground text-[11px] font-semibold spring-tap flex items-center gap-1.5 cursor-pointer">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "Uploading..." : "Upload"}
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {resumes.length === 0 ? (
        <div className="bg-card rounded-[20px] border border-border/40">
          <EmptyState
            icon={FileText}
            title="No resumes yet"
            description="Upload your resume to attach it to job and internship applications."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {resumes.map((resume, i) => (
            <motion.div
              key={resume.url}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`glass-card p-3 rounded-[16px] flex items-center gap-3 ${resume.isDefault ? "border-primary/30" : ""}`}
            >
              <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground truncate">{resume.name}</p>
                <p className="text-[9px] text-muted-foreground">
                  Uploaded {new Date(resume.uploadedAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                  {resume.isDefault && <span className="ml-1.5 text-primary font-bold">· DEFAULT</span>}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <a href={resume.url} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full flex items-center justify-center spring-tap hover:bg-muted/40">
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                </a>
                {!resume.isDefault && (
                  <button onClick={() => setDefault(resume.url)} className="w-7 h-7 rounded-full flex items-center justify-center spring-tap hover:bg-muted/40" aria-label="Set as default">
                    <Star className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
                <button onClick={() => deleteResume(resume.url)} className="w-7 h-7 rounded-full flex items-center justify-center spring-tap hover:bg-destructive/10" aria-label="Delete">
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}