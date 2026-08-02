import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * useCollaboration — manages collaborative collection data stored in
 * the metadata field of Highlight records. Only the collection owner
 * can modify collaboration data (enforced by Highlight RLS).
 *
 * Collaboration data shape (stored in metadata.collaboration):
 * {
 *   owner_id, owner_name, privacy,
 *   collaborators: [{ user_id, name, role, invited_at, image }],
 *   activity: [{ user_id, name, action, target, timestamp }],
 *   comments: [{ user_id, name, content, timestamp }]
 * }
 */
export function useCollaboration(folder, highlights, userId, userName) {
  const queryClient = useQueryClient();

  const folderItems = highlights.filter((h) => h.folder === folder);
  const collab = folderItems[0]?.metadata?.collaboration || null;
  const collaborators = collab?.collaborators || [];
  const activity = collab?.activity || [];
  const comments = collab?.comments || [];
  const privacy = collab?.privacy || "private";

  const _write = async (newData) => {
    if (folderItems.length === 0 || !userId) return;
    const merged = { ...collab, ...newData, owner_id: userId, owner_name: userName };
    await base44.entities.Highlight.updateMany(
      { folder, created_by_id: userId },
      { $set: { "metadata.collaboration": merged } }
    );
    queryClient.invalidateQueries({ queryKey: ["highlights"] });
  };

  const inviteCollaborator = async (user, role) => {
    const entry = {
      user_id: user.id,
      name: user.full_name || user.email || user.name || "Student",
      role,
      invited_at: new Date().toISOString(),
      image: user.image || "",
    };
    const newCollaborators = [...collaborators.filter((c) => c.user_id !== user.id), entry];
    const newActivity = [
      ...activity,
      { user_id: userId, name: userName || "You", action: "invited", target: entry.name, timestamp: new Date().toISOString() },
    ].slice(-50);

    await _write({ collaborators: newCollaborators, activity: newActivity });

    // Notify the invited user
    try {
      await base44.entities.Notification.create({
        title: "Collaboration invite",
        message: `You were invited to collaborate on "${folder}".`,
        type: "social",
        category: "social",
        user_id: user.id,
        link: `${window.location.origin}/highlights?collection=${encodeURIComponent(folder)}`,
        icon: "Users2",
        source: "highlights",
        action: "collaboration_invite",
      });
    } catch {}
  };

  const removeCollaborator = async (targetUserId) => {
    const removed = collaborators.find((c) => c.user_id === targetUserId);
    const newCollaborators = collaborators.filter((c) => c.user_id !== targetUserId);
    const newActivity = [
      ...activity,
      { user_id: userId, name: userName || "You", action: "removed", target: removed?.name || "collaborator", timestamp: new Date().toISOString() },
    ].slice(-50);
    await _write({ collaborators: newCollaborators, activity: newActivity });
  };

  const updateRole = async (targetUserId, role) => {
    const newCollaborators = collaborators.map((c) =>
      c.user_id === targetUserId ? { ...c, role } : c
    );
    await _write({ collaborators: newCollaborators });
  };

  const addComment = async (content) => {
    const newComment = {
      user_id: userId,
      name: userName || "You",
      content,
      timestamp: new Date().toISOString(),
    };
    const newComments = [...comments, newComment].slice(-100);
    const newActivity = [
      ...activity,
      { user_id: userId, name: userName || "You", action: "commented", target: content.slice(0, 40), timestamp: new Date().toISOString() },
    ].slice(-50);
    await _write({ comments: newComments, activity: newActivity });
  };

  const setPrivacy = async (newPrivacy) => {
    await _write({ privacy: newPrivacy });
  };

  return {
    collaborators,
    activity,
    comments,
    privacy,
    inviteCollaborator,
    removeCollaborator,
    updateRole,
    addComment,
    setPrivacy,
  };
}