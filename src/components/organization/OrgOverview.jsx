import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, Calendar, Vote, Wallet, Pin, MessageSquare, FileText, FolderOpen } from "lucide-react";
import { formatCurrency, timeAgo, DISCUSSION_CATEGORIES } from "./orgConstants";

export default function OrgOverview({ club, user, onNavigate }) {
  const { data: discussions } = useQuery({
    queryKey: ["org-discussions", club.id],
    queryFn: () => base44.entities.ClubDiscussion.filter({ club_id: club.id }, "-created_date", 5),
  });
  const { data: events } = useQuery({
    queryKey: ["org-events", club.id],
    queryFn: () => base44.entities.CampusEvent.filter({ community_id: club.id }, "date", 3),
  });
  const { data: finances } = useQuery({
    queryKey: ["org-finance", club.id],
    queryFn: () => base44.entities.ClubFinance.filter({ club_id: club.id }, "-date", 100),
  });
  const { data: elections } = useQuery({
    queryKey: ["org-elections", club.id],
    queryFn: () => base44.entities.ClubElection.filter({ club_id: club.id }, "-created_date", 3),
  });
  const { data: files } = useQuery({
    queryKey: ["org-files", club.id],
    queryFn: () => base44.entities.StudyGroupResource.filter({ study_group_id: club.id }, "-created_date", 4),
  });

  const income = (finances || []).filter((f) => f.type === "income").reduce((s, f) => s + (f.amount || 0), 0);
  const expenses = (finances || []).filter((f) => f.type === "expense").reduce((s, f) => s + (f.amount || 0), 0);
  const balance = income - expenses;
  const activeElections = (elections || []).filter((e) => e.status === "voting");

  const pinned = (discussions || []).filter((d) => d.pinned).slice(0, 2);
  const recentDiscussions = (discussions || []).slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users} label="Members" value={club.members_count || 0} tint="bg-primary/10 text-primary" onClick={() => onNavigate("members")} />
        <StatCard icon={Calendar} label="Events" value={(events || []).length} tint="bg-information/10 text-information" onClick={() => onNavigate("events")} />
        <StatCard icon={Vote} label="Active Elections" value={activeElections.length} tint="bg-accent/10 text-accent" onClick={() => onNavigate("elections")} />
        <StatCard icon={Wallet} label="Balance" value={formatCurrency(balance, club.dues_currency)} tint="bg-success/10 text-success" onClick={() => onNavigate("finance")} />
      </div>

      {/* Pinned Announcements */}
      {pinned.length > 0 && (
        <div className="space-y-2">
          <SectionLabel icon={Pin}>Pinned</SectionLabel>
          {pinned.map((d) => <DiscussionPreview key={d.id} discussion={d} onClick={() => onNavigate("feed")} />)}
        </div>
      )}

      {/* Upcoming Events */}
      <div className="space-y-2">
        <SectionLabel icon={Calendar}>Upcoming Events</SectionLabel>
        {(events || []).length === 0 ? (
          <p className="text-[12px] text-muted-foreground px-1">No upcoming events scheduled.</p>
        ) : (
          (events || []).map((ev) => (
            <button key={ev.id} onClick={() => onNavigate("events")} className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card soft-shadow spring-tap text-left">
              <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{ev.title}</p>
                <p className="text-[11px] text-muted-foreground">{ev.date}{ev.start_time ? ` · ${ev.start_time}` : ""}</p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Recent Discussions */}
      <div className="space-y-2">
        <SectionLabel icon={MessageSquare}>Recent Discussions</SectionLabel>
        {recentDiscussions.length === 0 ? (
          <p className="text-[12px] text-muted-foreground px-1">No discussions yet. Start one in the Feed tab.</p>
        ) : (
          recentDiscussions.map((d) => <DiscussionPreview key={d.id} discussion={d} onClick={() => onNavigate("feed")} />)
        )}
      </div>

      {/* Shared Files */}
      <div className="space-y-2">
        <SectionLabel icon={FolderOpen}>Shared Files</SectionLabel>
        {(files || []).length === 0 ? (
          <p className="text-[12px] text-muted-foreground px-1">No shared files yet.</p>
        ) : (
          (files || []).map((f) => (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-[16px] bg-card soft-shadow">
              <div className="w-9 h-9 rounded-[12px] bg-accent/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{f.title}</p>
                <p className="text-[10px] text-muted-foreground uppercase">{f.file_type}</p>
              </div>
              {f.file_url && (
                <a href={f.file_url} target="_blank" rel="noreferrer" className="text-[11px] text-primary font-semibold spring-tap">Open</a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tint, onClick }) {
  return (
    <button onClick={onClick} className="p-3.5 rounded-[18px] bg-card soft-shadow spring-tap text-left">
      <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center mb-2 ${tint}`}>
        <Icon className="w-4 h-4" strokeWidth={2.2} />
      </div>
      <p className="text-[16px] font-bold text-foreground leading-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </button>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-1.5 px-1 pt-1">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{children}</span>
    </div>
  );
}

function DiscussionPreview({ discussion, onClick }) {
  const cat = DISCUSSION_CATEGORIES[discussion.category] || DISCUSSION_CATEGORIES.general;
  return (
    <button onClick={onClick} className="w-full p-3 rounded-[16px] bg-card soft-shadow spring-tap text-left">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] font-semibold ${cat.color}`}>{cat.label}</span>
        {discussion.pinned && <Pin className="w-3 h-3 text-primary" />}
      </div>
      <p className="text-[13px] font-semibold text-foreground line-clamp-1">{discussion.title}</p>
      <p className="text-[11px] text-muted-foreground line-clamp-1">{discussion.body}</p>
      <div className="flex items-center gap-3 mt-1.5">
        <span className="text-[10px] text-muted-foreground">{discussion.author_name}</span>
        <span className="text-[10px] text-muted-foreground">{timeAgo(discussion.created_date)}</span>
        {(discussion.replies || []).length > 0 && (
          <span className="text-[10px] text-muted-foreground">{discussion.replies.length} replies</span>
        )}
      </div>
    </button>
  );
}