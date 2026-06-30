import { getHeaders } from "./Api_Helper.js";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// ─── Mark Attendance (Array of records) ──────────────────────────
export const markAttendance = async (records) => {
  const response = await fetch(`${API_BASE}/api/attendence`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ records }),
  });
  if (!response.ok) throw new Error(`Mark attendance failed: ${response.status}`);
  return response.json();
};

// ─── Get Attendance By Class and Date ────────────────────────────
export const getAttendanceByClassAndDate = async (classId, date) => {
  const response = await fetch(
    `${API_BASE}/api/attendance?classId=${classId}&date=${date}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  if (!response.ok) throw new Error(`Get attendance failed: ${response.status}`);
  return response.json();
};

// ─── Get Attendance By Student ────────────────────────────────────
// month aur year optional hain
export const getAttendanceByStudent = async (studentId, month, year) => {
  let url = `${API_BASE}/api/attendance/student/${studentId}`;
  if (month && year) url += `?month=${month}&year=${year}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get student attendance failed: ${response.status}`);
  return response.json();
};

// ─── Update Attendance ────────────────────────────────────────────
export const updateAttendance = async (id, data) => {
  const response = await fetch(`${API_BASE}/api/attendance/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update attendance failed: ${response.status}`);
  return response.json();
};
