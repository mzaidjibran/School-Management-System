import { getHeaders } from "./Api_Helper";

// NOTE: backend (index.js) "process.env.PORT || 5000" par chalta hai.
// Pehle yahan 3000 likha tha jo backend se match nahi karta tha — isi
// wajah se koi bhi request connect hi nahi ho rahi thi.
// Agar aapke .env me PORT kuch aur set hai to neeche wo number daal dein,
// ya VITE_API_BASE_URL environment variable use karein.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ─── Create Class ─────────────────────────────────────────────────
export const createClass = async (data) => {
  const response = await fetch(`${API_BASE}/api/classes`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Create class failed: ${response.status}`);
  }
  return result;
};

// ─── Get All Classes ──────────────────────────────────────────────
export const getAllClasses = async (academicYear, isActive) => {
  let url = `${API_BASE}/api/classes`;
  const params = new URLSearchParams();
  if (academicYear) params.append("academicYear", academicYear);
  if (isActive !== undefined) params.append("isActive", isActive);
  if ([...params].length > 0) url += `?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Get classes failed: ${response.status}`);
  }
  return result;
};

// ─── Get Single Class ─────────────────────────────────────────────
export const getSingleClass = async (id) => {
  const response = await fetch(`${API_BASE}/api/classes/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Get class failed: ${response.status}`);
  }
  return result;
};

// ─── Update Class ─────────────────────────────────────────────────
export const updateClass = async (id, data) => {
  const response = await fetch(`${API_BASE}/api/classes/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Update class failed: ${response.status}`);
  }
  return result;
};

// ─── Delete Class ─────────────────────────────────────────────────
export const deleteClass = async (id) => {
  const response = await fetch(`${API_BASE}/api/classes/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Delete class failed: ${response.status}`);
  }
  return result;
};