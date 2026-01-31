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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

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
// CHAT API (JSON – FIXED & FINAL)
// ================================
export async function chatAPI(user_id, message) {
  try {
    // SAFETY: ensure valid string user_id
    const safeUserId =
      user_id !== undefined && user_id !== null
        ? String(user_id)
        : "";

    if (!safeUserId) {
      throw new Error("Missing user_id");
    }

    console.log("🚀 Sending Chat Payload:", {
      user_id: safeUserId,
      prompt: message,
    });

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

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Backend error response:", data);
      throw new Error(data.detail || "Chat request failed");
    }

    // Normalize response for UI
    return {
      response: data.response || "",
      charts: Array.isArray(data.charts) ? data.charts : [],
      report: data.report ?? null,
    };
  } catch (err) {
    console.error("❌ Chat API error:", err);
    throw err; // UI MUST catch this
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
