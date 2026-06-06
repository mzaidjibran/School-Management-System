import { getHeaders } from "./apiHelper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Assign Student To Class ──────────────────────────────────────
export const assignStudentToClass = async (data) => {
  const response = await fetch(`${API_BASE}/api/class-assignment`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Assign class failed: ${response.status}`);
  return response.json();
};

// ─── Get Student Current Class ────────────────────────────────────
export const getStudentCurrentClass = async (studentId) => {
  const response = await fetch(
    `${API_BASE}/api/class-assignment/student/${studentId}/current`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  if (!response.ok) throw new Error(`Get current class failed: ${response.status}`);
  return response.json();
};

// ─── Get Student Class History ────────────────────────────────────
export const getStudentClassHistory = async (studentId) => {
  const response = await fetch(
    `${API_BASE}/api/class-assignment/student/${studentId}/history`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  if (!response.ok) throw new Error(`Get class history failed: ${response.status}`);
  return response.json();
};

// ─── Get All Students In A Class ──────────────────────────────────
export const getStudentsInClass = async (classId) => {
  const response = await fetch(
    `${API_BASE}/api/class-assignment/class/${classId}/students`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  if (!response.ok) throw new Error(`Get students in class failed: ${response.status}`);
  return response.json();
};