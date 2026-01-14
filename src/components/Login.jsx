// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import "./Login.css";
import WaterScene from "./WaterScene";   // ✅ 3D water background

export default function Login({ onLogin }) {
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [engineStatus, setEngineStatus] = useState("Checking...");
  const [showPassword, setShowPassword] = useState(false);

  /* --------------------------------------------------------
     HEALTH CHECK
  -------------------------------------------------------- */
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        setEngineStatus(data.engine_mode || "Online");
      } catch {
        setEngineStatus("Offline");
      }
    };
    checkHealth();
  }, []);

  /* --------------------------------------------------------
     LOGIN HANDLER
  -------------------------------------------------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");

      onLogin({
        email: data.email,
        id: data.user_id,
        user_id: data.user_id,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------
     UI
  -------------------------------------------------------- */
  return (
    <div className="login-container">
      {/* 3D Waves Background */}
      <WaterScene />

      {/* LOGIN CARD */}
     <form className="login-card responsive-card" onSubmit={handleLogin}>
        <img src="/logo.png" className="login-logo" alt="EyeNetAqua" />

        <h2 className="login-title">Welcome Back</h2>
        <p className="login-sub">Sign in to continue</p>

        {/* ENGINE BADGE */}
        <div className="engine-badge">
          {engineStatus} ⚙
        </div>

        {/* EMAIL */}
        <div className="input-wrapper">
          <input
            className="login-input"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* PASSWORD */}
        <div className="input-wrapper password-wrapper">
          <input
            className="login-input"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Eye Toggle */}
          <span
            className="toggle-eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        {/* LOGIN BUTTON */}
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Checking..." : "Login"}
        </button>

        {/* ERROR */}
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
