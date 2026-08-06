import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { GAME_TYPES, ROOM_VISIBILITY } from "./gamesConstants";
import { hapticTap } from "@/lib/haptics";

/**
 * CreateGameRoomSheet — form for creating a new game room.
 */
export default function CreateGameRoomSheet({ open, onOpenChange, user }) {
  const [gameType, setGameType] = useState("chess");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [maxParticipants, setMaxParticipants] = useState(2);
  const [voiceChat, setVoiceChat] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: "Add a room title", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      await base44.entities.GameRoom.create({
        title: title.trim(),
        game_type: gameType,
        description: description.trim(),
        visibility,
        max_participants: Number(maxParticipants),
        voice_chat_enabled: voiceChat,
        status: "waiting",
        participants: [{
          user_id: user?.id,
          name: user?.full_name,
          image: user?.data?.avatar_url,
          is_online: true,
          status: "joined",
        }],
        institution_id: user?.data?.institution_id,
        university: user?.data?.university,
      });
      qc.invalidateQueries({ queryKey: ["game-rooms-active"] });
      toast({ title: "Room created!", description: "Invite friends to join." });
      onOpenChange(false);
      setTitle("");
      setDescription("");
    } catch {
      toast({ title: "Couldn't create room", variant: "destructive" });
    }
    setCreating(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[28px]">
        <SheetHeader>
          <SheetTitle>Create Game Room</SheetTitle>
          <SheetDescription>Start a match and invite friends to compete.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 pb-8">
          {/* Game type */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Game</p>
            <div className="grid grid-cols-4 gap-2">
              {GAME_TYPES.slice(0, 12).map((type) => {
                const Icon = type.Icon;
                const active = gameType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => { hapticTap(); setGameType(type.id); }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-[14px] spring-tap transition-all ${
                      active ? "glass-strong" : "glass"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-foreground" : "text-muted-foreground"}`} strokeWidth={1.8} />
                    <span className={`text-[8px] font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">Room Title</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chess Showdown"
              className="w-full px-3 py-2.5 rounded-2xl bg-card border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
            />
          </div>

          {/* Visibility */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Visibility</p>
            <div className="flex gap-1.5 flex-wrap">
              {ROOM_VISIBILITY.map((v) => {
                const active = visibility === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => { hapticTap(); setVisibility(v.id); }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold spring-tap ${
                      active ? "bg-foreground text-background" : "glass text-muted-foreground"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max participants */}
          <div className="flex items-center justify-between p-3 rounded-2xl glass-card">
            <div>
              <p className="text-[12px] font-medium text-foreground">Max Participants</p>
              <p className="text-[10px] text-muted-foreground">How many can join</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMaxParticipants(Math.max(2, maxParticipants - 1))} className="w-7 h-7 rounded-full glass grid place-items-center spring-tap">−</button>
              <span className="text-[14px] font-bold w-5 text-center tabular-nums">{maxParticipants}</span>
              <button onClick={() => setMaxParticipants(Math.min(16, maxParticipants + 1))} className="w-7 h-7 rounded-full glass grid place-items-center spring-tap">+</button>
            </div>
          </div>

          {/* Voice chat */}
          <div className="flex items-center justify-between p-3 rounded-2xl glass-card">
            <div>
              <p className="text-[12px] font-medium text-foreground">Voice Chat</p>
              <p className="text-[10px] text-muted-foreground">Enable voice during matches</p>
            </div>
            <Switch checked={voiceChat} onCheckedChange={(v) => { hapticTap(); setVoiceChat(v); }} />
          </div>

          {/* Create */}
          <button
            onClick={handleCreate}
            disabled={creating || !title.trim()}
            className="w-full py-3 rounded-2xl bg-foreground text-background text-[14px] font-bold spring-tap disabled:opacity-40"
          >
            {creating ? "Creating…" : "Create Room"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}