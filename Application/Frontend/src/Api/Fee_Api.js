import { getHeaders } from "./apiHelper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Create Fee Record ────────────────────────────────────────────
export const createFee = async (data) => {
  const response = await fetch(`${API_BASE}/api/fee`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Create fee failed: ${response.status}`);
  return response.json();
};

// ─── Get Student Fees ─────────────────────────────────────────────
// status aur year optional filters hain
export const getStudentFees = async (studentId, status, year) => {
  let url = `${API_BASE}/api/fee/student/${studentId}`;
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (year) params.append("year", year);
  if ([...params].length > 0) url += `?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get student fees failed: ${response.status}`);
  return response.json();
};

// ─── Get Pending Fees ─────────────────────────────────────────────
export const getPendingFees = async () => {
  const response = await fetch(`${API_BASE}/api/fee/pending`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get pending fees failed: ${response.status}`);
  return response.json();
};

// ─── Pay Fee ──────────────────────────────────────────────────────
export const payFee = async (id, data) => {
  const response = await fetch(`${API_BASE}/api/fee/pay/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Pay fee failed: ${response.status}`);
  return response.json();
};

// ─── Update Fee ───────────────────────────────────────────────────
export const updateFee = async (id, data) => {
  const response = await fetch(`${API_BASE}/api/fee/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update fee failed: ${response.status}`);
  return response.json();
};

// ─── Delete Fee ───────────────────────────────────────────────────
export const deleteFee = async (id) => {
  const response = await fetch(`${API_BASE}/api/fee/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Delete fee failed: ${response.status}`);
  return response.json();
};