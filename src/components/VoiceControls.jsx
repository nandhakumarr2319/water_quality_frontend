import React, { useRef, useState } from "react";

export default function VoiceControls({ onTranscription }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const initRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("🎤 Speech Recognition is not supported on this browser. Use Chrome or Edge.");
      return null;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.continuous = false;

    // STARTED
    rec.onstart = () => {
      setListening(true);
    };

    // GOT RESULT
    rec.onresult = (ev) => {
      try {
        const text = ev.results[0][0].transcript.trim();
        if (text) onTranscription(text);
      } catch (e) {
        console.error("Speech parse error:", e);
      }
    };

    // STOPPED
    rec.onend = () => {
      setListening(false);
    };

    // ERROR
    rec.onerror = (err) => {
      setListening(false);

      if (err.error === "not-allowed") {
        alert("🎤 Microphone access blocked. Enable mic permission and try again.");
      } else {
        console.error("Speech recognition error:", err);
      }
    };

    recognitionRef.current = rec;
    return rec;
  };

  const startListening = () => {
    const rec = initRecognition();
    if (!rec) return;

    try {
      rec.start();
    } catch {
      // Prevent "already started" error on mobile
      console.warn("Speech recognition already active.");
    }
  };

  return (
    <button
      onClick={startListening}
      className={`action-btn ${listening ? "listening" : ""}`}
      title={listening ? "Listening…" : "Speak"}
    >
      {/* Mic Icon */}
      <svg width="22" height="22" viewBox="0 0 24 24">
        <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z"/>
        <path d="M19 11a1 1 0 0 0-2 0 5 5 0 1 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21H9v2h6v-2h-2v-3.08A7 7 0 0 0 19 11z"/>
      </svg>
    </button>
  );
}
