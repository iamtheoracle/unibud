import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Plus, Gamepad2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";
import GamesCategoryGrid from "@/components/games/GamesCategoryGrid";
import GameRoomCard from "@/components/games/GameRoomCard";
import TournamentCard from "@/components/games/TournamentCard";
import ChallengeCard from "@/components/games/ChallengeCard";
import LeaderboardPreview from "@/components/games/LeaderboardPreview";
import CreateGameRoomSheet from "@/components/games/CreateGameRoomSheet";
import GamesSectionHeader from "@/components/games/GamesSectionHeader";
import GameEmptyState from "@/components/games/GameEmptyState";

const EASE = [0.16, 1, 0.3, 1];

export default function GamesHub() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 120000,
  });

  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ["game-rooms-active"],
    queryFn: () => base44.entities.GameRoom.list("-created_date", 30),
    staleTime: 30000,
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ["tournaments-active"],
    queryFn: () => base44.entities.GameTournament.filter({ status: "registration" }, "-created_date", 10),
    staleTime: 60000,
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ["challenges-active"],
    queryFn: () => base44.entities.GameChallenge.filter({ status: "active" }, "-created_date", 10),
    staleTime: 60000,
  });

  const { data: matches = [] } = useQuery({
    queryKey: ["matches-completed"],
    queryFn: () => base44.entities.GameMatch.filter({ status: "completed" }, "-completed_at", 100),
    staleTime: 60000,
  });

  const leaderboard = useMemo(() => {
    const wins = {};
    const info = {};
    matches.forEach((m) => {
      if (m.winner_id) wins[m.winner_id] = (wins[m.winner_id] || 0) + 1;
      m.participants?.forEach((p) => {
        if (!info[p.user_id]) info[p.user_id] = { name: p.name, image: p.image };
      });
    });
    return Object.entries(wins)
      .map(([userId, w]) => ({ user_id: userId, name: info[userId]?.name || "Player", image: info[userId]?.image, wins: w }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 5);
  }, [matches]);

  const filteredRooms = selectedCategory ? rooms.filter((r) => r.game_type === selectedCategory) : rooms;
  const activeRooms = filteredRooms.filter((r) => r.status !== "completed" && r.status !== "cancelled");

  const handleJoin = async (room) => {
    if (!user) return;
    const participants = room.participants || [];
    const hasJoined = participants.some((p) => p.user_id === user.id);
    try {
      const updated = hasJoined
        ? participants.filter((p) => p.user_id !== user.id)
        : [...participants, { user_id: user.id, name: user.full_name, image: user.data?.avatar_url, is_online: true, status: "joined" }];
      await base44.entities.GameRoom.update(room.id, { participants: updated });
      toast({ title: hasJoined ? "Left room" : "Joined room!" });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto pb-32">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl safe-area-pt">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg grid place-items-center bg-muted/40">
              <Gamepad2 className="w-4 h-4 text-foreground" strokeWidth={1.8} />
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-foreground">Games</h1>
          </div>
          <button
            onClick={() => { hapticTap(); setShowCreate(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background text-[12px] font-semibold spring-tap"
          >
            <Plus className="w-3.5 h-3.5" /> Create
          </button>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-6">
        {/* Category grid */}
        <div>
          <GamesSectionHeader title="Browse Games" />
          <GamesCategoryGrid selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Active rooms */}
        <div>
          <GamesSectionHeader title="Active Rooms" action={activeRooms.length > 0 ? "See All" : null} />
          <AnimatePresence mode="wait">
            {activeRooms.length === 0 ? (
              <GameEmptyState
                icon={Gamepad2}
                title="No active rooms"
                description={selectedCategory ? `No open ${selectedCategory.replace(/_/g, " ")} rooms right now. Create one and invite friends!` : "No open game rooms right now. Create the first one and invite friends to play!"}
                action={
                  <button onClick={() => { hapticTap(); setShowCreate(true); }} className="px-4 py-2 rounded-full bg-foreground text-background text-[12px] font-semibold spring-tap">
                    Create Room
                  </button>
                }
              />
            ) : (
              <motion.div
                key={selectedCategory || "all"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="space-y-2"
              >
                {activeRooms.map((room) => (
                  <GameRoomCard key={room.id} room={room} user={user} onJoin={handleJoin} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tournaments */}
        <div>
          <GamesSectionHeader title="Tournaments" action={tournaments.length > 0 ? "See All" : null} />
          {tournaments.length === 0 ? (
            <GameEmptyState icon={Plus} title="No tournaments yet" description="Universities and communities can organize chess tournaments, quiz competitions, coding contests, and more." />
          ) : (
            <div className="space-y-2">
              {tournaments.map((t) => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          )}
        </div>

        {/* Challenges */}
        <div>
          <GamesSectionHeader title="Challenges" action={challenges.length > 0 ? "See All" : null} />
          {challenges.length === 0 ? (
            <GameEmptyState icon={Plus} title="No active challenges" description="Communities can organize coding, study, reading, fitness, and photography challenges." />
          ) : (
            <div className="space-y-2">
              {challenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div>
          <GamesSectionHeader title="Leaderboard" />
          <LeaderboardPreview entries={leaderboard} />
        </div>
      </div>

      <CreateGameRoomSheet open={showCreate} onOpenChange={setShowCreate} user={user} />
    </div>
  );
}