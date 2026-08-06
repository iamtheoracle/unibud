export const DISCUSSION_TYPES = [
  { id: "none", label: "None", emoji: "" },
  { id: "question", label: "Question", emoji: "❓" },
  { id: "insight", label: "Insight", emoji: "💡" },
  { id: "tip", label: "Tip", emoji: "📌" },
  { id: "explanation", label: "Explanation", emoji: "📖" },
  { id: "related_resource", label: "Related", emoji: "🔗" },
  { id: "warning", label: "Warning", emoji: "⚠️" },
  { id: "recommendation", label: "Recommendation", emoji: "⭐" },
];

export function getDiscussionType(typeId) {
  return DISCUSSION_TYPES.find((t) => t.id === typeId) || DISCUSSION_TYPES[0];
}