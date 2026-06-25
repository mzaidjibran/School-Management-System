import { getHeaders } from "./Api_Helper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Create Or Update Timetable ───────────────────────────────────
export const createOrUpdateTimetable = async (data) => {
  const response = await fetch(`${API_BASE}/api/timetable`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const json = await response.json();

  if (!response.ok) {
    // Exact backend error console mein dikhega
    console.error("❌ Timetable save error:", json);
    throw new Error(json.message || `Save failed: ${response.status}`);
  }

  return json;
};

// ─── Get Class Timetable ───────────────────────────────────────────
export const getClassTimetable = async (classId, session) => {
  let url = `${API_BASE}/api/timetable/${classId}`;
  if (session) url += `?session=${session}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  const json = await response.json();

  if (!response.ok) {
    console.error("❌ Get class timetable error:", json);
    throw new Error(json.message || `Get failed: ${response.status}`);
  }

  return json;
};

// ─── Get Today Timetable ───────────────────────────────────────────
export const getTodayTimetable = async (classId, session) => {
  let url = `${API_BASE}/api/timetable/${classId}/today`;
  if (session) url += `?session=${session}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  const json = await response.json();

  if (!response.ok) {
    console.error("❌ Get today timetable error:", json);
    throw new Error(json.message || `Get failed: ${response.status}`);
  }

  return json;
};

// ─── Get Teacher Timetable ─────────────────────────────────────────
export const getTeacherTimetable = async (teacherId, session) => {
  let url = `${API_BASE}/api/timetable/teacher/${teacherId}`;
  if (session) url += `?session=${session}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  const json = await response.json();

  if (!response.ok) {
    console.error("❌ Get teacher timetable error:", json);
    throw new Error(json.message || `Get failed: ${response.status}`);
  }

  return json;
};

// ─── Delete Timetable ──────────────────────────────────────────────
export const deleteTimetable = async (id) => {
  const response = await fetch(`${API_BASE}/api/timetable/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const json = await response.json();

  if (!response.ok) {
    console.error("❌ Delete timetable error:", json);
    throw new Error(json.message || `Delete failed: ${response.status}`);
  }

  return json;
};