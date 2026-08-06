import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { voiceEngine } from "./voiceEngine";
import { parseCommand } from "./voiceCommands";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import VoiceOverlay from "@/components/bud/VoiceOverlay";
import VoiceSettingsPanel from "@/components/bud/VoiceSettingsPanel";

const VoiceContext = createContext(null);

export function useVoice() {
  return useContext(VoiceContext);
}

/**
 * VoiceProvider — wraps the app with Bud's voice system.
 * Connects the voice engine to navigation (voice commands), BudSheet
 * (speak responses), and the full-screen VoiceOverlay.
 */
export function VoiceProvider({ children }) {
  const navigate = useNavigate();
  const { openWithPrompt, setOpen } = useBudLauncher();

  const [state, setState] = useState(voiceEngine.state);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [settings, setSettings] = useState(voiceEngine.settings);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const overlayOpenRef = useRef(false);
  overlayOpenRef.current = overlayOpen;

  // Ref-based handler — always has latest navigate/openWithPrompt without re-subscribing
  const handleFinalRef = useRef(() => {});
  handleFinalRef.current = (text) => {
    const command = parseCommand(text);
    if (command) {
      if (command.type === "navigate") {
        navigate(command.path);
        voiceEngine.speak("Opening that now.");
      } else if (command.type === "prompt") {
        setOpen(true);
        openWithPrompt(command.prompt);
      }
    } else {
      setOpen(true);
      openWithPrompt(text);
    }
  };

  // Subscribe to engine events — once
  useEffect(() => {
    const unsub = voiceEngine.subscribe((event, data) => {
      switch (event) {
        case "state":
          setState(data);
          break;
        case "transcript":
          setTranscript(data);
          break;
        case "interim":
          setInterim(data);
          break;
        case "audioLevel":
          setAudioLevel(data);
          break;
        case "settings":
          setSettings(data);
          break;
        case "final":
          handleFinalRef.current(data);
          break;
        case "wake":
          setOverlayOpen(true);
          break;
        case "spoken":
          if (
            voiceEngine.settings.mode === "continuous" &&
            overlayOpenRef.current
          ) {
            setTimeout(() => voiceEngine.startListening(), 300);
          }
          break;
        default:
          break;
      }
    });

    if (voiceEngine.settings.wakeWordEnabled) {
      voiceEngine.startWakeWord();
    }

    return () => {
      unsub();
      voiceEngine.stopWakeWord();
    };
  }, []);

  // Toggle wake word when setting changes
  const prevWakeEnabled = useRef(settings.wakeWordEnabled);
  useEffect(() => {
    if (settings.wakeWordEnabled !== prevWakeEnabled.current) {
      prevWakeEnabled.current = settings.wakeWordEnabled;
      if (settings.wakeWordEnabled) {
        voiceEngine.startWakeWord();
      } else {
        voiceEngine.stopWakeWord();
      }
    }
  }, [settings.wakeWordEnabled]);

  const startConversation = useCallback(() => {
    if (!voiceEngine.isSupported) return;
    setOverlayOpen(true);
    setInterim("");
    setTranscript("");
    voiceEngine.startListening();
  }, []);

  const stopConversation = useCallback(() => {
    voiceEngine.stopListening();
    setOverlayOpen(false);
  }, []);

  const speak = useCallback((text) => {
    voiceEngine.speak(text);
  }, []);

  const stopSpeaking = useCallback(() => {
    voiceEngine.stopSpeaking();
  }, []);

  const mute = useCallback(() => voiceEngine.setMuted(true), []);
  const unmute = useCallback(() => voiceEngine.setMuted(false), []);

  const updateSettings = useCallback(
    (partial) => voiceEngine.updateSettings(partial),
    []
  );

  const sendPrompt = useCallback(
    (text) => {
      setOverlayOpen(false);
      const command = parseCommand(text);
      if (command) {
        if (command.type === "navigate") {
          navigate(command.path);
          voiceEngine.speak("Opening that now.");
        } else if (command.type === "prompt") {
          setOpen(true);
          openWithPrompt(command.prompt);
        }
      } else {
        setOpen(true);
        openWithPrompt(text);
      }
    },
    [navigate, setOpen, openWithPrompt]
  );

  const value = {
    state,
    transcript,
    interim,
    audioLevel,
    settings,
    isSupported: voiceEngine.isSupported,
    overlayOpen,
    settingsOpen,
    startConversation,
    stopConversation,
    speak,
    stopSpeaking,
    mute,
    unmute,
    updateSettings,
    sendPrompt,
    setOverlayOpen,
    setSettingsOpen,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
      <VoiceOverlay />
      <VoiceSettingsPanel />
    </VoiceContext.Provider>
  );
}