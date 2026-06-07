import { getHeaders } from "./Api_Helper.js";

const API_BASE = "http://127.0.0.1:3000";

// ─── Generate Salary ──────────────────────────────────────────────
const generateSalary = async (data) => {
  const response = await fetch(`${API_BASE}/api/teacher-salary`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Generate salary failed: ${response.status}`);
  return response.json();
};

export default generateSalary;

// ─── Get Salary Records ───────────────────────────────────────────
export const getSalaryRecords = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/api/teacher-salary?${query}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get salary records failed: ${response.status}`);
  return response.json();
};

// ─── Mark Salary as Paid ──────────────────────────────────────────
export const markAsPaid = async (id) => {
  const response = await fetch(`${API_BASE}/api/teacher-salary/${id}/pay`, {
    method: "PUT",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Mark as paid failed: ${response.status}`);
  return response.json();
};