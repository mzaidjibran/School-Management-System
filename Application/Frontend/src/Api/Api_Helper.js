// ─── Token Helper ─────────────────────────────────────────────────
const getToken = () => localStorage.getItem("accessToken") || localStorage.getItem("token");

// ─── JSON Headers (normal requests) ──────────────────────────────
export const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
  const activeBranch = localStorage.getItem("activeBranch");
  const activeSection = localStorage.getItem("activeSection");
  if (activeBranch) headers["x-branch-id"] = activeBranch;
  if (activeSection) headers["x-section"] = activeSection;
  return headers;
};

// ─── Form Headers (file upload requests) ─────────────────────────
// Content-Type set mat karo — browser khud boundary set karta hai FormData ke liye
export const getFormHeaders = () => {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };
  const activeBranch = localStorage.getItem("activeBranch");
  const activeSection = localStorage.getItem("activeSection");
  if (activeBranch) headers["x-branch-id"] = activeBranch;
  if (activeSection) headers["x-section"] = activeSection;
  return headers;
};
