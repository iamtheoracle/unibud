import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, X, FileText, Image as ImageIcon, Mic, Link2, Users, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import {
  getConversationDisplayTitle, getConversationDisplayImage, CONVERSATION_TYPES,
} from "./messagingConstants";

const EASE = [0.16, 1, 0.3, 1];

/**
 * OrbitMessageSearch — universal chat search overlay.
 * Searches messages, people, communities, files, links, photos, voice notes.
 */
export default function OrbitMessageSearch({ open, onClose, conversations, user, onSelectConversation }) {
  const [query, setQuery] = useState("");

  const { data: messages = [], isLoading: loadingMsgs } = useQuery({
    queryKey: ["msg-search", query, user?.id],
    queryFn: async () => {
      if (!query.trim() || !user) return [];
      return base44.entities.Message.filter(
        { content: { $regex: query, $options: "i" } },
        "-created_date",
        15
      );
    },
    enabled: !!open && query.trim().length >= 2,
  });

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    const people = conversations.filter((c) => {
      const other = c.participants?.find((p) => p.user_id !== user?.id);
      return other?.name?.toLowerCase().includes(q);
    });
    const communities = conversations.filter((c) =>
      c.type !== "direct" && getConversationDisplayTitle(c, user?.id).toLowerCase().includes(q)
    );
    const files = messages.filter((m) => ["document", "file", "image", "video", "voice_note", "audio"].includes(m.type));
    const links = messages.filter((m) => m.type === "link" || m.link_preview);
    const photos = messages.filter((m) => m.type === "image");
    const voiceNotes = messages.filter((m) => m.type === "voice_note");

    return { people, communities, messages: messages.slice(0, 8), files, links, photos, voiceNotes };
  }, [query, conversations, messages, user]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-background"
        >
          {/* Search header */}
          <div className="flex items-center gap-3 px-4 pt-[3.5vh] pb-3 safe-area-pt border-b border-border/20">
            <div className="flex-1 glass rounded-full h-[42px] flex items-center px-4 gap-2.5">
              <Search className="w-[17px] h-[17px] text-muted-foreground flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages, people, files…"
                className="flex-1 bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground/60"
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery("")} className="w-5 h-5 flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <button onClick={onClose} className="text-[13px] font-semibold text-muted-foreground spring-tap">Cancel</button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {!query.trim() ? (
              <SearchSuggestions />
            ) : loadingMsgs ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-[13px] text-muted-foreground">Searching…</span>
              </div>
            ) : results && (
              <div className="space-y-5">
                {results.people.length > 0 && (
                  <ResultSection title="People" icon={MessageCircle} count={results.people.length}>
                    {results.people.map((c) => (
                      <SearchResultRow key={c.id} conversation={c} user={user} onClick={() => { onSelectConversation(c.id); onClose(); }} />
                    ))}
                  </ResultSection>
                )}
                {results.communities.length > 0 && (
                  <ResultSection title="Communities" icon={Users} count={results.communities.length}>
                    {results.communities.map((c) => (
                      <SearchResultRow key={c.id} conversation={c} user={user} onClick={() => { onSelectConversation(c.id); onClose(); }} />
                    ))}
                  </ResultSection>
                )}
                {results.messages.length > 0 && (
                  <ResultSection title="Messages" icon={Search} count={results.messages.length}>
                    {results.messages.map((m) => {
                      const conv = conversations.find((c) => c.id === m.conversation_id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => { if (conv) { onSelectConversation(conv.id); onClose(); } }}
                          className="w-full flex items-start gap-3 px-3 py-2.5 rounded-[14px] hover:bg-muted/40 spring-tap text-left"
                        >
                          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-[12px] font-bold text-foreground">
                            {(m.author_name || "?").charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[13px] font-semibold text-foreground truncate">{m.author_name}</span>
                              <span className="text-[10px] text-muted-foreground flex-shrink-0">{conv?.title || ""}</span>
                            </div>
                            <p className="text-[12px] text-muted-foreground truncate mt-0.5">{m.content}</p>
                          </div>
                        </button>
                      );
                    })}
                  </ResultSection>
                )}
                {results.files.length > 0 && (
                  <ResultSection title="Files" icon={FileText} count={results.files.length}>
                    {results.files.slice(0, 5).map((m) => (
                      <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[14px]">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-primary" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-medium text-foreground truncate block">{m.file_name || m.content || "File"}</span>
                          <span className="text-[11px] text-muted-foreground">{m.author_name}</span>
                        </div>
                      </div>
                    ))}
                  </ResultSection>
                )}
                {results.photos.length > 0 && (
                  <ResultSection title="Photos" icon={ImageIcon} count={results.photos.length}>
                    <div className="grid grid-cols-4 gap-1.5">
                      {results.photos.slice(0, 8).map((m) => (
                        <div key={m.id} className="aspect-square rounded-lg overflow-hidden bg-muted/30">
                          {m.media_url && <Image src={m.media_url} alt="" fittingType="fill" className="w-full h-full" />}
                        </div>
                      ))}
                    </div>
                  </ResultSection>
                )}
                {results.voiceNotes.length > 0 && (
                  <ResultSection title="Voice Notes" icon={Mic} count={results.voiceNotes.length}>
                    {results.voiceNotes.slice(0, 5).map((m) => (
                      <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[14px]">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Mic className="w-4 h-4 text-primary" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-medium text-foreground truncate block">Voice note</span>
                          <span className="text-[11px] text-muted-foreground">{m.author_name}</span>
                        </div>
                      </div>
                    ))}
                  </ResultSection>
                )}
                {results.links.length > 0 && (
                  <ResultSection title="Links" icon={Link2} count={results.links.length}>
                    {results.links.slice(0, 5).map((m) => (
                      <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[14px]">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Link2 className="w-4 h-4 text-primary" strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-medium text-foreground truncate block">{m.link_preview?.title || m.content}</span>
                          <span className="text-[11px] text-muted-foreground truncate block">{m.author_name}</span>
                        </div>
                      </div>
                    ))}
                  </ResultSection>
                )}
                {results.people.length === 0 && results.communities.length === 0 && results.messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Search className="w-8 h-8 text-muted-foreground/30 mb-3" strokeWidth={1.5} />
                    <p className="text-[14px] font-semibold text-foreground mb-1">No results found</p>
                    <p className="text-[12px] text-muted-foreground">Try a different search term.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchSuggestions() {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Quick Filters</p>
      {[
        { icon: MessageCircle, label: "Messages" },
        { icon: Users, label: "People & Communities" },
        { icon: FileText, label: "Documents & Files" },
        { icon: ImageIcon, label: "Photos" },
        { icon: Mic, label: "Voice Notes" },
        { icon: Link2, label: "Links" },
      ].map((item) => (
        <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] hover:bg-muted/40 spring-tap text-left">
          <div className="w-8 h-8 rounded-full glass flex items-center justify-center">
            <item.icon className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
          </div>
          <span className="text-[13px] font-medium text-foreground">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function ResultSection({ title, icon: Icon, count, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        <span className="text-[10px] text-muted-foreground/60">({count})</span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SearchResultRow({ conversation, user, onClick }) {
  const title = getConversationDisplayTitle(conversation, user?.id);
  const image = getConversationDisplayImage(conversation, user?.id);
  const typeMeta = CONVERSATION_TYPES[conversation.type] || CONVERSATION_TYPES.direct;
  const TypeIcon = typeMeta.icon;

  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] hover:bg-muted/40 spring-tap text-left">
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 rounded-full overflow-hidden">
          {image ? (
            <Image src={image} alt="" fittingType="fill" className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary text-[14px] font-bold text-foreground">
              {(title || "?").charAt(0)}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-semibold text-foreground truncate block">{title}</span>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <TypeIcon className="w-3 h-3" strokeWidth={2} /> {typeMeta.label}
        </span>
      </div>
    </button>
  );
}