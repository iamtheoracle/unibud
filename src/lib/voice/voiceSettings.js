/**
 * Voice personalities — map to browser TTS voice hints + rate/pitch presets.
 * Each personality has a distinct tone, gender, and speech cadence.
 */
export const VOICE_PERSONALITIES = [
  {
    id: "companion",
    name: "Companion",
    desc: "Warm, friendly student companion",
    gender: "neutral",
    hints: ["Samantha", "Victoria", "Google UK English Female", "female", "en"],
    rate: 1.0,
    pitch: 1.0,
  },
  {
    id: "mentor",
    name: "Mentor",
    desc: "Professional lecturer voice",
    gender: "male",
    hints: ["Daniel", "Google UK English Male", "Microsoft David", "male"],
    rate: 0.95,
    pitch: 0.9,
  },
  {
    id: "energetic",
    name: "Energetic",
    desc: "Youthful, bright, and upbeat",
    gender: "female",
    hints: ["Karen", "Google US English", "Tessa", "female"],
    rate: 1.1,
    pitch: 1.15,
  },
  {
    id: "calm",
    name: "Calm",
    desc: "Calm and neutral",
    gender: "neutral",
    hints: ["Alex", "Google UK English Male", "Fred"],
    rate: 0.92,
    pitch: 0.95,
  },
  {
    id: "scholar",
    name: "Scholar",
    desc: "Formal and authoritative",
    gender: "male",
    hints: ["Daniel", "Microsoft David", "Oliver", "male"],
    rate: 0.88,
    pitch: 0.85,
  },
];

export const VOICE_MODES = {
  PUSH_TO_TALK: "push-to-talk",
  HANDS_FREE: "hands-free",
  CONTINUOUS: "continuous",
};

export const VOICE_MODE_LABELS = {
  [VOICE_MODES.PUSH_TO_TALK]: "Push to Talk",
  [VOICE_MODES.HANDS_FREE]: "Hands Free",
  [VOICE_MODES.CONTINUOUS]: "Continuous",
};

const STORAGE_KEY = "bud_voice_settings";

export const DEFAULT_SETTINGS = {
  personality: "companion",
  mode: VOICE_MODES.PUSH_TO_TALK,
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  wakeWordEnabled: false,
  whisperMode: false,
  muted: false,
  autoSpeak: true,
  language: "en-US",
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}