
import React, { useState, useEffect, useRef } from "react";
import { chatAPI, pingServer } from "../api";
// import botAvatar from "../assets/bot.gif"; // Uncomment if you have these files
// import userAvatar from "../assets/user.png";
import VoiceControls from "./VoiceControls";
import logo from "../assets/logo.png";
import "./ChatBox.css";


// Fallback avatars if images are missing
const botAvatar = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png";
const userAvatar = "https://imgs.search.brave.com/yNP_RxtcGax6WldU_7XXuevBfm9zM7hes2d-L7ztqyM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS12ZWN0/b3IvYm95LXdvcmst/Y29tcHV0ZXJzXzk4/NzY3MS00OC5qcGc_/c2VtdD1haXNfaHli/cmlkJnc9NzQwJnE9/ODA";

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
      text: "🌊 Hi! I’m your EyeNetAqua Water Quality Assistant. ",
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

    // 1. Add User Message
    setMessages((prev) => [...prev, { sender: "user", text, plots: [] }]);
    setInput("");
    setLoading(true);

 try {
      const effectiveUserId =
      user.user_id ||
      user.id ||
      user.email ||
      "test_user";

// 🧪 DEBUG LOG (ADD HERE)
      console.log("🧪 Chat request payload:", {
      user_id: effectiveUserId,
      text,
});

// 2. Call API
const res = await chatAPI(effectiveUserId, text);


      // 3. Process Charts (Backend sends generic Base64 strings)
      // We convert them to objects: { img: "base64...", title: "Chart X" }
      const processedPlots = (res.charts || [])
        .filter(b64 => typeof b64 === "string" && b64.length > 50)
        .map((base64Str, index) => ({
          img: base64Str,
          title: `Analysis Chart ${index + 1}`
        }));

      // Determine Layout
      setGalleryMode(
        processedPlots.length >= 3 ? "thumbnails" :
        processedPlots.length === 1 ? "vertical" : "horizontal"
      );
      const finalBotText =
        res.response &&
        processedPlots.length === 0 &&
        /chart|graph|plot/i.test(text)
          ? res.response + "\n\n⚠️ No chart could be generated for this request."
          : res.response;


      // 4. Add Bot Response
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: finalBotText, // FIXED: Backend sends 'response', not 'reply'
          plots: processedPlots,
          report: res.report || null, 
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ I couldn't connect to the server. Please check if the backend is running.", plots: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
       DOWNLOAD HELPERS
  ========================================================= */
  const downloadPDF = (pdfBase64) => {
    if (!pdfBase64) return;
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${pdfBase64}`;
    link.download = "Water_Quality_Report.pdf";
    link.click();
  };

  const downloadHTML = (html) => {
    if (!html) return;
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
                onError={(e) => {
                  e.target.style.display = "none";
                }}
                onClick={() => {
                  setModalImg(plot.img);
                  setModalOpen(true);
              }}
            />

              

              <div className="gallery-caption">
                <span>{plot.title}</span>
                <button
                    className="dl-small-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPNG(plot.title, plot.img);
                    }}
                    title="Download chart as PNG"
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
          {/* <img src="/logo.png" className="ena-logo" alt="Logo" /> */}
          <div className="header-icon">💧</div>
          <div>
            <strong className="header-email">{user.email || "User"}</strong>
            <p className="subtitle-light">EyeNetAqua — AI Assistant</p>
          </div>
        </div>

        <div className="header-controls">
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
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
              alt="Avatar"
            />

            <div className={`bubble-light ${msg.sender === "user" ? "user-bubble" : ""}`}>
              {/* Text Content (supports line breaks) */}
              <div className="message-text">
                  {msg.text.split("\n").map((line, i) => (
                      <p key={i} style={{ margin: "4px 0" }}>{line}</p>
                  ))}
              </div>

              {/* Render plots */}
              {msg.plots?.length > 0 && <RenderPlots plots={msg.plots} />}

              {/* REPORT DOWNLOAD BUTTONS */}
              {msg.report && (
                <div className="report-actions">
                  {msg.report.pdf_base64 && (
                    <button
                      className="report-btn"
                      onClick={() => downloadPDF(msg.report.pdf_base64)}
                    >
                      ⬇ PDF Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
            <div className="message bot">
              <img src={botAvatar} className="avatar-light" alt="Bot" />
              <div className="bubble-light">
                <div className="typing-dots">
                  <span /><span /><span />
                </div>

                {/* Skeleton charts */}
                <div className="skeleton-grid">
                  <div className="skeleton-box" />
                  <div className="skeleton-box" />
                </div>
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
            // Optional: Auto-send after voice
            // setTimeout(() => sendMessage(t), 500);
          }}
        />

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask: 'Show pH levels for last week'..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button className="action-btn" onClick={() => sendMessage()}>
          ➤
        </button>
      </div>

      {/* ============== MODAL ============== */}
      {modalOpen && (
        <div className="img-modal" onClick={() => setModalOpen(false)}>
          <div className="img-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            <img src={`data:image/png;base64,${modalImg}`} alt="Full View" />
          </div>
        </div>
      )}
    </div>
  );
}