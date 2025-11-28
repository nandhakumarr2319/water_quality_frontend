// src/App.jsx
import React, { useState } from "react";
import ChatBox from "./components/ChatBox";
import Login from "./components/Login";
import WaterScene from "./components/WaterScene";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [fade, setFade] = useState("fade-in");

  const handleLogin = (data) => {
    setFade("fade-out");
    setTimeout(() => {
      setUser(data);
      setFade("fade-in");
    }, 350);
  };

  const handleLogout = () => {
    setFade("fade-out");
    setTimeout(() => {
      setUser(null);
      setFade("fade-in");
    }, 350);
  };

  return (
    <>
      {/* Global background */}
      <WaterScene />

      {/* If NOT logged in → show glass login centered */}
      {!user ? (
        <div className="app-container">
          <div className={`transition-wrapper ${fade}`}>
            <Login onLogin={handleLogin} />
          </div>
        </div>
      ) : (
        // If LOGGED IN → show full-screen ChatBox (NO glass wrapper)
        <div className={`transition-wrapper ${fade}`} style={{ height: "100vh" }}>
          <ChatBox user={user} onLogout={handleLogout} />
        </div>
      )}
    </>
  );
}
