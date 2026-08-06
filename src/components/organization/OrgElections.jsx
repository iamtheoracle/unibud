import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Vote, Plus, Check, Clock, Trophy, Users } from "lucide-react";
import { isOfficer, timeAgo } from "./orgConstants";
import EmptyState from "@/components/ui/EmptyState";

export default function OrgElections({ club, user }) {
  const officer = isOfficer(club.members, user?.id);
  const [composing, setComposing] = useState(false);

  return (
    <div className="space-y-3">
      {officer && (
        <button onClick={() => setComposing(!composing)} className="w-full flex items-center justify-center gap-2 p-3 rounded-[16px] bg-primary/10 text-primary spring-tap">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-[13px] font-semibold">Create Election</span>
        </button>
      )}

      {composing && <ElectionComposer club={club} user={user} onClose={() => setComposing(false)} />}

      <ElectionList club={club} user={user} />
    </div>
  );
}

function ElectionList({ club, user }) {
  const { data: elections, isLoading } = useQuery({
    queryKey: ["org-elections", club.id],
    queryFn: () => base44.entities.ClubElection.filter({ club_id: club.id }, "-created_date", 30),
  });

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 rounded-[16px] shimmer" />)}</div>;
  if (!elections || elections.length === 0) return <EmptyState icon={Vote} title="No elections yet" description="Club elections will appear here when created." />;

  return elections.map((el) => <ElectionCard key={el.id} election={el} user={user} club={club} />);
}

