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

// ─── Safe Fetch Wrapper ──────────────────────────────────────────
// Network errors (Failed to fetch) ko readable message mein convert karo
export const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (err) {
    if (err.name === "TypeError" && err.message === "Failed to fetch") {
      throw new Error("Server se connection nahi ho raha. Check karein ke backend chal raha hai aur internet connected hai.");
    }
    throw err;
  }
};
