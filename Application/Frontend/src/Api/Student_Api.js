import { getHeaders, getFormHeaders } from "./Api_Helper.js";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// ─── Create Student ───────────────────────────────────────────────
const createStudent = async (data) => {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_BASE}/api/students`, {
    method: "POST",
    headers: isFormData ? getFormHeaders() : getHeaders(),
    body: isFormData ? data : JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || `Create failed: ${response.status}`);
  return result;
};

export default createStudent;

// ─── Get All Students ─────────────────────────────────────────────
export const getAllStudents = async (params = {}) => {
  let url = `${API_BASE}/api/students`;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      query.append(key, val);
    }
  });
  const queryString = query.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  const response = await fetch(url, {
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
