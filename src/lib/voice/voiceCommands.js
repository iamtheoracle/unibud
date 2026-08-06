/**
 * Voice command parser — maps natural language to navigation actions or Bud prompts.
 * Returns { type, path } for navigation, { type, prompt } for Bud queries, or null
 * for conversational messages that should be sent directly to Bud.
 */
const COMMANDS = [
  // Navigation commands
  { patterns: [/open.*timetable|show.*timetable|my schedule|what.*class.*today/i], action: { type: "navigate", path: "/timetable" } },
  { patterns: [/open.*assignment|what.*due|due tomorrow|due today|what.*due/i], action: { type: "navigate", path: "/assignments" } },
  { patterns: [/open.*discover|find people|discover people/i], action: { type: "navigate", path: "/discover" } },
  { patterns: [/open.*quad|campus feed|show feed|open.*square/i], action: { type: "navigate", path: "/quad" } },
  { patterns: [/open.*notes|my notes/i], action: { type: "navigate", path: "/notes" } },
  { patterns: [/open.*project|my project/i], action: { type: "navigate", path: "/projects" } },
  { patterns: [/open.*exam|upcoming exam/i], action: { type: "navigate", path: "/exams" } },
  { patterns: [/open.*library|find book|library resource/i], action: { type: "navigate", path: "/library" } },
  { patterns: [/open.*event|campus event|show event/i], action: { type: "navigate", path: "/events" } },
  { patterns: [/open.*club|show club/i], action: { type: "navigate", path: "/clubs" } },
  { patterns: [/open.*market|marketplace/i], action: { type: "navigate", path: "/marketplace" } },
  { patterns: [/open.*wallet|my wallet/i], action: { type: "navigate", path: "/wallet" } },
  { patterns: [/open.*profile|my profile/i], action: { type: "navigate", path: "/me" } },
  { patterns: [/open.*setting/i], action: { type: "navigate", path: "/settings" } },
  { patterns: [/open.*calendar|show calendar/i], action: { type: "navigate", path: "/calendar" } },
  { patterns: [/open.*course|my course/i], action: { type: "navigate", path: "/courses" } },
  { patterns: [/go home|open.*home|take me home/i], action: { type: "navigate", path: "/home" } },
  { patterns: [/open.*connect|open.*message/i], action: { type: "navigate", path: "/connect" } },
  { patterns: [/open.*academic|academic hub/i], action: { type: "navigate", path: "/academics" } },
  { patterns: [/start.*study session|start.*pomodoro|study.*with me/i], action: { type: "navigate", path: "/study" } },
  { patterns: [/open.*scholarship|find scholarship/i], action: { type: "navigate", path: "/scholarships" } },
  { patterns: [/open.*opportunity|find internship|find job/i], action: { type: "navigate", path: "/opportunities" } },
  { patterns: [/open.*research/i], action: { type: "navigate", path: "/research" } },
  { patterns: [/open.*career/i], action: { type: "navigate", path: "/career" } },
  { patterns: [/open.*mentor|find mentor/i], action: { type: "navigate", path: "/mentorship" } },
  { patterns: [/open.*gpa|gpa calculator/i], action: { type: "navigate", path: "/gpa-calculator" } },
  { patterns: [/open.*map|campus map|find building/i], action: { type: "navigate", path: "/campus-map" } },
  { patterns: [/open.*notification/i], action: { type: "navigate", path: "/notifications" } },

  // Action commands — sent as prompts to Bud
  { patterns: [/summarize.*today.*class|summarize.*class/i], action: { type: "prompt", prompt: "Summarize today's classes for me." } },
  { patterns: [/create.*study group|start.*study group/i], action: { type: "prompt", prompt: "Help me create a study group." } },
  { patterns: [/summarize.*pdf|read.*pdf/i], action: { type: "prompt", prompt: "Help me summarize a PDF document." } },
  { patterns: [/call.*lecturer|call.*professor|contact.*lecturer/i], action: { type: "prompt", prompt: "I need to contact my lecturer. Can you help?" } },
  { patterns: [/post.*photo|share.*photo/i], action: { type: "prompt", prompt: "I want to post a photo to the campus feed." } },
  { patterns: [/read.*screen|read.*aloud|what.*on.*screen/i], action: { type: "prompt", prompt: "Read aloud what's on my current screen." } },
  { patterns: [/read.*notification/i], action: { type: "prompt", prompt: "Read my recent notifications aloud." } },
  { patterns: [/read.*assignment/i], action: { type: "prompt", prompt: "Read my assignment details aloud." } },
];

export function parseCommand(transcript) {
  const text = transcript.trim().toLowerCase();
  if (!text) return null;
  for (const cmd of COMMANDS) {
    for (const pattern of cmd.patterns) {
      if (pattern.test(text)) return cmd.action;
    }
  }
  return null;
}