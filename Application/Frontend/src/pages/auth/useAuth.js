import { useState, useEffect } from "react";
import { normalizeRole } from "../../Api/Auth_Api.js";

// Reads current auth state from localStorage.
const getAuthState = () => ({
  token:     localStorage.getItem("accessToken"),
  userRole:  normalizeRole(localStorage.getItem("userRole")),
  userId:    localStorage.getItem("userId"),
  userName:  localStorage.getItem("userName"),
  userEmail: localStorage.getItem("userEmail"),
  userImage: localStorage.getItem("userImage"),
});

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
  };
};