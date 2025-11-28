const API_BASE = process.env.REACT_APP_BACKEND_URL;

export async function loginAPI(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Invalid email or password");
  return data;
}

export async function chatAPI(user_id, message) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, message }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Chat request failed");
  return data;
}

export async function pingServer() {
  const response = await fetch(`${API_BASE}/ping`);
  const data = await response.json();
  if (data.ping === "pong" || data.status === "alive") return { status: "ok" };
  return { status: "error" };
}
