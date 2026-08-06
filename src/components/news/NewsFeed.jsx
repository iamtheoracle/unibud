import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Newspaper, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useNewsPreferences } from "@/hooks/useNewsPreferences";
import { NEWS_SUBCATEGORIES, matchSubcategory, normalizeArticle } from "./newsConstants";
import NewsSubcategoryBar from "./NewsSubcategoryBar";
import NewsManageSheet from "./NewsManageSheet";
import NewsFeaturedStory from "./NewsFeaturedStory";
import NewsCard from "./NewsCard";

const RECENT_KEY = "news_recent_searches";

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function addRecent(q) {
  const recent = getRecent().filter((s) => s !== q);
  recent.unshift(q);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 5))); } catch {}
}

export default function NewsFeed() {
  const { toast } = useToast();
  const prefs = useNewsPreferences();
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [activeSub, setActiveSub] = useState("all");
  const [showManage, setShowManage] = useState(false);
  const [recent, setRecent] = useState(getRecent());

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["news-feed"],
    queryFn: () => base44.entities.QuadPost.filter({ type: "news" }, "-created_date", 50),
    staleTime: 30000,
  });

  const articles = useMemo(() => posts.map(normalizeArticle), [posts]);

  const filtered = useMemo(() => {
    let list = articles;
    if (activeSub !== "all") {
      const sub = NEWS_SUBCATEGORIES.find((s) => s.id === activeSub);
      if (sub) {
        list = list.filter((a) => {
          const tags = (a.hashtags || []).map((t) => t.toLowerCase().replace("#", ""));
          return sub.tags.some((tag) => tags.includes(tag));
        });
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.body?.toLowerCase().includes(q) ||
          a.source?.toLowerCase().includes(q) ||
          (a.hashtags || []).some((h) => h.toLowerCase().includes(q))
      );
    }
    return list;
  }, [articles, activeSub, search]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const handleSave = async (article) => {
    try {
      await base44.entities.Highlight.create({
        content_type: "news_article",
        title: article.title,
        subtitle: article.source,
        source_url: article.url || "",
        source_name: article.source,
        image_url: article.image || "",
        folder: "Reading List",
        visibility: "private",
        tags: article.hashtags || [],
      });
      toast({ title: "Saved to Highlights" });
    } catch {
      toast({ title: "Couldn't save", variant: "destructive" });
    }
  };

  const handleShare = async (article) => {
    const url = article.url || `${window.location.origin}/quad`;
    if (navigator.share) {
      try { await navigator.share({ title: article.title, url }); } catch {}
    } else {
      navigator.clipboard?.writeText(url);
      toast({ title: "Link copied!" });
    }
  };

  const handleFollowTopic = (article) => {
    const sub = matchSubcategory(article);
    if (sub) prefs.toggleFollow(sub.id);
  };

  const submitSearch = (q) => {
    setSearch(q);
    setSearching(false);
    if (q.trim()) {
      addRecent(q.trim());
      setRecent(getRecent());
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 rounded-full glass shimmer" />
        <div className="rounded-[20px] overflow-hidden glass-card">
          <div className="aspect-[16/10] shimmer" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 shimmer rounded-full" />
            <div className="h-3 w-1/2 shimmer rounded-full" />
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[16px] glass-card p-3">
            <div className="aspect-[16/9] shimmer rounded-xl mb-2" />
            <div className="h-3 w-2/3 shimmer rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-20 px-6">
        <div className="w-20 h-20 rounded-full grid place-items-center mb-4 bg-primary/10">
          <Newspaper className="w-9 h-9 text-primary/50" strokeWidth={1.5} />
        </div>
        <p className="text-[15px] font-bold text-foreground">No news yet</p>
        <p className="text-[12px] text-muted-foreground mt-1.5 max-w-[280px] leading-relaxed">
          News, announcements, and updates from your campus will appear here. Follow topics to personalize your feed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full glass-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearching(true)}
            placeholder="Search headlines, topics, publishers..."
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="w-5 h-5 rounded-full grid place-items-center spring-tap">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Recent searches */}
        <AnimatePresence>
          {searching && !search && recent.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 right-0 mt-1 p-2 rounded-2xl glass-strong z-20"
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">Recent</p>
              {recent.map((q) => (
                <button key={q} onClick={() => submitSearch(q)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded-xl hover:bg-muted/30 spring-tap">
                  <Clock className="w-3 h-3 text-muted-foreground/60" />
                  <span className="text-[12px] text-foreground">{q}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subcategory bar */}
      <NewsSubcategoryBar
        active={activeSub}
        onSelect={setActiveSub}
        visibleSubcategories={prefs.visibleSubcategories}
        onManage={() => setShowManage(true)}
      />

      {/* Featured story */}
      {featured && !search && (
        <NewsFeaturedStory article={featured} onSave={handleSave} onShare={handleShare} />
      )}

      {/* Article cards */}
      {rest.length > 0 ? (
        <div className="space-y-3">
          {rest.map((article, i) => (
            <NewsCard
              key={article.id}
              article={article}
              index={i}
              onSave={handleSave}
              onShare={handleShare}
              onFollowTopic={handleFollowTopic}
            />
          ))}
        </div>
      ) : !featured && (
        <div className="flex flex-col items-center text-center py-12 px-6">
          <p className="text-[13px] font-bold text-foreground">No results</p>
          <p className="text-[11px] text-muted-foreground mt-1">Try a different search or topic.</p>
        </div>
      )}

      {/* Manage sheet */}
      <NewsManageSheet open={showManage} onClose={() => setShowManage(false)} preferences={prefs} />
    </div>
  );
}