import { getHeaders } from "./Api_Helper.js";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// ─── Get All Subjects ─────────────────────────────────────────────
export const getAllSubjects = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_BASE}/api/subjects${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get subjects failed: ${response.status}`);
  return response.json();
};

// ─── Get Subject By Id ────────────────────────────────────────────
export const getSubjectById = async (id) => {
  const response = await fetch(`${API_BASE}/api/subjects/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get subject failed: ${response.status}`);
  return response.json();
};

// ─── Add Subject ──────────────────────────────────────────────────
export const addSubject = async (data) => {
  const response = await fetch(`${API_BASE}/api/subjects`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || `Add subject failed: ${response.status}`);
  return result;
};

// ─── Update Subject ───────────────────────────────────────────────
export const updateSubject = async (id, data) => {
  const response = await fetch(`${API_BASE}/api/subjects/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update subject failed: ${response.status}`);
  return response.json();
};

// ─── Delete Subject ───────────────────────────────────────────────
export const deleteSubject = async (id) => {
  const response = await fetch(`${API_BASE}/api/subjects/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Delete subject failed: ${response.status}`);
  return response.json();
};
