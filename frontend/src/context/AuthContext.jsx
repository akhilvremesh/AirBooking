import { useEffect, useState } from "react";

import api, { clearTokens, saveTokens } from "../api/client";
import AuthContextValue from "./AuthContextValue";


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!localStorage.getItem("accessToken")) {
        if (active) setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me/");
        if (active) setUser(data);
      } catch {
        clearTokens();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    function handleForcedLogout() {
      setUser(null);
      setLoading(false);
    }

    window.addEventListener("airbooking:logout", handleForcedLogout);
    restoreSession();

    return () => {
      active = false;
      window.removeEventListener("airbooking:logout", handleForcedLogout);
    };
  }, []);

  async function login(credentials) {
    const { data: tokens } = await api.post("/auth/login/", credentials);
    saveTokens(tokens);

    try {
      const { data: currentUser } = await api.get("/auth/me/");
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      clearTokens();
      setUser(null);
      throw error;
    }
  }

  async function register(details) {
    const { data } = await api.post("/auth/register/", details);
    return data;
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  return (
    <AuthContextValue.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: Boolean(user?.is_staff || user?.is_superuser),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContextValue.Provider>
  );
}