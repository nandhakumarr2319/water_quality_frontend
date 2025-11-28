import React, { useRef, useState } from "react";

export default function VoiceControls({ onTranscription }) {
  const recognizingRef = useRef(false);
  const [listening, setListening] = useState(false);

  const startRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("🎤 Speech Recognition not supported. Use Chrome or Edge.");
      return;
    }

    if (recognizingRef.current) return;

    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.continuous = false;

    rec.onstart = () => {
      recognizingRef.current = true;
      setListening(true);
    };

    rec.onerror = (err) => {
      console.error("Speech recognition error:", err);
      recognizingRef.current = false;
      setListening(false);
    };

    rec.onend = () => {
      recognizingRef.current = false;
      setListening(false);
    };

    rec.onresult = (ev) => {
      const text = ev.results[0][0].transcript.trim();
      if (text) onTranscription(text);
    };

    rec.start();
  };

  return (
    <button
      onClick={startRecognition}
      className={`action-btn ${listening ? "listening" : ""}`}
      title={listening ? "Listening…" : "Speak"}
    >
      {/* Mic Icon */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z"/>
        <path d="M19 11a1 1 0 0 0-2 0 5 5 0 1 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21H9v2h6v-2h-2v-3.08A7 7 0 0 0 19 11z"/>
      </svg>
    </button>
  );
}
