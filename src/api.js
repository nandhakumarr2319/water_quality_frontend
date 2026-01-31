// src/api.js

const API_BASE =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

console.log("🔧 API Connected to:", API_BASE);

// ================================
// LOGIN API
// ================================
export async function loginAPI(email, password) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid login response from server");
    }

    if (!response.ok) {
      throw new Error(data.detail || "Invalid email or password");
    }

    return data;
  } catch (err) {
    console.error("❌ Login error:", err);
    throw err;
  }
}
// ================================
// CHAT API (JSON — MATCHES BACKEND)
// ================================
export async function chatAPI(user_id, message) {
  try {
    const safeUserId =
      user_id !== undefined && user_id !== null
        ? String(user_id)
        : "";

    console.log(
      `🚀 Sending Chat -> ID: ${safeUserId}, Prompt: ${message}`
    );

    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: safeUserId,
        prompt: message,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid JSON response from server");
    }

    if (!response.ok) {
      console.error("❌ Backend error response:", data);
      throw new Error(data.detail || "Chat request failed");
    }

    return {
      response: data.response || "",
      charts: Array.isArray(data.charts) ? data.charts : [],
      report: data.report ?? null,
    };
  } catch (err) {
    console.error("❌ Chat API error:", err);
    throw err;
  }
}

// ================================
// PING SERVER
// ================================
export async function pingServer() {
  try {
    const response = await fetch(`${API_BASE}/ping`);
    const data = await response.json();
    return { status: "ok", message: data };
  } catch (err) {
    console.error("❌ Ping failed:", err);
    return { status: "error" };
  }
}
