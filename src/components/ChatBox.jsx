import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { chatAPI, pingServer } from "../api";
import botAvatar from "../assets/bot.gif";
import userAvatar from "../assets/user.png";
import VoiceControls from "./VoiceControls";
import "./ChatBox.css";

export default function ChatBox({ user, onLogout }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "🌊 Hi! I’m your Water Quality Assistant. Ask me about your sensor data!",
      plots: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("🟢 Hybrid: Ollama + HF");
  const canvasRef = useRef(null);
  const thinkingCanvasRef = useRef(null);
  const chatEndRef = useRef(null);

  const sendBtnRef = useRef(null);
  const chatInputRef = useRef(null);

  const [rippleKey, setRippleKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState(null);
  const [galleryMode, setGalleryMode] = useState("auto");
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);

  useEffect(() => {
    function onResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Background water (desktop only heavy)
  useEffect(() => {
    if (!isDesktop && canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ alpha: true, canvas: canvasRef.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const geometry = new THREE.PlaneGeometry(40, 40, 220, 220);
    const material = new THREE.MeshStandardMaterial({
      color: 0xe0f7ff,
      metalness: 0.12,
      roughness: 0.6,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2.2;
    plane.position.y = -3.4;
    scene.add(plane);

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    scene.add(dir);
    scene.add(new THREE.AmbientLight(0xbfefff, 0.6));

    camera.position.set(0, 3.2, 6);

    const pos = geometry.attributes.position;
    const clock = new THREE.Clock();

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      for (let i = 0; i < pos.count; i++) {
        const ix = i * 3;
        const x = pos.array[ix];
        const z = pos.array[ix + 2];
        pos.array[ix + 1] =
          Math.sin(x * 0.55 + t * 1.4) * 0.06 + Math.cos(z * 0.45 + t * 1.1) * 0.035;
      }
      pos.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      try { geometry.dispose(); material.dispose(); renderer.dispose(); } catch {}
    };
  }, [isDesktop]);

  // Small 3D thinking blob (desktop only)
  useEffect(() => {
    if (!isDesktop) {
      try {
        if (thinkingCanvasRef.current && thinkingCanvasRef.current._renderer) {
          thinkingCanvasRef.current._renderer.dispose();
          delete thinkingCanvasRef.current._renderer;
        }
      } catch {}
      return;
    }
    if (!loading) {
      try {
        if (thinkingCanvasRef.current && thinkingCanvasRef.current._renderer) {
          thinkingCanvasRef.current._renderer.dispose();
          delete thinkingCanvasRef.current._renderer;
        }
      } catch {}
      return;
    }

    const el = thinkingCanvasRef.current;
    if (!el) return;

    let scene, camera, renderer, sphere, animFrame;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: el });
    thinkingCanvasRef.current._renderer = renderer;
    renderer.setSize(120, 120);
    renderer.setPixelRatio(window.devicePixelRatio);

    const geo = new THREE.IcosahedronGeometry(0.6, 3);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x7dd3fc,
      metalness: 0.2,
      roughness: 0.5,
      flatShading: true,
    });
    sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 3, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x88e6ff, 0.6));
    camera.position.z = 2.5;

    const clock = new THREE.Clock();
    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      sphere.rotation.y = t * 0.7;
      sphere.rotation.x = Math.sin(t * 0.7) * 0.3;
      sphere.scale.setScalar(1 + Math.sin(t * 3) * 0.06);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrame);
      try { renderer.dispose(); } catch {}
      try { geo.dispose(); mat.dispose(); } catch {}
    };
  }, [loading, isDesktop]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (last.sender === "bot" && !loading) setRippleKey((k) => k + 1);
  }, [messages, loading]);

  const handlePing = async () => {
    try {
      setStatus("⏳ Checking...");
      const res = await pingServer();
      if (res?.status === "alive" || res?.status === "ok") setStatus("🟢 Hybrid: Ollama + HF");
      else setStatus("🔴 Offline");
    } catch {
      setStatus("🔴 Offline");
    }
  };


  const sendMessage = async (customText) => {
    const text = customText || input;
    if (!text.trim()) return;
    const userMessage = { sender: "user", text, plots: [] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const uid = user.user_id || user.id;
    try {
      const res = await chatAPI(uid, text);
      const botMessage = {
        sender: "bot",
        text: res.reply || "I couldn't generate an answer.",
        plots: res.plots || [],
      };
      setMessages((prev) => [...prev, botMessage]);

      if (galleryMode === "auto") {
        const count = (res.plots || []).length;
        setGalleryMode(count === 1 ? "vertical" : count >= 3 ? "thumbnails" : "horizontal");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to backend.", plots: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (img) => {
    setModalImg(img);
    setModalOpen(true);
  };

  const RenderPlots = ({ plots }) => {
    if (!plots || plots.length === 0) return null;
    return (
      <div className="plots-wrapper">
        <div className="thumbnails-row">
          {plots.map((p, i) => (
            <div key={i} className="thumb" onClick={() => openModal(p.img)}>
              <img src={`data:image/png;base64,${p.img}`} alt={p.title || `chart-${i}`} />
              <div className="thumb-title">{p.title || "Chart"}</div>
            </div>
          ))}
        </div>

        <div className="horizontal-gallery">
          {plots.map((p, i) => (
            <div key={i} className="gallery-item" onClick={() => openModal(p.img)}>
              <img src={`data:image/png;base64,${p.img}`} alt={p.title || `chart-${i}`} />
              <div className="gallery-caption">{p.title}</div>
            </div>
          ))}
        </div>

        <div className="vertical-stack">
          {plots.map((p, i) => (
            <div key={i} className="vertical-item">
              <div className="vertical-title">{p.title}</div>
              <img src={`data:image/png;base64,${p.img}`} alt={p.title || `chart-${i}`} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-wrapper-light" style={{ width: "100%", height: "100vh" }}>
      <div className="page-sky-gradient" />
      <canvas ref={canvasRef} className="water-bg-light" />

      <div key={rippleKey} className="water-ripple" />

      {isDesktop && <canvas ref={thinkingCanvasRef} className={`thinking-canvas ${loading ? "visible" : ""}`} />}

      <div className="chat-container-light" style={{ width: "100%", height: "100%" }}>
        {/* Header */}
        <div className="chat-header-light" style={{ padding: "12px 20px" }}>
          <div>
            <strong>{user.email}</strong>
            <p className="subtitle-light">AI Assistant for Water Data</p>
          </div>

          <div className="header-controls">
            <button onClick={handlePing} className="ping-btn-light">🔄 Check</button>
            <span className="status-text-light">{status}</span>
            <button onClick={onLogout} className="logout-btn-light">Logout</button>
          </div>
        </div>

        {/* Messages - take full middle area */}
        <div className="chat-body-light" style={{ flex: 1 }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`}>
              <img src={msg.sender === "user" ? userAvatar : botAvatar} alt="avatar" className="avatar-light" />
              <div className="bubble-light">
                <p>{msg.text}</p>
                {msg.plots && msg.plots.length > 0 && <RenderPlots plots={msg.plots} />}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message bot">
              <img src={botAvatar} alt="bot" className="avatar-light" />
              <div className="bubble-light thinking-text">
                <div className="typing-dots"><span></span><span></span><span></span></div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input bar fixed at bottom of chat container */}
        <div className="chat-input-light" ref={chatInputRef}>
  
  <button className="action-btn" aria-label="mic">
    <VoiceControls
      onTranscription={(spokenText) => {
        setInput(spokenText);
        setTimeout(() => sendMessage(spokenText), 200);
      }}
    />
  </button>

  <input
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Ask anything about your water data…"
  />

  <button
    ref={sendBtnRef}
    className="action-btn"
    onClick={() => !loading && sendMessage()}
    aria-label="send"
  >
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M2 12L22 3L13 21L11 14L2 12Z"/>
    </svg>
  </button>
        </div>
      </div>

      {modalOpen && (
        <div className="img-modal" onClick={() => setModalOpen(false)}>
          <div className="img-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            <img src={`data:image/png;base64,${modalImg}`} alt="full" />
          </div>
        </div>
      )}
    </div>
  );
} 