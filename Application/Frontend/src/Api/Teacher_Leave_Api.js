import { getHeaders } from "./Api_Helper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Apply Leave ──────────────────────────────────────────────────
const applyLeave = async (data) => {
  const response = await fetch(`${API_BASE}/api/teacher-leave`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Apply leave failed: ${response.status}`);
  return response.json();
};

export default applyLeave;

// ─── Get All Leaves ───────────────────────────────────────────────
export const getAllLeaves = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/api/teacher-leave?${query}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get leaves failed: ${response.status}`);
  return response.json();
};

// ─── Update Leave Status (Approve/Reject) ─────────────────────────
export const updateLeaveStatus = async (id, data) => {
  const response = await fetch(`${API_BASE}/api/teacher-leave/${id}/status`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update leave status failed: ${response.status}`);
  return response.json();
};