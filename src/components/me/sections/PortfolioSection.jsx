import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Briefcase, ChevronRight, FileText, FolderOpen } from "lucide-react";
import DocumentLibrary from "@/components/me/DocumentLibrary";

export default function PortfolioSection({ user, isOwnProfile }) {
  const navigate = useNavigate();

  const { data: portfolio = [], isLoading } = useQuery({
    queryKey: ["me", "portfolio"],
    queryFn: () => base44.entities.PortfolioItem.list("-created_date", 50),
  });

  const tools = [
    { label: "Resume Builder", to: "/cv-builder", icon: Briefcase },
    { label: "Full Portfolio", to: "/portfolio", icon: FileText },
  ];

  return (
    <div className="space-y-4">
      {/* Tools */}
      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.label}
            onClick={() => navigate(tool.to)}
            className="flex items-center gap-2.5 p-3 rounded-[16px] bg-card shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="w-8 h-8 rounded-[12px] bg-chocolate/10 flex items-center justify-center flex-shrink-0">
              <tool.icon className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
            </div>
            <span className="text-[12px] font-bold text-foreground flex-1 text-left">{tool.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
          </button>
        ))}
      </div>

      {/* Portfolio items */}
      <div>
        <h3 className="text-[13px] font-bold text-foreground tracking-tight mb-2.5 px-1">Portfolio Items</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-[16px] bg-card shadow-sm animate-pulse" />)}
          </div>
        ) : portfolio.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <div className="w-14 h-14 rounded-[18px] bg-muted flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} />
            </div>
            <p className="text-[13px] text-muted-foreground">No portfolio items</p>
            <p className="text-[11px] text-muted-foreground/70">Add projects to showcase your work</p>
          </div>
        ) : (
          <div className="space-y-2">
            {portfolio.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate("/portfolio")}
                className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
              >
                <div className="w-10 h-10 rounded-[12px] bg-chocolate/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4.5 h-4.5 text-chocolate" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground truncate">{p.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{p.description || p.type || "Portfolio"}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Document library */}
      <DocumentLibrary />
    </div>
  );
}