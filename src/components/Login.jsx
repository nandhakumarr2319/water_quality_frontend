// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [engineStatus, setEngineStatus] = useState("Checking...");

  useEffect(() => {
    // fetch health endpoint to display engine status
    const check = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/health");
        const data = await res.json();
        const ollama = data.ollama_status || "unknown";
        const hf = data.huggingface_status || "unknown";
        if (ollama.includes("running") && hf.includes("configured")) {
          setEngineStatus("Hybrid: Ollama + HuggingFace");
        } else if (ollama.includes("running")) {
          setEngineStatus("Local: Ollama only");
        } else if (hf.includes("configured")) {
          setEngineStatus("Cloud: HuggingFace only");
        } else {
          setEngineStatus("Offline");
        }
      } catch {
        setEngineStatus("Offline");
      }
    };
    check();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      onLogin({ email: data.email, id: data.user_id, user_id: data.user_id });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Sign In</h2>

        <div className="engine-status">AI Engine: <strong>{engineStatus}</strong></div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="error">{error}</p>}

        <p className="note">
          Use your Supabase Auth email/password (e.g. user1@test.com / user2@test.com)
        </p>
      </form>
    </div>
  );
}
