import { getHeaders } from "./Api_Helper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Get All Exams ────────────────────────────────────────────────
export const getAllExams = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_BASE}/api/exams${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get exams failed: ${response.status}`);
  return response.json();
};

// ─── Get Exam By Id ───────────────────────────────────────────────
export const getExamById = async (id) => {
  const response = await fetch(`${API_BASE}/api/exams/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get exam failed: ${response.status}`);
  return response.json();
};

// ─── Create Exam ──────────────────────────────────────────────────
export const createExam = async (data) => {
  const response = await fetch(`${API_BASE}/api/exams`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Create exam failed: ${response.status}`);
  return response.json();
};

// ─── Update Exam ──────────────────────────────────────────────────
export const updateExam = async (id, data) => {
  const response = await fetch(`${API_BASE}/api/exams/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update exam failed: ${response.status}`);
  return response.json();
};

// ─── Delete Exam ──────────────────────────────────────────────────
export const deleteExam = async (id) => {
  const response = await fetch(`${API_BASE}/api/exams/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Delete exam failed: ${response.status}`);
  return response.json();
};

// ─── Enter Marks (Array of { student, obtainedMarks, remarks }) ───
export const enterMarks = async (examId, results) => {
  const response = await fetch(`${API_BASE}/api/exams/${examId}/marks`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ results }),
  });
  if (!response.ok) throw new Error(`Enter marks failed: ${response.status}`);
  return response.json();
};

// ─── Get Exam Results (with summary) ───────────────────────────────
export const getExamResults = async (examId) => {
  const response = await fetch(`${API_BASE}/api/exams/${examId}/results`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get exam results failed: ${response.status}`);
  return response.json();
};

// ─── Get Student Results ───────────────────────────────────────────
export const getStudentResults = async (studentId) => {
  const response = await fetch(`${API_BASE}/api/exams/student/${studentId}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get student results failed: ${response.status}`);
  return response.json();
};

// ─── Get Result Report ─────────────────────────────────────────────
export const getResultReport = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_BASE}/api/exams/results/report${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get result report failed: ${response.status}`);
  return response.json();
};