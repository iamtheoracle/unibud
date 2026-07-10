import {
  MessageCircle, Users, GraduationCap, BookOpen, Building2, School,
  Trophy, FlaskConical, Calendar, Award, Briefcase, Mail, Video,
  Phone, FileText, Image as ImageIcon, Mic, MapPin, User as UserIcon,
  Link as LinkIcon, File, Headphones, Archive, Pin, BellOff,
  Check, CheckCheck, Clock, BarChart3,
} from "lucide-react";

export const CONVERSATION_TYPES = {
  direct: { label: "Direct", icon: MessageCircle, color: "217 91% 60%" },
  group: { label: "Group", icon: Users, color: "263 71% 50%" },
  study_group: { label: "Study Group", icon: BookOpen, color: "142 71% 45%" },
  course: { label: "Course", icon: BookOpen, color: "263 71% 50%" },
  department: { label: "Department", icon: School, color: "38 92% 50%" },
  faculty: { label: "Faculty", icon: Building2, color: "217 91% 60%" },
  club: { label: "Club", icon: Trophy, color: "263 71% 50%" },
  project_team: { label: "Project Team", icon: FlaskConical, color: "142 71% 45%" },
  event_team: { label: "Event Team", icon: Calendar, color: "0 72% 51%" },
  competition_team: { label: "Competition", icon: Award, color: "263 71% 50%" },
  mentor: { label: "Mentor", icon: Briefcase, color: "142 71% 45%" },
  lecturer: { label: "Lecturer", icon: GraduationCap, color: "217 91% 60%" },
  alumni: { label: "Alumni", icon: Users, color: "263 71% 50%" },
};

export const MESSAGE_TYPES = {
  text: { label: "Text", icon: MessageCircle },
  image: { label: "Photo", icon: ImageIcon },
  video: { label: "Video", icon: Video },
  document: { label: "Document", icon: FileText },
  audio: { label: "Audio", icon: Headphones },
  voice_note: { label: "Voice Note", icon: Mic },
  file: { label: "File", icon: File },
  link: { label: "Link", icon: LinkIcon },
  location: { label: "Location", icon: MapPin },
  contact: { label: "Contact", icon: UserIcon },
  system: { label: "System", icon: Mail },
  poll: { label: "Poll", icon: BarChart3 },
};

export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "👏", "🔥", "✅"];

export const FILE_ICONS = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  ppt: FileText,
  pptx: FileText,
  xls: FileText,
  xlsx: FileText,
  txt: FileText,
  zip: File,
  rar: File,
  default: File,
};

export function getFileIcon(fileName) {
  if (!fileName) return File;
  const ext = fileName.split(".").pop()?.toLowerCase();
  return FILE_ICONS[ext] || File;
}

export function getFileTypeLabel(fileName) {
  if (!fileName) return "File";
  const ext = fileName.split(".").pop()?.toLowerCase();
  const labels = {
    pdf: "PDF", doc: "DOC", docx: "DOCX", ppt: "PPT", pptx: "PPTX",
    xls: "XLS", xlsx: "XLSX", txt: "TXT", zip: "ZIP", rar: "RAR",
    mp4: "Video", mov: "Video", avi: "Video", webm: "Video",
    mp3: "Audio", wav: "Audio", ogg: "Audio", m4a: "Audio",
    jpg: "Image", jpeg: "Image", png: "Image", gif: "Image", webp: "Image",
    py: "Python", js: "JavaScript", ts: "TypeScript", java: "Java",
    cpp: "C++", c: "C", html: "HTML", css: "CSS", json: "JSON",
  };
  return labels[ext] || ext?.toUpperCase() || "File";
}

export function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ":" + secs.toString().padStart(2, "0");
}

export function formatMessageTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const sameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const hours = date.getHours();
  const mins = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  if (sameDay) return displayHours + ":" + mins + " " + ampm;
  if (isYesterday) return "Yesterday";
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;

  if (diff < 60 * 1000) return "now";
  if (diff < 60 * 60 * 1000) return Math.floor(diff / (60 * 1000)) + "m";
  if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / (60 * 60 * 1000)) + "h";
  if (diff < 7 * 24 * 60 * 60 * 1000) return Math.floor(diff / (24 * 60 * 60 * 1000)) + "d";
  if (diff < 30 * 24 * 60 * 60 * 1000) return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + "w";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateDivider(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  return new Date(date1).toDateString() === new Date(date2).toDateString();
}

export function getConversationDisplayTitle(conversation, currentUserId) {
  if (conversation.title) return conversation.title;
  if (conversation.type === "direct" && conversation.participants) {
    const other = conversation.participants.find((p) => p.user_id !== currentUserId);
    if (other) return other.name;
  }
  return "Conversation";
}

export function getConversationDisplayImage(conversation, currentUserId) {
  if (conversation.avatar_url) return conversation.avatar_url;
  if (conversation.type === "direct" && conversation.participants) {
    const other = conversation.participants.find((p) => p.user_id !== currentUserId);
    if (other?.image) return other.image;
  }
  return "";
}

export function getOtherParticipant(conversation, currentUserId) {
  if (!conversation?.participants) return null;
  return conversation.participants.find((p) => p.user_id !== currentUserId);
}

export function getLastMessagePreview(conversation) {
  const lm = conversation.last_message;
  if (!lm) return "No messages yet";
  const typeLabel = {
    image: "📷 Photo",
    video: "🎥 Video",
    voice_note: "🎤 Voice note",
    audio: "🎵 Audio",
    document: "📄 Document",
    file: "📎 File",
    link: "🔗 Link",
    location: "📍 Location",
    contact: "👤 Contact",
    system: lm.content,
    poll: "📊 Poll",
  };
  return typeLabel[lm.type] || lm.content || "";
}

export function hasUnreadMessages(conversation, currentUserId) {
  if (!conversation.participants) return false;
  const participant = conversation.participants.find((p) => p.user_id === currentUserId);
  if (!participant?.last_read_at) return !!conversation.last_message_at;
  return new Date(conversation.last_message_at || 0) > new Date(participant.last_read_at);
}

export const ARCHIVE_ICON = Archive;
export const MUTE_ICON = BellOff;
export const PIN_ICON = Pin;
export const READ_ICONS = { sent: Check, delivered: Check, read: CheckCheck };
export const CLOCK_ICON = Clock;
export const PHONE_ICON = Phone;
export const VIDEO_ICON = Video;