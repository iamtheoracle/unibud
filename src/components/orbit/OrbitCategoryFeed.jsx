import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { matchesCategory } from "@/data/contentCategories";
import DiscoverySection from "@/components/discovery/DiscoverySection";
import EmptyState from "@/components/ui/EmptyState";
import { Sparkles, Users, Calendar, ShoppingBag, Newspaper } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const EMPTY_MESSAGES = {
  following: "Follow students, creators, and communities to see their posts here.",
  friends: "Add friends to see their activity in this feed.",
  academic: "Join study groups and course communities to see academic discussions here.",
  campus: "Campus updates, faculty news, and activities will appear here.",
  communities: "Be the first to create a community in this category.",
  events: "No upcoming events found. Check back soon or create one.",
  marketplace: "No listings yet. When students list items, they'll appear here.",
  news: "No news or announcements right now. Check back later.",
  music: "Start a music discussion or join a music community to fill this space.",
  sports: "Sports discussions and scores will show up here.",
  movies_tv: "Discuss movies and TV shows with your campus community.",
  gaming: "Gaming communities and discussions will appear here.",
  technology: "Tech discussions, AI, programming, and gadgets will show here.",
  business: "Jobs, internships, and entrepreneurship content will appear here.",
  fashion: "Campus fashion, designers, and lifestyle content will show here.",
  photography: "Photography communities and content will appear here.",
  faith: "Faith communities and inspirational content will appear here.",
  challenges: "Student challenges and competitions will appear here.",
};

/**
 * OrbitCategoryFeed — displays category-filtered real content.
 * Never generates fake data. Shows premium empty states when no content exists.
 */
export default function OrbitCategoryFeed({ category }) {
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["orbit-feed-posts"],
    queryFn: () => base44.entities.QuadPost.list("-created_date", 30),
    staleTime: 30000,
  });

  const { data: communities = [], isLoading: commLoading } = useQuery({
    queryKey: ["orbit-feed-communities"],
    queryFn: () => base44.entities.Community.list("-members_count", 20),
    staleTime: 60000,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["orbit-feed-events"],
    queryFn: () => base44.entities.CampusEvent.list("-date", 10),
    staleTime: 60000,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["orbit-feed-listings"],
    queryFn: () => base44.entities.MarketplaceListing.list("-created_date", 15),
    staleTime: 60000,
  });

  const sections = useMemo(() => {
    const result = [];

    if (category === "events") {
      if (events.length > 0) {
        result.push({ id: "events", title: "Upcoming Events", type: "event", items: events });
      }
    } else if (category === "marketplace") {
      if (listings.length > 0) {
        result.push({ id: "marketplace", title: "Marketplace", type: "marketplace", items: listings });
      }
    } else if (category === "news") {
      const newsPosts = posts.filter((p) => p.type === "news");
      if (newsPosts.length > 0) {
        result.push({ id: "news", title: "News & Announcements", type: "post", items: newsPosts });
      }
    } else if (category === "communities") {
      if (communities.length > 0) {
        result.push({ id: "communities", title: "Communities", type: "community", items: communities });
      }
    } else if (category === "following" || category === "friends") {
      // Social graph filtering — show empty state until user builds their network
    } else {
      // Content categories: filter by matchesCategory
      const filteredPosts = posts.filter((p) => matchesCategory(p, category));
      const filteredCommunities = communities.filter((c) => matchesCategory(c, category));

      if (filteredCommunities.length > 0) {
        result.push({ id: "communities", title: "Communities", type: "community", items: filteredCommunities });
      }
      if (filteredPosts.length > 0) {
        result.push({ id: "posts", title: "Discussions", type: "post", items: filteredPosts });
      }
      if (category === "campus" && events.length > 0) {
        result.push({ id: "events", title: "Campus Events", type: "event", items: events });
      }
    }

    return result;
  }, [category, posts, communities, events, listings]);

  const isLoading = postsLoading || commLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40">
            <div className="h-4 w-1/3 shimmer rounded-full mb-3" />
            <div className="h-3 w-full shimmer rounded-full mb-2" />
            <div className="h-3 w-2/3 shimmer rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Nothing here yet"
        description={EMPTY_MESSAGES[category] || "Be the first to contribute to this category."}
      />
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section, i) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
        >
          <DiscoverySection {...section} />
        </motion.div>
      ))}
    </div>
  );
}