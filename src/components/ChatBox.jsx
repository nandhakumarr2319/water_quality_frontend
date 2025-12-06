// src/components/ChatBox.jsx
import React, { useState, useEffect, useRef } from "react";
import { chatAPI, pingServer } from "../api";
import botAvatar from "../assets/bot.gif";
import userAvatar from "../assets/user.png";
import VoiceControls from "./VoiceControls";
import "./ChatBox.css";

export default function ChatBox({ user, onLogout }) {
  /* =========================================================
       🌗 THEME
  ========================================================= */
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  /* =========================================================
       STATES
  ========================================================= */
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "🌊 Hi! I’m your Water Quality Assistant. Ask me anything!",
      plots: [],
      report: null,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("⏳ Checking…");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState("");
  const [galleryMode, setGalleryMode] = useState("auto");

  const chatEndRef = useRef(null);

  /* =========================================================
       AUTO SCROLL
  ========================================================= */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* =========================================================
       PING BACKEND ONCE
  ========================================================= */
  useEffect(() => {
    (async () => {
      try {
        const res = await pingServer();
        setStatus(res?.status === "ok" ? "🟢 Online" : "🔴 Offline");
      } catch {
        setStatus("🔴 Offline");
      }
    })();
  }, []);

  /* =========================================================
       SEND MESSAGE (ENTER + BUTTON)
  ========================================================= */
  const sendMessage = async (textOverride) => {
    const text = textOverride || input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text, plots: [] }]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatAPI(user.user_id || user.id, text);

      setGalleryMode(
        res.plots?.length >= 3 ? "thumbnails" :
        res.plots?.length === 1 ? "vertical" : "horizontal"
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: res.reply,
          plots: res.plots || [],
          report: res.report || null,   // <-- ADD REPORT SUPPORT
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Connection failed.", plots: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
       DOWNLOAD HELPERS
  ========================================================= */
  const downloadPDF = (pdfBase64) => {
    const byteCharacters = atob(pdfBase64);
    const byteArray = new Uint8Array(
      Array.from(byteCharacters).map((c) => c.charCodeAt(0))
    );
    const blob = new Blob([byteArray], { type: "application/pdf" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Water_Quality_Report.pdf";
    link.click();
  };

  const downloadHTML = (html) => {
    const blob = new Blob([html], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Water_Quality_Report.html";
    link.click();
  };

  const downloadPNG = (title, imgBase64) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imgBase64}`;
    link.download = `${title.replace(/\s+/g, "_")}.png`;
    link.click();
  };

  /* =========================================================
       PLOT RENDERING
  ========================================================= */
  const RenderPlots = ({ plots }) => {
    if (!plots?.length) return null;

    const layout =
      galleryMode === "thumbnails"
        ? "thumbnails-row"
        : galleryMode === "vertical"
        ? "vertical-stack"
        : "horizontal-gallery";

    return (
      <div className="plots-wrapper">
        <div className={layout}>
          {plots.map((plot, i) => (
            <div key={i} className="gallery-item">
              <img
                src={`data:image/png;base64,${plot.img}`}
                alt={plot.title}
                onClick={() => {
                  setModalImg(plot.img);
                  setModalOpen(true);
                }}
              />

              <div className="gallery-caption">
                {plot.title}

                {/* DOWNLOAD PNG BUTTON */}
                <button
                  className="dl-small-btn"
                  onClick={() => downloadPNG(plot.title, plot.img)}
                >
                  ⬇ PNG
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* =========================================================
       UI
  ========================================================= */
  return (
    <div className="chat-wrapper-light">
      {/* ============== HEADER ============== */}
      <div className="chat-header-light">
        <div className="header-left">
          <img src="/logo.png" className="ena-logo" />
          <div>
            <strong className="header-email">{user.email}</strong>
            <p className="subtitle-light">EyeNetAqua — AI Water Assistant</p>
          </div>
        </div>

        <div className="header-controls">
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button
            className="ping-btn-light"
            onClick={() => setMessages(messages.slice(0, 1))}
          >
            ↻
          </button>

          <span className="status-text-light">{status}</span>

          <button className="logout-btn-light" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* ============== CHAT MESSAGES ============== */}
      <div className="chat-body-light">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <img
              src={msg.sender === "user" ? userAvatar : botAvatar}
              className="avatar-light"
            />

            <div className={`bubble-light ${msg.sender === "user" ? "user-bubble" : ""}`}>
              <p>{msg.text}</p>

              {/* Render plots */}
              {msg.plots?.length > 0 && <RenderPlots plots={msg.plots} />}

              {/* REPORT DOWNLOAD BUTTONS */}
              {msg.report && (
                <div className="report-actions">
                  <button
                    className="report-btn"
                    onClick={() => downloadPDF(msg.report.pdf_base64)}
                  >
                    ⬇ PDF Report
                  </button>

                  <button
                    className="report-btn html"
                    onClick={() => downloadHTML(msg.report.html)}
                  >
                    ⬇ HTML Report
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message bot">
            <img src={botAvatar} className="avatar-light" />
            <div className="bubble-light typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ============== INPUT ============== */}
      <div className="chat-input-light">
        <VoiceControls
          onTranscription={(t) => {
            setInput(t);
            setTimeout(() => sendMessage(t), 200);
          }}
        />

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask: 'Plot pH for last week'…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button className="action-btn" onClick={() => sendMessage()}>
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path
              d="M2 12H22M22 12L14 4M22 12L14 20"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* ============== MODAL ============== */}
      {modalOpen && (
        <div className="img-modal" onClick={() => setModalOpen(false)}>
          <div className="img-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close">✕</button>
            <img src={`data:image/png;base64,${modalImg}`} />
          </div>
        </div>
      )}
    </div>
  );
}
