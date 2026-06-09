import { getHeaders } from "./apiHelper.js";

const API_BASE = "http://127.0.0.1:3000";

// ═══════════════════════════════════════════════════════════════════
//  BOOK APIs
// ═══════════════════════════════════════════════════════════════════

// ─── Add Book ─────────────────────────────────────────────────────
export const addBook = async (data) => {
  const response = await fetch(`${API_BASE}/api/library/books`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Add book failed: ${response.status}`);
  return response.json();
};

// ─── Get All Books ────────────────────────────────────────────────
// category, search, available optional filters
export const getAllBooks = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const url = params
    ? `${API_BASE}/api/library/books?${params}`
    : `${API_BASE}/api/library/books`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get books failed: ${response.status}`);
  return response.json();
};

// ─── Get Single Book ──────────────────────────────────────────────
export const getBookById = async (id) => {
  const response = await fetch(`${API_BASE}/api/library/books/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get book failed: ${response.status}`);
  return response.json();
};

// ─── Update Book ──────────────────────────────────────────────────
export const updateBook = async (id, data) => {
  const response = await fetch(`${API_BASE}/api/library/books/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Update book failed: ${response.status}`);
  return response.json();
};

// ─── Delete Book ──────────────────────────────────────────────────
export const deleteBook = async (id) => {
  const response = await fetch(`${API_BASE}/api/library/books/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Delete book failed: ${response.status}`);
  return response.json();
};

// ═══════════════════════════════════════════════════════════════════
//  ISSUE / RETURN APIs
// ═══════════════════════════════════════════════════════════════════

// ─── Issue Book ───────────────────────────────────────────────────
// data = { bookId, borrowerType: "student"|"teacher", borrowerId, dueDate, remarks }
export const issueBook = async (data) => {
  const response = await fetch(`${API_BASE}/api/library/issue`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Issue book failed: ${response.status}`);
  return response.json();
};

// ─── Return Book ──────────────────────────────────────────────────
export const returnBook = async (issueId, data = {}) => {
  const response = await fetch(`${API_BASE}/api/library/return/${issueId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Return book failed: ${response.status}`);
  return response.json();
};

// ─── Pay Fine ─────────────────────────────────────────────────────
export const payFine = async (issueId, amount) => {
  const response = await fetch(`${API_BASE}/api/library/fine/${issueId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) throw new Error(`Pay fine failed: ${response.status}`);
  return response.json();
};

// ═══════════════════════════════════════════════════════════════════
//  REPORTS APIs
// ═══════════════════════════════════════════════════════════════════

// ─── Get Overdue Books ────────────────────────────────────────────
export const getOverdueBooks = async () => {
  const response = await fetch(`${API_BASE}/api/library/overdue`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get overdue failed: ${response.status}`);
  return response.json();
};

// ─── Get Borrower History ─────────────────────────────────────────
// status optional: "issued" | "returned" | "overdue"
export const getBorrowerHistory = async (borrowerId, status) => {
  let url = `${API_BASE}/api/library/history/${borrowerId}`;
  if (status) url += `?status=${status}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Get history failed: ${response.status}`);
  return response.json();
};