import { getHeaders, getFormHeaders } from "./Api_Helper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Create Teacher ───────────────────────────────────────────────
const createTeacher = async (data) => {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_BASE}/api/teachers`, {
    method: "POST",
    headers: isFormData ? getFormHeaders() : getHeaders(),
    body: isFormData ? data : JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Create failed: ${response.status}`);
  return response.json();
};

export default createTeacher;

// ─── Get All Teachers ─────────────────────────────────────────────
export const getAllTeachers = async () => {
  const response = await fetch(`${API_BASE}/api/teachers`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get all failed: ${response.status}`);
  return response.json();
};

// ─── Get Single Teacher ───────────────────────────────────────────
export const getSingleTeacher = async (id) => {
  const response = await fetch(`${API_BASE}/api/teachers/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get single failed: ${response.status}`);
  return response.json();
};

// ─── Update Teacher ───────────────────────────────────────────────
export const updateTeacher = async (id, data) => {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_BASE}/api/teachers/${id}`, {
    method: "PUT",
    headers: isFormData ? getFormHeaders() : getHeaders(),
    body: isFormData ? data : JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update failed: ${response.status}`);
  return response.json();
};

// ─── Delete Teacher ───────────────────────────────────────────────
export const deleteTeacher = async (id) => {
  const response = await fetch(`${API_BASE}/api/teachers/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
  return response.json();
};

// ─── Assign Class to Teacher ──────────────────────────────────────
export const assignClass = async (id, data) => {
  const response = await fetch(`${API_BASE}/api/teachers/${id}/class`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Assign class failed: ${response.status}`);
  return response.json();
};