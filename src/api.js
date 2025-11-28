// src/api.js

const BASE_URL = "http://127.0.0.1:8000";

/**
 * 🔐 Login API — Authenticates user via FastAPI (Supabase backend)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user_id: string, email: string}>}
 */
export async function loginAPI(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
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

    return data; // { user_id, email }
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
}

/**
 * 💬 Chat API — Sends user question to FastAPI + Ollama model
 * @param {string} user_id
 * @param {string} message
 * @returns {Promise<{reply: string, plot?: string}>}
 */
export async function chatAPI(user_id, message) {
  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id, message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Chat request failed");
    }

    return data;
  } catch (err) {
    console.error("Chat API error:", err);
    throw err;
  }
}

/**
 * 🩺 Ping Server — Tests if backend & Supabase are online
 * @returns {Promise<{status: string}>}
 */
export async function pingServer() {
  try {
    const response = await fetch(`${BASE_URL}/ping`);
    const data = await response.json();
    if (data.ping === "pong" || data.status === "alive") {
      return { status: "ok" };
    }
    return { status: "error" };
  } catch (err) {
    console.error("Ping failed:", err);
    return { status: "error" };
  }
}
