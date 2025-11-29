const API_BASE = import.meta.env.VITE_BACKEND_URL;

/**
 * Login API — Authenticates user via FastAPI (Supabase backend)
 */
export async function loginAPI(email, password) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Invalid email or password");
    return data;  // { user_id, email }
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
}

/**
 * Chat API — Sends message to FastAPI + Ollama/HF
 */
export async function chatAPI(user_id, message) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, message }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Chat request failed");
    return data;
  } catch (err) {
    console.error("Chat API error:", err);
    throw err;
  }
}

/**
 * Ping Server — Confirms backend is online
 */
export async function pingServer() {
  try {
    const response = await fetch(`${API_BASE}/ping`);
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
