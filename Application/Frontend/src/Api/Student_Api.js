import { getHeaders, getFormHeaders } from "./Api_Helper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Create Student ───────────────────────────────────────────────
const createStudent = async (data) => {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_BASE}/api/students`, {
    method: "POST",
    headers: isFormData ? getFormHeaders() : getHeaders(),
    body: isFormData ? data : JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Create failed: ${response.status}`);
  return response.json();
};

export default createStudent;

// ─── Get All Students ─────────────────────────────────────────────
export const getAllStudents = async () => {
  const response = await fetch(`${API_BASE}/api/students`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get all failed: ${response.status}`);
  return response.json();
};

// ─── Get Single Student ───────────────────────────────────────────
export const getSingleStudent = async (id) => {
  const response = await fetch(`${API_BASE}/api/students/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get single failed: ${response.status}`);
  return response.json();
};

// ─── Update Student ───────────────────────────────────────────────
export const updateStudent = async (id, data) => {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_BASE}/api/students/${id}`, {
    method: "PUT",
    headers: isFormData ? getFormHeaders() : getHeaders(),
    body: isFormData ? data : JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update failed: ${response.status}`);
  return response.json();
};

// ─── Delete Student ───────────────────────────────────────────────
export const deleteStudent = async (id) => {
  const response = await fetch(`${API_BASE}/api/students/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
  return response.json();
};