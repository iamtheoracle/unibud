import React, { useState } from "react";
import { Bell, Gem, Plus } from "lucide-react";
import { Image } from "@/components/ui/image";
import ForYouCard from "@/components/discover/ForYouCard";

const EASE = [0.16, 1, 0.3, 1];

const DEMO_PROFILES = [
  {
    id: "p1",
    name: "Roselyn Archer",
    age: 27,
    location: "Paris, France",
    bio: "Art & Design student",
    image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80",
  },
  {
    id: "p2",
    name: "Pam Okonkwo",
    age: 24,
    location: "Lagos, Nigeria",
    bio: "Computer Science · 400L",
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
  },
  {
    id: "p3",
    name: "Adaeze Eze",
    age: 21,
    location: "University of Benin",
    bio: "Medicine & Surgery",
    image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
  },
  {
    id: "p4",
    name: "Chidi Marcus",
    age: 23,
    location: "Accra, Ghana",
    bio: "Engineering student",
    image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
  },
];

/**
 * ForYouFeed — social discovery dashboard with story avatars,
 * "For you" card feed, and bottom navigation. Matches the reference.
 */
export default function ForYouFeed({ onMessage }) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[3vh] pb-3 safe-area-pt">
        <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
          <Plus className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2.5">
          <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
            <Gem className="w-[18px] h-[18px]" style={{ color: "#FFD700" }} />
          </button>
          <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap relative">
            <Bell className="w-[18px] h-[18px] text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
          </button>
        </div>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-3 px-5 py-3 overflow-x-auto no-scrollbar">
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="w-[56px] h-[56px] rounded-full border-[1.5px] border-dashed border-muted-foreground/30 flex items-center justify-center glass">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Add</span>
        </div>
        {DEMO_PROFILES.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-[56px] h-[56px] rounded-full overflow-hidden ring-2 ring-primary/20">
              <Image src={p.image_url} alt={p.name} fittingType="fill" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium max-w-[56px] truncate">
              {p.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-2">
        <h2 className="font-heading font-bold text-[18px] text-foreground">For you</h2>
        <button className="text-[13px] text-muted-foreground font-medium spring-tap">See all</button>
      </div>

      {/* Card feed */}
      <div className="flex-1 px-5 pb-24 space-y-5">
        {DEMO_PROFILES.map((profile, i) => (
          <ForYouCard
            key={profile.id}
            profile={profile}
            index={i}
            onMessage={onMessage}
          />
        ))}
      </div>
    </div>
  );
}