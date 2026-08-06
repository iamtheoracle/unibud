import {
  Crown, Grid, Dice5, Type, Hash, Languages, HelpCircle, ClipboardList,
  Code2, Calculator, Atom, Keyboard, Brain, Puzzle, Gamepad2, Sparkles,
  BookOpen, Book, Dumbbell, Camera, MapPin, Lightbulb, MessageSquare,
} from "lucide-react";

export const GAME_TYPES = [
  { id: "chess", label: "Chess", Icon: Crown },
  { id: "checkers", label: "Checkers", Icon: Grid },
  { id: "ludo", label: "Ludo", Icon: Dice5 },
  { id: "scrabble", label: "Scrabble", Icon: Type },
  { id: "sudoku", label: "Sudoku", Icon: Hash },
  { id: "word_games", label: "Word Games", Icon: Languages },
  { id: "trivia", label: "Trivia", Icon: HelpCircle },
  { id: "quiz", label: "Quiz", Icon: ClipboardList },
  { id: "coding", label: "Coding", Icon: Code2 },
  { id: "math", label: "Math", Icon: Calculator },
  { id: "science", label: "Science", Icon: Atom },
  { id: "typing", label: "Typing Race", Icon: Keyboard },
  { id: "memory", label: "Memory", Icon: Brain },
  { id: "puzzle", label: "Puzzle", Icon: Puzzle },
  { id: "esports", label: "Esports", Icon: Gamepad2 },
  { id: "other", label: "Other", Icon: Sparkles },
];

export const CHALLENGE_TYPES = [
  { id: "coding", label: "Coding", Icon: Code2 },
  { id: "study", label: "Study", Icon: BookOpen },
  { id: "reading", label: "Reading", Icon: Book },
  { id: "fitness", label: "Fitness", Icon: Dumbbell },
  { id: "photography", label: "Photography", Icon: Camera },
  { id: "campus", label: "Campus", Icon: MapPin },
  { id: "quiz", label: "Quiz", Icon: HelpCircle },
  { id: "innovation", label: "Innovation", Icon: Lightbulb },
  { id: "debate", label: "Debate", Icon: MessageSquare },
  { id: "other", label: "Other", Icon: Sparkles },
];

export const LEADERBOARD_TIMEFRAMES = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "semester", label: "Semester" },
  { id: "all_time", label: "All Time" },
];

export const LEADERBOARD_SCOPES = [
  { id: "university", label: "University" },
  { id: "faculty", label: "Faculty" },
  { id: "department", label: "Department" },
  { id: "community", label: "Community" },
  { id: "friends", label: "Friends" },
];

export const ROOM_VISIBILITY = [
  { id: "public", label: "Public" },
  { id: "private", label: "Private" },
  { id: "university", label: "University" },
  { id: "community", label: "Community" },
  { id: "friends", label: "Friends Only" },
];

export const TOURNAMENT_STATUS = {
  registration: { label: "Registration Open", color: "text-success" },
  ongoing: { label: "Live Now", color: "text-warning" },
  completed: { label: "Completed", color: "text-muted-foreground" },
  cancelled: { label: "Cancelled", color: "text-destructive" },
};

export function getGameType(id) {
  return GAME_TYPES.find((g) => g.id === id) || GAME_TYPES[GAME_TYPES.length - 1];
}

export function getChallengeType(id) {
  return CHALLENGE_TYPES.find((c) => c.id === id) || CHALLENGE_TYPES[CHALLENGE_TYPES.length - 1];
}