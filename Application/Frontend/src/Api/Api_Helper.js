// ─── Token Helper ─────────────────────────────────────────────────
const getToken = () => localStorage.getItem("token");

// ─── JSON Headers (normal requests) ──────────────────────────────
export const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ─── Form Headers (file upload requests) ─────────────────────────
// Content-Type set mat karo — browser khud boundary set karta hai FormData ke liye
export const getFormHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});
