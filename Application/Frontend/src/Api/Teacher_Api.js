import { getHeaders, getFormHeaders } from "./Api_Helper.js";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// ─── Create Teacher ───────────────────────────────────────────────
const createTeacher = async (data) => {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_BASE}/api/teachers`, {
    method: "POST",
    headers: isFormData ? getFormHeaders() : getHeaders(),
    body: isFormData ? data : JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || `Create failed: ${response.status}`);
  return result;
};

export default createTeacher;

// ─── Get All Teachers ─────────────────────────────────────────────
export const getAllTeachers = async () => {
  const response = await fetch(`${API_BASE}/api/teachers`, {
    method: "GET",
    headers: getHeaders(),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || `Get all failed: ${response.status}`);
  return result;
};

// ─── Get Single Teacher ───────────────────────────────────────────
export const getSingleTeacher = async (id) => {
  const response = await fetch(`${API_BASE}/api/teachers/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || `Get single failed: ${response.status}`);
  return result;
};

// ─── Update Teacher ───────────────────────────────────────────────
export const updateTeacher = async (id, data) => {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_BASE}/api/teachers/${id}`, {
    method: "PUT",
    headers: isFormData ? getFormHeaders() : getHeaders(),
    body: isFormData ? data : JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || `Update failed: ${response.status}`);
  return result;
};

// ─── Delete Teacher ───────────────────────────────────────────────
export const deleteTeacher = async (id) => {
  const response = await fetch(`${API_BASE}/api/teachers/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || `Delete failed: ${response.status}`);
  return result;
};
