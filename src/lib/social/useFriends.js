import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { resolveDisplayName } from "@/lib/userDisplayName";

const KEY = ["FriendRequest"];

/**
 * useFriends — the bidirectional social graph for UNIBUD.
 * A single FriendRequest record represents the connection between two
 * people (requester = created_by_id, recipient = recipient_id).
 *
 * Real-time: subscribes to FriendRequest events so BOTH users update
 * instantly — A sends, B sees the request live; B accepts, A sees the
 * friend appear live. No manual refresh required.
 */
function relationshipBetween(requests, meId, otherId) {
  return requests.find(
    (r) =>
      (r.created_by_id === meId && r.recipient_id === otherId) ||
      (r.created_by_id === otherId && r.recipient_id === meId)
  );
}

export function useFriends() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: requests = [] } = useQuery({
    queryKey: KEY,
    queryFn: () => base44.entities.FriendRequest.list(),
    enabled: !!user,
  });

  // Real-time sync — invalidate on any FriendRequest event so both sides refresh.
  useEffect(() => {
    if (!user) return;
    const unsubscribe = base44.entities.FriendRequest.subscribe(() => {
      qc.invalidateQueries({ queryKey: KEY });
    });
    return unsubscribe;
  }, [user, qc]);

  const meId = user?.id;
  const myName = resolveDisplayName(user);

  const friends = requests.filter((r) => r.status === "accepted" && (r.created_by_id === meId || r.recipient_id === meId));
  const incoming = requests.filter((r) => r.status === "pending" && r.recipient_id === meId);
  const outgoing = requests.filter((r) => r.status === "pending" && r.created_by_id === meId);
  const blocked = requests.filter((r) => r.status === "blocked" && r.created_by_id === meId);

  const isFriend = (uid) => friends.some((f) => f.created_by_id === uid || f.recipient_id === uid);
  const hasPending = (uid) => outgoing.some((r) => r.recipient_id === uid) || incoming.some((r) => r.created_by_id === uid);
  const isBlocked = (uid) => blocked.some((r) => r.recipient_id === uid);

  // Send request — dedupe so we never create a parallel record.
  const send = useMutation({
    mutationFn: async ({ recipientId, recipientName, note }) => {
      const existing = relationshipBetween(requests, meId, recipientId);
      if (existing) {
        if (existing.status === "blocked") throw new Error("Unblock this person first to connect.");
        throw new Error("A request or connection already exists with this person.");
      }
      return base44.entities.FriendRequest.create({
        recipient_id: recipientId,
        recipient_name: recipientName,
        requester_name: myName,
        note: note || null,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  // Accept / decline a request.
  const respond = useMutation({
    mutationFn: ({ id, status }) => base44.entities.FriendRequest.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  // Remove a relationship (unfriend / cancel request / unblock).
  const remove = useMutation({
    mutationFn: (id) => base44.entities.FriendRequest.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  // Block — always collapses any existing relationship into a single
  // blocked record owned by me (created_by_id === me), so the blocked
  // list stays accurate and no ghost friend persists.
  const block = useMutation({
    mutationFn: async ({ recipientId, recipientName }) => {
      const existing = relationshipBetween(requests, meId, recipientId);
      if (existing) await base44.entities.FriendRequest.delete(existing.id);
      return base44.entities.FriendRequest.create({
        recipient_id: recipientId,
        recipient_name: recipientName,
        requester_name: myName,
        status: "blocked",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    meId,
    myName,
    friends,
    incoming,
    outgoing,
    blocked,
    isFriend,
    hasPending,
    isBlocked,
    send: send.mutate,
    respond: respond.mutate,
    remove: remove.mutate,
    block: block.mutate,
    loading: send.isPending || respond.isPending || remove.isPending || block.isPending,
  };
}