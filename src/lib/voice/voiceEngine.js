import { VOICE_PERSONALITIES, loadSettings, saveSettings } from "./voiceSettings";

/**
 * VoiceEngine — singleton managing speech recognition, synthesis, VAD, and wake word.
 *
 * Browser-native APIs:
 *  - Web Speech API (SpeechRecognition) → streaming STT
 *  - speechSynthesis → low-latency TTS with instant barge-in via cancel()
 *  - AudioContext + AnalyserNode → voice activity detection + waveform data
 *
 * States: idle → listening → thinking → speaking → idle
 * Modes: push-to-talk | hands-free | continuous
 */
class VoiceEngine {
  constructor() {
    this.state = "idle";
    this.transcript = "";
    this.interimTranscript = "";
    this.audioLevel = 0;
    this.settings = loadSettings();
    this.listeners = new Set();

    this.recognition = null;
    this.synthesis = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.audioContext = null;
    this.analyser = null;
    this.micStream = null;
    this.rafId = null;
    this.currentUtterance = null;
    this.shouldRestart = false;
    this.isListeningActive = false;
    this.wakeWordRecognition = null;
    this._finalBuffer = "";

    this.isSupported = this._checkSupport();
    this.voices = [];
    this._loadVoices();
  }

  _checkSupport() {
    return (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) &&
      !!window.speechSynthesis
    );
  }

  _loadVoices() {
    if (!this.synthesis) return;
    this.voices = this.synthesis.getVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => {
        this.voices = this.synthesis.getVoices();
      };
    }
  }

  // ── Event system ──

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _emit(event, data) {
    this.listeners.forEach((fn) => fn(event, data));
  }

  _setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    this._emit("state", newState);
  }

  _setTranscript(text, isInterim) {
    if (isInterim) {
      this.interimTranscript = text;
      this._emit("interim", text);
    } else {
      this.transcript = text;
      this._emit("transcript", text);
    }
  }

  _setAudioLevel(level) {
    this.audioLevel = level;
    this._emit("audioLevel", level);
  }

  updateSettings(partial) {
    this.settings = { ...this.settings, ...partial };
    saveSettings(this.settings);
    this._emit("settings", this.settings);
  }

  // ── Speech Recognition (STT) ──

  _createRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = this.settings.language || "en-US";
    return rec;
  }

  startListening() {
    if (!this.isSupported || this.isListeningActive) return;

    // Barge-in: stop TTS if currently speaking
    if (this.state === "speaking") this.stopSpeaking();

    const rec = this._createRecognition();
    if (!rec) return;
    this.recognition = rec;
    this.isListeningActive = true;
    this.shouldRestart = this.settings.mode === "continuous" || this.settings.mode === "hands-free";
    this._finalBuffer = "";

    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          this._finalBuffer += chunk;
        } else {
          interim += chunk;
        }
      }

      // Wake word stripping
      let displayInterim = interim;
      let displayFinal = this._finalBuffer;
      const fullText = (displayFinal + " " + interim).toLowerCase();
      if (this.settings.wakeWordEnabled && fullText.includes("hey bud")) {
        displayInterim = interim.replace(/hey bud[,]?\s*/gi, "");
        displayFinal = displayFinal.replace(/hey bud[,]?\s*/gi, "").trim();
      }

      if (displayInterim) this._setTranscript(displayInterim, true);

      if (displayFinal.trim()) {
        const finalText = displayFinal.trim();
        this._finalBuffer = "";
        this._setTranscript(finalText, false);
        this._emit("final", finalText);

        if (this.settings.mode === "push-to-talk") {
          this.stopListening();
        }
      }
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        this._emit("error", "Microphone access denied");
      }
      this.isListeningActive = false;
    };

    rec.onend = () => {
      if (this.shouldRestart && (this.state === "listening" || this.state === "idle")) {
        try {
          rec.start();
        } catch {}
      } else {
        this.isListeningActive = false;
        if (this.state === "listening") this._setState("idle");
        this._stopAudioAnalysis();
      }
    };

    try {
      rec.start();
      this._setState("listening");
      this._startAudioAnalysis();
    } catch {}
  }

  stopListening() {
    this.shouldRestart = false;
    this.isListeningActive = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    this._stopAudioAnalysis();
    if (this.state === "listening") this._setState("idle");
  }

  // ── Speech Synthesis (TTS) ──

  _selectVoice() {
    const personality =
      VOICE_PERSONALITIES.find((p) => p.id === this.settings.personality) ||
      VOICE_PERSONALITIES[0];
    for (const hint of personality.hints) {
      const lower = hint.toLowerCase();
      const match = this.voices.find(
        (v) =>
          v.name.toLowerCase().includes(lower) ||
          v.lang.toLowerCase().includes(lower)
      );
      if (match) return match;
    }
    return (
      this.voices.find((v) => v.lang === this.settings.language) ||
      this.voices[0] ||
      null
    );
  }

  _getEffectiveRate() {
    let rate = this.settings.rate;
    if (this.settings.whisperMode) rate *= 0.85;
    return Math.max(0.5, Math.min(2.0, rate));
  }

  _getEffectivePitch() {
    let pitch = this.settings.pitch;
    if (this.settings.whisperMode) pitch *= 0.9;
    return Math.max(0, Math.min(2.0, pitch));
  }

  _getEffectiveVolume() {
    let vol = this.settings.volume;
    if (this.settings.whisperMode) vol *= 0.45;
    if (this.settings.muted) vol = 0;
    return Math.max(0, Math.min(1.0, vol));
  }

  async speak(text) {
    if (this.settings.muted || !this.synthesis || !text.trim()) return;

    // Stop listening while speaking (prevents echo from TTS audio)
    this.stopListening();
    this.stopSpeaking();
    this._setState("speaking");

    // Chunk by sentence for streaming feel + barge-in between sentences
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      if (this.state !== "speaking") break; // barge-in detected
      await this._speakChunk(trimmed);
    }

    if (this.state === "speaking") {
      this._setState("idle");
      this._emit("spoken");
    }
  }

  _speakChunk(text) {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        resolve();
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      const voice = this._selectVoice();
      if (voice) u.voice = voice;
      u.rate = this._getEffectiveRate();
      u.pitch = this._getEffectivePitch();
      u.volume = this._getEffectiveVolume();
      u.onend = resolve;
      u.onerror = resolve;
      this.currentUtterance = u;
      this.synthesis.speak(u);
    });
  }

  stopSpeaking() {
    if (this.synthesis) this.synthesis.cancel();
    this.currentUtterance = null;
    if (this.state === "speaking") this._setState("idle");
  }

  // ── Audio Analysis (VAD + Waveform) ──

  async _startAudioAnalysis() {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.micStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      const tick = () => {
        if (!this.analyser || this.state !== "listening") {
          this._setAudioLevel(0);
          return;
        }
        this.analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        this._setAudioLevel(Math.min(1, rms * 3));
        this.rafId = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Mic access denied or not supported — waveform degrades to synthetic
    }
  }

  _stopAudioAnalysis() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.analyser = null;
    this._setAudioLevel(0);
  }

  // ── Mute ──

  setMuted(muted) {
    this.updateSettings({ muted });
    if (muted) {
      this.stopSpeaking();
      this.stopListening();
    }
    this._emit("muted", muted);
  }

  // ── Wake Word ("Hey Bud") ──

  startWakeWord() {
    if (!this.isSupported || !this.settings.wakeWordEnabled) return;
    if (this.wakeWordRecognition) return;

    const rec = this._createRecognition();
    if (!rec) return;
    this.wakeWordRecognition = rec;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .toLowerCase();
      if (text.includes("hey bud")) {
        this._emit("wake");
        this.stopWakeWord();
        this.startListening();
      }
    };

    rec.onend = () => {
      if (this.settings.wakeWordEnabled && this.state === "idle") {
        try {
          rec.start();
        } catch {}
      }
    };

    rec.onerror = () => {
      if (this.settings.wakeWordEnabled) {
        setTimeout(() => {
          try {
            rec.start();
          } catch {}
        }, 2000);
      }
    };

    try {
      rec.start();
    } catch {}
  }

  stopWakeWord() {
    if (this.wakeWordRecognition) {
      try {
        this.wakeWordRecognition.stop();
      } catch {}
      this.wakeWordRecognition = null;
    }
  }

  destroy() {
    this.stopListening();
    this.stopSpeaking();
    this.stopWakeWord();
    this._stopAudioAnalysis();
  }
}

export const voiceEngine = new VoiceEngine();