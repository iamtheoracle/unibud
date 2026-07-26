import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const KEY = ["FriendRequest"];

/**
 * useFriends — the bidirectional social graph for UNIBUD.
 * Powers friends, friend requests, accept/decline, unfriend and block.
 * A single FriendRequest record represents the connection between two
 * people (requester = created_by_id, recipient = recipient_id).
 */
export function useFriends() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: requests = [] } = useQuery({
    queryKey: KEY,
    queryFn: () => base44.entities.FriendRequest.list(),
    enabled: !!user,
  });

  const meId = user?.id;
  const myName = user?.full_name || user?.preferred_name || "Someone";

  const friends = requests.filter((r) => r.status === "accepted" && (r.created_by_id === meId || r.recipient_id === meId));
  const incoming = requests.filter((r) => r.status === "pending" && r.recipient_id === meId);
  const outgoing = requests.filter((r) => r.status === "pending" && r.created_by_id === meId);
  const blocked = requests.filter((r) => r.status === "blocked" && r.created_by_id === meId);

  const isFriend = (uid) => friends.some((f) => f.created_by_id === uid || f.recipient_id === uid);
  const hasPending = (uid) => outgoing.some((r) => r.recipient_id === uid);
  const isBlocked = (uid) => blocked.some((r) => r.recipient_id === uid);

  const send = useMutation({
    mutationFn: ({ recipientId, recipientName, note }) =>
      base44.entities.FriendRequest.create({
        recipient_id: recipientId,
        recipient_name: recipientName,
        requester_name: myName,
        note: note || null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const respond = useMutation({
    mutationFn: ({ id, status }) => base44.entities.FriendRequest.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.FriendRequest.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const block = useMutation({
    mutationFn: ({ recipientId, recipientName }) =>
      base44.entities.FriendRequest.create({
        recipient_id: recipientId,
        recipient_name: recipientName,
        requester_name: myName,
        status: "blocked",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return {
    meId,
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
    loading: send.isPending || respond.isPending,
  };
}