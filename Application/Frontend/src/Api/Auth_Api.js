const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:3000";

// ── Helpers ───────────────────────────────────────────────────────────────────
const decodeToken = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

export const normalizeRole = (r) => {
  if (!r) return null;
  const lower = String(r).toLowerCase();
  if (lower === "admin" || lower === "administrator") return "admin";
  if (lower === "employee") return "employee";
  return "employee";
};

const notifyAuthChange = () => {
  window.dispatchEvent(new Event("auth-changed"));
};

// ── Sign In ───────────────────────────────────────────────────────────────────
export const signIn = async (email, password) => {
  const response = await fetch(`${API_BASE}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");

  localStorage.setItem("accessToken",  data.data.accessToken);
  localStorage.setItem("refreshToken", data.data.refreshToken);

  if (data.data.user?.role) {
    localStorage.setItem("userRole", data.data.user.role);
  }

  const decoded = decodeToken(data.data.accessToken);
  if (decoded) {
    localStorage.setItem("userId", decoded.userId || decoded._id || decoded.id || "");
  }

  if (data.data.user) {
    localStorage.setItem("user",      JSON.stringify(data.data.user));
    localStorage.setItem("userName",  data.data.user.Name  || "");
    localStorage.setItem("userEmail", data.data.user.email || "");
    localStorage.setItem("userImage", data.data.user.image || "");
  }

  notifyAuthChange();
  return data.data.user;
};

// ── Log Out ───────────────────────────────────────────────────────────────────
export const logOut = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    if (refreshToken) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch {
    // Network error ho tab bhi cleanup karo
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userImage");
    localStorage.removeItem("user");
    notifyAuthChange();
  }
};

// ── Refresh Access Token ──────────────────────────────────────────────────────
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const response = await fetch(`${API_BASE}/api/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error("Session expired");

  localStorage.setItem("accessToken",  data.data.accessToken);
  localStorage.setItem("refreshToken", data.data.refreshToken);

  const decoded = decodeToken(data.data.accessToken);
  if (decoded?.role) {
    localStorage.setItem("userRole", decoded.role);
  }

  notifyAuthChange();
  return data;
};

// ── Auth State Helpers ────────────────────────────────────────────────────────
export const isLoggedIn  = () => !!localStorage.getItem("accessToken");
export const getUserRole = () => localStorage.getItem("userRole") || null;
export const getUserId   = () => localStorage.getItem("userId")   || null;
export const isAdmin     = () => normalizeRole(getUserRole()) === "admin";

// ── Get My Profile ────────────────────────────────────────────────────────────
export const getMyProfile = async () => {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to load profile");
  return data;
};

// ── Update My Profile ─────────────────────────────────────────────────────────
export const updateMyProfile = async (data) => {
  const isFormData = data instanceof FormData;
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    method: "PUT",
    headers: isFormData
      ? { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
      : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    body: isFormData ? data : JSON.stringify(data),
  });
  const responseData = await response.json();
  if (!response.ok) throw new Error(responseData.message || "Profile update failed");
  return responseData;
};

// ── Sign Up ───────────────────────────────────────────────────────────────────
export const signUp = async (userData) => {
  const response = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Signup failed");
  return data;
};

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Forgot password request failed");
  return data;
};

// ── Verify OTP ────────────────────────────────────────────────────────────────
export const verifyOtp = async (email, otp) => {
  const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "OTP verification failed");
  return data;
};

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = async (resetToken, newPassword) => {
  const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetToken, newPassword }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Password reset failed");
  return data;
};