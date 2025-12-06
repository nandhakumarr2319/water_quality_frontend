// ================================
// Debug logs (safe in dev only)
// ================================
console.log("🔧 Loaded BACKEND_URL =", import.meta.env.VITE_BACKEND_URL);

const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Safety check
if (!API_BASE) {
  console.error("❌ ERROR: VITE_BACKEND_URL is NOT defined!");
}

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
// CHAT API
// ================================
export async function chatAPI(user_id, message) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Chat request failed");
    }

    return data;
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

    if (data.ping === "pong" || data.status === "alive") {
      return { status: "ok" };
    }
    return { status: "error" };
  } catch (err) {
    console.error("❌ Ping failed:", err);
    return { status: "error" };
  }
}
