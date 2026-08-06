import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Newspaper } from "lucide-react";
import ScreenShell from "@/components/layout/ScreenShell";

/**
 * News — campus and external news feed.
 * Surfaces ExternalContent items tagged as news articles.
 */
export default function News() {
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["news-feed"],
    queryFn: () =>
      base44.entities.ExternalContent.filter(
        { content_type: "article" },
        "-created_date",
        40,
      ).catch(() => []),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <ScreenShell title="News">
      <div className="flex flex-col gap-3 px-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center">
              <Newspaper className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-[15px] font-semibold text-foreground">No news yet</p>
            <p className="text-[13px] text-muted-foreground max-w-xs">
              Campus and external news articles will appear here when published.
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              className="rounded-[18px] border border-border/40 bg-card p-4 flex flex-col gap-1.5"
            >
              <p className="text-[14px] font-semibold text-foreground line-clamp-2">
                {article.title || "Untitled"}
              </p>
              {article.summary && (
                <p className="text-[12px] text-muted-foreground line-clamp-3">
                  {article.summary}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {article.source_name || "Campus News"} ·{" "}
                {article.published_date
                  ? new Date(article.published_date).toLocaleDateString()
                  : ""}
              </p>
            </div>
          ))
        )}
      </div>
    </ScreenShell>
  );
}
