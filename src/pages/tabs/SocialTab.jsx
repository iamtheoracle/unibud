import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users, Store, Home, MessageCircle, CalendarDays, Compass,
  TrendingUp, Briefcase, Star, Newspaper, ChevronRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import QuadFeedProduction from "@/components/quad/QuadFeedProduction";
import { Image } from "@/components/ui/image";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const CATEGORIES = [
  { id: "foryou", label: "For You" },
  { id: "following", label: "Following" },
  { id: "campus", label: "Campus" },
  { id: "stories", label: "Stories" },
  { id: "clubs", label: "Clubs" },
  { id: "communities", label: "Communities" },
  { id: "events", label: "Events" },
  { id: "marketplace", label: "Marketplace" },
  { id: "housing", label: "Housing" },
  { id: "jobs", label: "Jobs" },
  { id: "creators", label: "Creators" },
  { id: "trending", label: "Trending" },
];

export default function SocialTab() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const [activeCategory, setActiveCategory] = useState("foryou");

  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ["social", "stories"],
    queryFn: () => base44.entities.Story.list("-created_date", 10),
    enabled: isOnline && activeCategory === "stories",
  });

  const { data: communities, isLoading: commLoading } = useQuery({
    queryKey: ["social", "communities"],
    queryFn: () => base44.entities.Community.list("-created_date", 10),
    enabled: isOnline && activeCategory === "communities",
  });

  const { data: clubs, isLoading: clubsLoading } = useQuery({
    queryKey: ["social", "clubs"],
    queryFn: () => base44.entities.Club.list("-created_date", 10),
    enabled: isOnline && activeCategory === "clubs",
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["social", "events"],
    queryFn: () => base44.entities.CampusEvent.list("-date", 10),
    enabled: isOnline && activeCategory === "events",
  });

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ["social", "marketplace"],
    queryFn: () => base44.entities.MarketplaceListing.list("-created_date", 10),
    enabled: isOnline && activeCategory === "marketplace",
  });

  const { data: opportunities, isLoading: jobsLoading } = useQuery({
    queryKey: ["social", "jobs"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 10),
    enabled: isOnline && activeCategory === "jobs",
  });

  const { data: posts, isLoading: trendingLoading } = useQuery({
    queryKey: ["social", "trending"],
    queryFn: () => base44.entities.QuadPost.filter({}, "-likes_count", 10),
    enabled: isOnline && activeCategory === "trending",
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["social"] });
  }, [queryClient]);

  const isLoading =
    (activeCategory === "stories" && storiesLoading) ||
    (activeCategory === "communities" && commLoading) ||
    (activeCategory === "clubs" && clubsLoading) ||
    (activeCategory === "events" && eventsLoading) ||
    (activeCategory === "marketplace" && listingsLoading) ||
    (activeCategory === "jobs" && jobsLoading) ||
    (activeCategory === "trending" && trendingLoading);

  const state = !isOnline ? "offline" : isLoading ? "loading" : "ready";

  return (
    <div className="max-w-[600px] mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-4 pt-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[24px] font-bold text-foreground tracking-tight">Social</h1>
          <button
            onClick={() => navigate("/messages")}
            className="w-9 h-9 rounded-full bg-card shadow-sm flex items-center justify-center active:scale-90 transition-transform"
          >
            <MessageCircle className="w-4.5 h-4.5 text-chocolate" strokeWidth={2} />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 h-8 rounded-full text-[12px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground shadow-sm"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3">
        {(activeCategory === "foryou" || activeCategory === "following" || activeCategory === "campus") && (
          <QuadFeedProduction
            onPostPress={(post) => navigate("/quad")}
            onProfilePress={(userId) => navigate(`/profile/${userId}`)}
            onCompose={() => navigate("/quad")}
          />
        )}

        {activeCategory === "stories" && (
          <ProductionState state={state} onRefresh={handleRefresh} skeleton={<GridSkeleton />}>
            {(stories?.length ?? 0) === 0 ? (
              <EmptyContent icon={Users} text="No stories yet" subtext="Stories from your campus will appear here" />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} onClick={() => navigate("/shorts")} />
                ))}
              </div>
            )}
          </ProductionState>
        )}

        {activeCategory === "clubs" && (
          <ProductionState state={state} onRefresh={handleRefresh} skeleton={<ListSkeleton />}>
            {(clubs?.length ?? 0) === 0 ? (
              <EmptyContent icon={Users} text="No clubs yet" subtext="Discover and join campus clubs" />
            ) : (
              <div className="space-y-2">
                {clubs.map((c) => (
                  <ListRow key={c.id} icon={Users} title={c.name} subtitle={c.description || `${c.members_count || 0} members`} onClick={() => navigate("/clubs")} />
                ))}
              </div>
            )}
          </ProductionState>
        )}

        {activeCategory === "communities" && (
          <ProductionState state={state} onRefresh={handleRefresh} skeleton={<ListSkeleton />}>
            {(communities?.length ?? 0) === 0 ? (
              <EmptyContent icon={Users} text="No communities yet" subtext="Join communities to connect with peers" />
            ) : (
              <div className="space-y-2">
                {communities.map((c) => (
                  <ListRow key={c.id} icon={Users} title={c.name} subtitle={c.description || `${c.members_count || 0} members`} onClick={() => navigate(`/community/${c.id}`)} />
                ))}
              </div>
            )}
          </ProductionState>
        )}

        {activeCategory === "events" && (
          <ProductionState state={state} onRefresh={handleRefresh} skeleton={<ListSkeleton />}>
            {(events?.length ?? 0) === 0 ? (
              <EmptyContent icon={CalendarDays} text="No upcoming events" subtext="Campus events will appear here" />
            ) : (
              <div className="space-y-2">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} onClick={() => navigate("/events")} />
                ))}
              </div>
            )}
          </ProductionState>
        )}

        {activeCategory === "marketplace" && (
          <ProductionState state={state} onRefresh={handleRefresh} skeleton={<GridSkeleton />}>
            {(listings?.length ?? 0) === 0 ? (
              <EmptyContent icon={Store} text="No listings yet" subtext="Browse items for sale on campus" />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} onClick={() => navigate("/marketplace")} />
                ))}
              </div>
            )}
          </ProductionState>
        )}

        {activeCategory === "housing" && (
          <EmptyContent icon={Home} text="No housing listings" subtext="Housing options will appear here" />
        )}

        {activeCategory === "jobs" && (
          <ProductionState state={state} onRefresh={handleRefresh} skeleton={<ListSkeleton />}>
            {(opportunities?.length ?? 0) === 0 ? (
              <EmptyContent icon={Briefcase} text="No job openings" subtext="Internships and jobs will appear here" />
            ) : (
              <div className="space-y-2">
                {opportunities.map((o) => (
                  <ListRow key={o.id} icon={Briefcase} title={o.title} subtitle={o.company || o.organization || "Opportunity"} onClick={() => navigate("/opportunities")} />
                ))}
              </div>
            )}
          </ProductionState>
        )}

        {activeCategory === "creators" && (
          <EmptyContent icon={Star} text="No creators yet" subtext="Creator profiles will appear here" />
        )}

        {activeCategory === "trending" && (
          <ProductionState state={state} onRefresh={handleRefresh} skeleton={<ListSkeleton />}>
            {(posts?.length ?? 0) === 0 ? (
              <EmptyContent icon={TrendingUp} text="No trending posts" subtext="Trending campus posts will appear here" />
            ) : (
              <div className="space-y-2">
                {posts.map((p) => (
                  <ListRow key={p.id} icon={TrendingUp} title={p.title || "Post"} subtitle={`${p.likes_count || 0} likes · ${p.comments_count || 0} comments`} onClick={() => navigate("/quad")} />
                ))}
              </div>
            )}
          </ProductionState>
        )}
      </div>
    </div>
  );
}

