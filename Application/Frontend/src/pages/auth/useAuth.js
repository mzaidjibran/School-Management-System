import { useState, useEffect } from "react";
import { normalizeRole } from "../../Api/Auth_Api.js";

const decodeToken = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

const getAuthState = () => {
  const token = localStorage.getItem("accessToken");
  if (!token || isTokenExpired(token)) {
    if (token) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userImage");
      localStorage.removeItem("user");
      localStorage.removeItem("activeBranch");
      localStorage.removeItem("activeBranchName");
      localStorage.removeItem("activeSection");
    }
    return {
      token: null,
      userRole: null,
      userId: null,
      userName: null,
      userEmail: null,
      userImage: null,
    };
  }

  return {
    token,
    userRole:  normalizeRole(localStorage.getItem("userRole")),
    userId:    localStorage.getItem("userId"),
    userName:  localStorage.getItem("userName"),
    userEmail: localStorage.getItem("userEmail"),
    userImage: localStorage.getItem("userImage"),
  };
};

// Returns the current authenticated user's state and derived role flags.
// Listens to "auth-changed" (same tab) and "storage" (other tabs) to stay in sync.
export const useAuth = () => {
  const [authState, setAuthState] = useState(getAuthState);

  useEffect(() => {
    const handleChange = () => setAuthState(getAuthState());

    window.addEventListener("auth-changed", handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener("auth-changed", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return {
    isLoggedIn: !!authState.token,
    token:      authState.token,
    userRole:   authState.userRole,
    userId:     authState.userId,
    userName:   authState.userName,
    userEmail:  authState.userEmail,
    userImage:  authState.userImage,
    isAdmin:    authState.userRole === "admin",
    isEmployee: authState.userRole === "employee",
    isTeacher:  authState.userRole === "teacher",
    assignedPages: (() => {
      try {
        const u = localStorage.getItem("user");
        return u ? JSON.parse(u).assignedPages || [] : [];
      } catch {
        return [];
      }
    })(),
  };
};