function ElectionCard({ election, user, club }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [votedFor, setVotedFor] = useState(null);
  const hasVoted = (election.votes || []).some((v) => v.voter_id === user?.id);
  const isOpen = election.status === "voting";
  const myVote = (election.votes || []).find((v) => v.voter_id === user?.id);

  const vote = async (candidateId) => {
    if (hasVoted || !isOpen) return;
    setVotedFor(candidateId);
    const voteObj = { voter_id: user.id, candidate_id: candidateId, voted_at: new Date().toISOString() };
    await base44.entities.ClubElection.update(election.id, {
      votes: [...(election.votes || []), voteObj],
      total_votes_cast: (election.total_votes_cast || 0) + 1,
    });
    qc.invalidateQueries({ queryKey: ["org-elections", club.id] });
    toast({ title: "Vote cast!", description: "Your vote has been recorded." });
  };

  const results = (election.candidates || []).map((c) => ({
    ...c,
    count: (election.votes || []).filter((v) => v.candidate_id === c.user_id).length,
  })).sort((a, b) => b.count - a.count);

  const statusBadge = {
    upcoming: { label: "Upcoming", color: "text-warning bg-warning/10" },
    voting: { label: "Voting Open", color: "text-success bg-success/10" },
    closed: { label: "Closed", color: "text-muted-foreground bg-muted" },
    cancelled: { label: "Cancelled", color: "text-error bg-error/10" },
  }[election.status];

  return (
    <div className="p-3.5 rounded-[18px] bg-card soft-shadow">
      <div className="flex items-center gap-2 mb-2">
        <Vote className="w-4 h-4 text-primary" />
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge.color}`}>{statusBadge.label}</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(election.created_date)}</span>
      </div>
      <p className="text-[14px] font-bold text-foreground">{election.title}</p>
      <p className="text-[12px] text-primary font-semibold mb-3">Position: {election.position}</p>

      {election.description && <p className="text-[12px] text-muted-foreground mb-3">{election.description}</p>}

      {/* Candidates */}
      <div className="space-y-2">
        {results.map((c, i) => {
          const pct = election.total_votes_cast > 0 ? Math.round((c.count / election.total_votes_cast) * 100) : 0;
          const isWinner = election.status === "closed" && results[0]?.user_id === c.user_id && c.count > 0;
          return (
            <div key={c.user_id} className="relative">
              <div className="flex items-center gap-2.5 p-2.5 rounded-[12px] bg-background">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">{(c.name || "?")[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-foreground flex items-center gap-1">
                    {c.name}
                    {isWinner && <Trophy className="w-3 h-3 text-gold" />}
                  </p>
                  {c.manifesto && <p className="text-[10px] text-muted-foreground line-clamp-1">{c.manifesto}</p>}
                </div>
                {isOpen && !hasVoted && (
                  <button onClick={() => vote(c.user_id)} className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold spring-tap">Vote</button>
                )}
                {(hasVoted || !isOpen) && (
                  <span className="text-[12px] font-bold text-foreground">{c.count}</span>
                )}
              </div>
              {(hasVoted || !isOpen) && (
                <div className="h-1 rounded-full bg-muted mt-1 mx-2.5 overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              )}
              {votedFor === c.user_id && <p className="text-[10px] text-success mt-1 ml-2.5">Your vote ✓</p>}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border/40">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Users className="w-3 h-3" />{election.total_votes_cast} votes</span>
        {hasVoted && <span className="flex items-center gap-1 text-[10px] text-success"><Check className="w-3 h-3" />You voted</span>}
        {election.end_date && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-3 h-3" />Ends {new Date(election.end_date).toLocaleDateString()}</span>}
      </div>
    </div>
  );
}

function ElectionComposer({ club, user, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("");
  const [desc, setDesc] = useState("");
  const [candidates, setCandidates] = useState([{ name: "", user_id: "", manifesto: "" }]);

  const addCandidate = () => setCandidates([...candidates, { name: "", user_id: "", manifesto: "" }]);
  const updateC = (i, field, val) => setCandidates((cs) => cs.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  const removeC = (i) => setCandidates((cs) => cs.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!title.trim() || !position.trim() || candidates.filter((c) => c.name.trim()).length < 2) return;
    const validCandidates = candidates.filter((c) => c.name.trim()).map((c) => ({ user_id: c.user_id || c.name, name: c.name.trim(), image: "", manifesto: c.manifesto.trim(), year: "" }));
    await base44.entities.ClubElection.create({
      club_id: club.id,
      club_name: club.name,
      title: title.trim(),
      description: desc.trim(),
      position: position.trim(),
      status: "voting",
      candidates: validCandidates,
      votes: [],
      total_votes_cast: 0,
      created_by_name: user.full_name,
      created_by_id: user.id,
      institution_id: club.institution_id,
    });
    await base44.entities.Notification.create({
      title: `${club.name}: Election Open`,
      message: `Voting is now open for ${position.trim()}. Cast your vote!`,
      type: "social", category: "social", source: `club:${club.id}`, link: `/organization/${club.id}`,
      priority: "high",
    });
    qc.invalidateQueries({ queryKey: ["org-elections", club.id] });
    toast({ title: "Election created", description: "Members notified." });
    onClose();
  };

  return (
    <div className="p-3.5 rounded-[18px] bg-card soft-shadow space-y-3">
      <p className="text-[13px] font-bold text-foreground">Create Election</p>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Election title..." className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[13px] font-semibold focus:outline-none focus:border-primary/40" />
      <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Position (e.g. President)..." className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[13px] focus:outline-none focus:border-primary/40" />
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description..." rows={2} className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[12px] focus:outline-none focus:border-primary/40 resize-none" />
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground">Candidates</p>
        {candidates.map((c, i) => (
          <div key={i} className="flex gap-2">
            <input value={c.name} onChange={(e) => updateC(i, "name", e.target.value)} placeholder="Candidate name..." className="flex-1 px-3 py-2 rounded-[12px] bg-background border border-border text-[12px] focus:outline-none focus:border-primary/40" />
            <button onClick={() => removeC(i)} className="w-9 h-9 rounded-[12px] bg-error/10 text-error flex items-center justify-center spring-tap">✕</button>
          </div>
        ))}
        <button onClick={addCandidate} className="text-[12px] text-primary font-semibold spring-tap">+ Add candidate</button>
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-[12px] bg-muted text-muted-foreground text-[13px] font-semibold spring-tap">Cancel</button>
        <button onClick={submit} className="flex-1 py-2.5 rounded-[12px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">Create</button>
      </div>
    </div>
  );
}