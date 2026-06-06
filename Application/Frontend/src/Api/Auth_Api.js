import { getHeaders } from "./apiHelper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Register ─────────────────────────────────────────────────────
export const register = async (data) => {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Register failed: ${response.status}`);
  return response.json();
};

// ─── Login ────────────────────────────────────────────────────────
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Login failed: ${response.status}`);
  const data = await response.json();

  // Token localStorage mein save karo
  if (data.token) localStorage.setItem("token", data.token);

  return data;
};

// ─── Get Logged In User ───────────────────────────────────────────
export const getMe = async () => {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get me failed: ${response.status}`);
  return response.json();
};

// ─── Logout ───────────────────────────────────────────────────────
export const logout = () => {
  localStorage.removeItem("token");
};