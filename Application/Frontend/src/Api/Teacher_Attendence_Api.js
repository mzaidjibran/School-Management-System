import { getHeaders } from "./Api_Helper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Mark Attendance ──────────────────────────────────────────────
const markAttendance = async (data) => {
  const response = await fetch(`${API_BASE}/api/teacher-attendance`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Mark attendance failed: ${response.status}`);
  return response.json();
};

export default markAttendance;

// ─── Get Attendance ───────────────────────────────────────────────
export const getAttendance = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/api/teacher-attendance?${query}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get attendance failed: ${response.status}`);
  return response.json();
};

// ─── Update Attendance ────────────────────────────────────────────
export const updateAttendance = async (id, data) => {
  const response = await fetch(`${API_BASE}/api/teacher-attendance/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update attendance failed: ${response.status}`);
  return response.json();
};