function StoryCard({ story, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative aspect-[9/16] rounded-[16px] overflow-hidden bg-card shadow-sm text-left"
    >
      {story.media_url || story.image_url ? (
        <Image src={story.media_url || story.image_url} alt="Story" fittingType="fill" className="w-full h-full" />
      ) : (
        <div className="w-full h-full bg-chocolate" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <p className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white truncate">
        {story.author_name || "Story"}
      </p>
    </motion.button>
  );
}

function ListRow({ icon: Icon, title, subtitle, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left"
    >
      <div className="w-10 h-10 rounded-[12px] bg-chocolate/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-chocolate" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground truncate">{title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
    </motion.button>
  );
}

function EventCard({ event, onClick }) {
  const d = event.date ? new Date(event.date) : null;
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left"
    >
      <div className="w-11 h-11 rounded-[12px] bg-chocolate flex flex-col items-center justify-center flex-shrink-0">
        {d && <span className="text-[8px] font-bold text-white/70 uppercase">{d.toLocaleDateString("en-US", { month: "short" })}</span>}
        {d && <span className="text-[14px] font-bold text-white">{d.getDate()}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground truncate">{event.title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{event.location || "Campus"}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
    </motion.button>
  );
}

function ListingCard({ listing, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-[16px] overflow-hidden bg-card shadow-sm text-left"
    >
      <div className="aspect-square bg-muted">
        {listing.image_url || listing.images?.[0] ? (
          <Image src={listing.image_url || listing.images[0]} alt={listing.title} fittingType="fill" className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store className="w-8 h-8 text-muted-foreground/40" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-[12px] font-bold text-foreground truncate">{listing.title}</p>
        <p className="text-[13px] font-bold text-primary mt-0.5">₦{Number(listing.price || 0).toLocaleString()}</p>
      </div>
    </motion.button>
  );
}

function EmptyContent({ icon: Icon, text, subtext }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16">
      <div className="w-14 h-14 rounded-[18px] bg-muted flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} />
      </div>
      <p className="text-[13px] text-muted-foreground">{text}</p>
      {subtext && <p className="text-[11px] text-muted-foreground/70">{subtext}</p>}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 rounded-[16px] bg-card shadow-sm animate-pulse" />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-square rounded-[16px] bg-card shadow-sm animate-pulse" />
      ))}
    </div>
  );
}