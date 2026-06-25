import { getHeaders } from "./Api_Helper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Get All Notices ──────────────────────────────────────────────
export const getAllNotices = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_BASE}/api/notices${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get notices failed: ${response.status}`);
  return response.json();
};

// ─── Get Notice By Id ─────────────────────────────────────────────
export const getNoticeById = async (id) => {
  const response = await fetch(`${API_BASE}/api/notices/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get notice failed: ${response.status}`);
  return response.json();
};

// ─── Create Notice ────────────────────────────────────────────────
export const createNotice = async (data) => {
  const response = await fetch(`${API_BASE}/api/notices`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Create notice failed: ${response.status}`);
  return response.json();
};

// ─── Update Notice ────────────────────────────────────────────────
export const updateNotice = async (id, data) => {
  const response = await fetch(`${API_BASE}/api/notices/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update notice failed: ${response.status}`);
  return response.json();
};

// ─── Delete Notice ────────────────────────────────────────────────
export const deleteNotice = async (id) => {
  const response = await fetch(`${API_BASE}/api/notices/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Delete notice failed: ${response.status}`);
  return response.json();
};

// ─── Get Active Notices ───────────────────────────────────────────
export const getActiveNotices = async () => {
  const response = await fetch(`${API_BASE}/api/notices/active`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get active notices failed: ${response.status}`);
  return response.json();
};