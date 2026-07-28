import React, { useState } from "react";
import { Search, X, Loader2, UserPlus } from "lucide-react";
import { useStudentSearch } from "@/hooks/useStudentSearch";

export default function AssigneePicker({ university, selected, onChange }) {
  const [query, setQuery] = useState("");
  const [show, setShow] = useState(false);
  const { items, isFetching, hasNextPage, fetchNextPage } = useStudentSearch({
    university,
    query,
    enabled: show && query.trim().length > 0,
  });

  const add = (user) => {
    if (selected.find((s) => s.id === user.id)) return;
    onChange([...selected, { id: user.id, name: user.full_name || user.email || "User", image: user.avatar_url || user.image || "" }]);
  };
  const remove = (id) => onChange(selected.filter((s) => s.id !== id));

  return (
    <div>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-primary/12 text-primary text-[11px] font-medium">
              {s.image ? <img src={s.image} className="w-4 h-4 rounded-full object-cover" alt="" /> : <span className="w-4 h-4 rounded-full bg-primary/20 grid place-items-center text-[8px] font-bold">{(s.name || "U").charAt(0)}</span>}
              {s.name}
              <button onClick={() => remove(s.id)} className="ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query} onFocus={() => setShow(true)} onChange={(e) => { setQuery(e.target.value); setShow(true); }}
          placeholder="Search students to assign…"
          className="w-full h-10 pl-10 pr-3 rounded-xl bg-muted/40 border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {show && query.trim() && (
        <div className="mt-2 rounded-xl border border-border/60 bg-card max-h-[200px] overflow-y-auto no-scrollbar">
          {isFetching && <div className="flex items-center gap-2 px-3 py-3 text-[12px] text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin" />Searching…</div>}
          {!isFetching && items.length === 0 && <div className="px-3 py-3 text-[12px] text-muted-foreground">No matches.</div>}
          {items.map((u) => (
            <button key={u.id} onClick={() => { add(u); setQuery(""); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/50 spring-tap text-left">
              {u.avatar_url || u.image ? <img src={u.avatar_url || u.image} className="w-7 h-7 rounded-full object-cover" alt="" /> : <div className="w-7 h-7 rounded-full bg-primary/15 grid place-items-center text-[10px] font-bold text-primary">{(u.full_name || u.email || "U").charAt(0)}</div>}
              <div className="min-w-0">
                <div className="text-[12px] font-medium truncate">{u.full_name || u.email}</div>
                {u.email && u.full_name && <div className="text-[10px] text-muted-foreground truncate">{u.email}</div>}
              </div>
              <UserPlus className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />
            </button>
          ))}
          {hasNextPage && !isFetching && (
            <button onClick={() => fetchNextPage()} className="w-full px-3 py-2 text-[11px] text-primary font-semibold spring-tap">Load more</button>
          )}
        </div>
      )}
    </div>
  );
}