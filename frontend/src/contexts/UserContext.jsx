"use client";

import { createContext, useState, use, useEffect } from "react";
import { db } from "@/lib/db";

function setSessionToken(session_token, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `session_token=${session_token}; expires=${expires}; path=/`;
}

function getSessionToken() {
  return (
    document.cookie
      .split("; ")
      .find((str) => str.startsWith("session_token="))
      ?.split("=")[1] || null
  );
}

function deleteSessionToken() {
  document.cookie = `session_token=; Max-Age=0; path=/`;
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUserData] = useState({
    session_token: null,
    userId: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let savedToken = getSessionToken();

    if (savedToken) {
      const userId = null;
      // #TMP GET USERID FROM DB BY GIVING TOKEN
      if (userId) {
        setUserData({ session_token: savedToken, userId });
      } else {
        deleteSessionToken();
        setUserData({ session_token: null, userId: null });
      }
    } else {
      setUserData({ session_token: null, userId: null });
    }

    setIsLoading(false);
  }, []);

  const setUser = (data) => {
    setUserData(data);
    if (data.session_token) {
      setSessionToken(data.session_token);
    } else {
      deleteSessionToken();
    }
  };

  const clearUser = () => {
    const session_token = getSessionToken();
    if (session_token) db.removeSession(session_token);
    deleteSessionToken();
    setUserData({ session_token: null, userId: null });
  };

  const logout = () => {
    const session_token = getSessionToken();
    if (session_token) db.removeSession(session_token);

    deleteSessionToken();
    setUserData({ session_token: null, userId: null });
  };

  return (
    <UserContext.Provider
      value={{
        session_token: user.session_token,
        userId: user.userId,
        isLoading,
        setUser,
        logout,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserCtx() {
  const context = use(UserContext);
  if (!context) {
    throw new Error("useUserCtx must be used within UserProvider");
  }
  return context;
}
