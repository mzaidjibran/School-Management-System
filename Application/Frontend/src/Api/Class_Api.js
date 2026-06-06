import { getHeaders } from "./apiHelper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Create Class ─────────────────────────────────────────────────
export const createClass = async (data) => {
  const response = await fetch(`${API_BASE}/api/classes`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Create class failed: ${response.status}`);
  return response.json();
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
  if (!response.ok) throw new Error(`Get classes failed: ${response.status}`);
  return response.json();
};

// ─── Get Single Class ─────────────────────────────────────────────
export const getSingleClass = async (id) => {
  const response = await fetch(`${API_BASE}/api/classes/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get class failed: ${response.status}`);
  return response.json();
};

// ─── Update Class ─────────────────────────────────────────────────
export const updateClass = async (id, data) => {
  const response = await fetch(`${API_BASE}/api/classes/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update class failed: ${response.status}`);
  return response.json();
};

// ─── Delete Class ─────────────────────────────────────────────────
export const deleteClass = async (id) => {
  const response = await fetch(`${API_BASE}/api/classes/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Delete class failed: ${response.status}`);
  return response.json();
};