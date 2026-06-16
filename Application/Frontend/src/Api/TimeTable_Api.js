import { getHeaders } from "./apiHelper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Create Or Update Timetable ───────────────────────────────────
export const createOrUpdateTimetable = async (data) => {
  const response = await fetch(`${API_BASE}/api/timetable`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Save timetable failed: ${response.status}`);
  return response.json();
};

// ─── Get Class Timetable ───────────────────────────────────────────
// session optional hai
export const getClassTimetable = async (classId, session) => {
  let url = `${API_BASE}/api/timetable/${classId}`;
  if (session) url += `?session=${session}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get class timetable failed: ${response.status}`);
  return response.json();
};

// ─── Get Today Timetable ───────────────────────────────────────────
export const getTodayTimetable = async (classId, session) => {
  let url = `${API_BASE}/api/timetable/${classId}/today`;
  if (session) url += `?session=${session}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get today timetable failed: ${response.status}`);
  return response.json();
};

// ─── Get Teacher Timetable ─────────────────────────────────────────
export const getTeacherTimetable = async (teacherId, session) => {
  let url = `${API_BASE}/api/timetable/teacher/${teacherId}`;
  if (session) url += `?session=${session}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get teacher timetable failed: ${response.status}`);
  return response.json();
};

// ─── Delete Timetable ──────────────────────────────────────────────
export const deleteTimetable = async (id) => {
  const response = await fetch(`${API_BASE}/api/timetable/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Delete timetable failed: ${response.status}`);
  return response.json();
};