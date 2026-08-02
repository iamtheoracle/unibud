import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Zap, ZapOff, Mic, MicOff, SwitchCamera,
  Sparkles, Palette, Sticker, Image as ImageIcon, Loader2, Radio,
} from "lucide-react";
import { hapticTap } from "@/lib/haptics";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import SmartCreationPanel from "./SmartCreationPanel";
import AudienceSelector from "./AudienceSelector";

const MODES = [
  { id: "story", label: "Story", maxDuration: 15 },
  { id: "post", label: "Post", maxDuration: 30 },
  { id: "short", label: "Short", maxDuration: 60 },
  { id: "live", label: "Live", maxDuration: 0 },
];

/**
 * OrbitCamera — native UNIBUD camera experience.
 * Full-screen viewfinder with floating glass controls, a spring
 * mode switcher capsule, and a capture button with ring fill.
 * After capture, opens the SmartCreationPanel bottom sheet.
 */
export default function OrbitCamera({ open, initialMode = "post", user, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [mode, setMode] = useState(initialMode);
  const [facing, setFacing] = useState("environment");
  const [flash, setFlash] = useState(false);
  const [audio, setAudio] = useState(true);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [audience, setAudience] = useState("campus");
  const [error, setError] = useState(null);
  const { uploadMedia, isUploading } = useMediaUpload();

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try { recorderRef.current.stop(); } catch {}
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setError(null);
    } catch {
      setError("Camera unavailable. Tap gallery to select from your photos.");
    }
  }, [facing]);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setCapturedMedia(null);
    setShowPanel(false);
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line
  }, [open]);

  useEffect(() => {
    if (open) startCamera();
    // eslint-disable-next-line
  }, [facing, open]);

  useEffect(() => {
    if (!showControls || recording || showPanel) return;
    hideTimerRef.current = setTimeout(() => setShowControls(false), 2000);
    return () => clearTimeout(hideTimerRef.current);
  }, [showControls, recording, showPanel]);

  const handleStopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      setRecording(false);
      setProcessing(true);
      recorderRef.current.stop();
    }
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  }, []);

  useEffect(() => {
    if (!recording) return;
    const max = MODES.find((m) => m.id === mode)?.maxDuration || 30;
    const startTime = Date.now();
    recordTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setRecordProgress(Math.min(elapsed / max, 1));
      if (elapsed >= max) handleStopRecording();
    }, 100);
    return () => clearInterval(recordTimerRef.current);
    // eslint-disable-next-line
  }, [recording, mode]);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext("2d");
    if (facing === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setCapturedMedia({ url, blob, type: "image" });
      setShowPanel(true);
    }, "image/jpeg", 0.92);
  };

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream) return;
    try {
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setCapturedMedia({ url, blob, type: "video" });
        setProcessing(false);
        setShowPanel(true);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setRecordProgress(0);
    } catch {
      setError("Recording not available on this device.");
    }
  };

  const handleCapture = () => {
    if (mode === "live") return;
    hapticTap();
    if (recording) {
      handleStopRecording();
    } else if (mode === "post") {
      capturePhoto();
    } else {
      startRecording();
    }
  };

  const handleGallerySelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("video/") ? "video" : "image";
    setCapturedMedia({ url, blob: file, type, file });
    setShowPanel(true);
    e.target.value = "";
  };

  const handleFlipCamera = () => {
    hapticTap();
    setFacing((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleTapScreen = (e) => {
    if (e.target === e.currentTarget || e.target.tagName === "VIDEO") {
      if (!showControls) {
        setShowControls(true);
        hapticTap();
      }
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black"
        >
          {/* Viewfinder */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onClick={handleTapScreen}
            className="w-full h-full object-cover"
            style={{ transform: facing === "user" ? "scaleX(-1)" : "none" }}
          />

          {/* Error fallback */}
          {error && !capturedMedia && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
              <p className="text-[14px] text-white/70 mb-4">{error}</p>
              <button onClick={() => galleryInputRef.current?.click()} className="px-5 py-2.5 rounded-full bg-white/10 text-white text-[13px] font-semibold spring-tap">
                Select from Gallery
              </button>
            </div>
          )}

          {/* Top-right floating controls */}
          <AnimatePresence>
            {showControls && !showPanel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-0 left-0 right-0 p-4 safe-area-pt z-10"
              >
                <div className="flex items-center justify-between">
                  <button onClick={onClose} className="w-9 h-9 rounded-full glass-strong grid place-items-center spring-tap">
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { hapticTap(); setFlash(!flash); }} className={"w-9 h-9 rounded-full grid place-items-center spring-tap " + (flash ? "glass-strong" : "glass")}>
                      {flash ? <Zap className="w-4 h-4 text-white" /> : <ZapOff className="w-4 h-4 text-white/60" />}
                    </button>
                    <button onClick={() => { hapticTap(); setAudio(!audio); }} className={"w-9 h-9 rounded-full grid place-items-center spring-tap " + (audio ? "glass-strong" : "glass")}>
                      {audio ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white/60" />}
                    </button>
                    <button onClick={handleFlipCamera} className="w-9 h-9 rounded-full glass-strong grid place-items-center spring-tap">
                      <SwitchCamera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                {/* Audience selector — floating glass pill */}
                {!recording && (
                  <div className="flex justify-center mt-3">
                    <AudienceSelector value={audience} onChange={(v) => { hapticTap(); setAudience(v); }} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom-right floating controls */}
          <AnimatePresence>
            {showControls && !showPanel && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute bottom-36 right-4 flex flex-col gap-2 z-10"
              >
                <button className="w-9 h-9 rounded-full glass-strong grid place-items-center spring-tap"><Sparkles className="w-4 h-4 text-white/70" /></button>
                <button className="w-9 h-9 rounded-full glass-strong grid place-items-center spring-tap"><Palette className="w-4 h-4 text-white/70" /></button>
                <button className="w-9 h-9 rounded-full glass-strong grid place-items-center spring-tap"><Sticker className="w-4 h-4 text-white/70" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gallery preview — bottom left */}
          <AnimatePresence>
            {showControls && !showPanel && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute bottom-36 left-4 z-10"
              >
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-12 h-12 rounded-2xl glass-strong overflow-hidden grid place-items-center spring-tap"
                >
                  <ImageIcon className="w-5 h-5 text-white/70" />
                </button>
                <input ref={galleryInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleGallerySelect} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode switcher + capture button */}
          <AnimatePresence>
            {showControls && !showPanel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 pb-8 safe-area-pb flex flex-col items-center gap-5 z-10"
              >
                {/* Mode capsule */}
                <div className="flex items-center gap-0.5 p-1 rounded-full glass-strong">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { hapticTap(); setMode(m.id); }}
                      className="relative px-4 py-1.5 rounded-full text-[11px] font-semibold spring-tap"
                    >
                      {mode === m.id && (
                        <motion.div
                          layoutId="camera-mode-pill"
                          className="absolute inset-0 rounded-full bg-white"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className={"relative z-10 " + (mode === m.id ? "text-black" : "text-white/50")}>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Capture button */}
                <button
                  onClick={handleCapture}
                  disabled={mode === "live" || processing}
                  className="relative w-[72px] h-[72px] grid place-items-center spring-tap disabled:opacity-40"
                >
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="33" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                    {recording && (
                      <circle
                        cx="36" cy="36" r="33" fill="none" stroke="white" strokeWidth="3"
                        strokeDasharray={2 * Math.PI * 33}
                        strokeDashoffset={2 * Math.PI * 33 * (1 - recordProgress)}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.1s linear" }}
                      />
                    )}
                  </svg>
                  <motion.div
                    animate={{ scale: recording ? 0.65 : 1, borderRadius: recording ? 8 : 999 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-[54px] h-[54px] bg-white grid place-items-center"
                  >
                    {processing ? (
                      <Loader2 className="w-5 h-5 text-black animate-spin" />
                    ) : recording ? (
                      <div className="w-4 h-4 bg-red-500 rounded-sm" />
                    ) : mode === "live" ? (
                      <Radio className="w-5 h-5 text-black" />
                    ) : null}
                  </motion.div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recording indicator */}
          <AnimatePresence>
            {recording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 z-10"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 gentle-pulse" />
                <span className="text-[11px] font-semibold text-white">Recording</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Smart Creation Panel */}
          <SmartCreationPanel
            open={showPanel}
            media={capturedMedia}
            mode={mode}
            user={user}
            initialAudience={audience}
            uploadMedia={uploadMedia}
            isUploading={isUploading}
            onClose={() => {
              setShowPanel(false);
              setCapturedMedia(null);
              startCamera();
            }}
            onPublished={() => {
              setShowPanel(false);
              setCapturedMedia(null);
              onClose();
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}