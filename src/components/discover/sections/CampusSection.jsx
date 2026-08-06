import React from "react";
import { Building2, Users, Calendar, Package, ShoppingBag, Landmark, MessageSquare } from "lucide-react";
import { SectionTitle, ItemCard, EmptyHint } from "@/components/discover/DiscoverShared";

/**
 * CampusSection — everything happening inside the university, organized.
 * Official campus spaces first, then live announcements, events, lost & found.
 */
export default function CampusSection({ data }) {
  const posts = (data.quadPosts || []).slice(0, 4);
  const events = (data.events || []).slice(0, 3);
  const lost = (data.lostFound || []).slice(0, 2);

  const spaces = [
    { icon: Users, label: "Communities", subtitle: "Your digital campus", to: "/communities", color: "primary" },
    { icon: Users, label: "Clubs", subtitle: "Verified societies", to: "/clubs", color: "warning" },
    { icon: Calendar, label: "Events", subtitle: "What's happening", to: "/events", color: "information" },
    { icon: Package, label: "Lost & Found", subtitle: "Report & search", to: "/lost-found", color: "error" },
    { icon: ShoppingBag, label: "Marketplace", subtitle: "Campus businesses", to: "/marketplace", color: "warning" },
    { icon: Landmark, label: "Student Union", subtitle: "Your representatives", to: "/student-government", color: "primary" },
  ];

  const empty = !posts.length && !events.length && !lost.length;

  return (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={Building2} title="Campus" />
        <div className="px-5 space-y-2.5">
          {spaces.map((s) => <ItemCard key={s.to} icon={s.icon} title={s.label} subtitle={s.subtitle} to={s.to} color={s.color} />)}
        </div>
      </div>

      {posts.length > 0 && (
        <div>
          <SectionTitle title="Announcements" />
          <div className="px-5 space-y-2.5">
            {posts.map((p) => <ItemCard key={p.id} icon={MessageSquare} title={(p.content || "Campus post").slice(0, 70)} subtitle="Campus" to="/quad" color="primary" />)}
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div>
          <SectionTitle title="Events" />
          <div className="px-5 space-y-2.5">
            {events.map((e) => <ItemCard key={e.id} icon={Calendar} title={e.title} subtitle={e.date} to="/events" color="information" />)}
          </div>
        </div>
      )}

      {lost.length > 0 && (
        <div>
          <SectionTitle title="Lost & Found" />
          <div className="px-5 space-y-2.5">
            {lost.map((l) => <ItemCard key={l.id} icon={Package} title={l.title || l.item_name} subtitle={l.location} to="/lost-found" color="error" />)}
          </div>
        </div>
      )}

      {empty && (
        <EmptyHint icon={Building2} title="Your campus is waking up" desc="Announcements, events, and campus spaces will appear here as your university comes alive." />
      )}
    </div>
  );
}