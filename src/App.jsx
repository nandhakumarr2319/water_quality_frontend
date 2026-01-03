// src/App.jsx
import React, { useState } from "react";
import ChatBox from "./components/ChatBox";
import Login from "./components/Login";
import WaterScene from "./components/WaterScene";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [fade, setFade] = useState("fade-in");

  // ===============================
  // LOGIN → Smooth Fade Animation
  // ===============================
  const handleLogin = (userData) => {
    setFade("fade-out");

    setTimeout(() => {
      setUser(userData);
      setFade("fade-in");
    }, 350);
  };

  // ===============================
  // LOGOUT → Smooth Fade Animation
  // ===============================
  const handleLogout = () => {
    setFade("fade-out");

    setTimeout(() => {
      setUser(null);
      setFade("fade-in");
    }, 350);
  };

  return (
    <>
      {/* GLOBAL WATER BACKGROUND */}
      <WaterScene />

      {/* LOGIN PAGE */}
      {!user ? (
        <div className="app-container">
          <div className={`transition-wrapper ${fade}`}>
            <Login onLogin={handleLogin} />
          </div>
        </div>
      ) : (
        /* CHAT UI PAGE */
        <div className={`transition-wrapper ${fade}`} style={{ height: "100vh" }}>
          <ChatBox user={user} onLogout={handleLogout} />
        </div>
      )}
    </>
  );
}
