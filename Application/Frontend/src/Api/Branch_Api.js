import { getHeaders } from "./Api_Helper";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// Get all branches of the principal
export const getAllBranches = async () => {
  const response = await fetch(`${API_BASE}/api/branches`, {
    method: "GET",
    headers: getHeaders(),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Get branches failed: ${response.status}`);
  }
  return result;
};

// Create a branch
export const createBranch = async (data) => {
  const response = await fetch(`${API_BASE}/api/branches`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Create branch failed: ${response.status}`);
  }
  return result;
};

// Delete a branch
export const deleteBranch = async (id) => {
  const response = await fetch(`${API_BASE}/api/branches/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Delete branch failed: ${response.status}`);
  }
  return result;
};
