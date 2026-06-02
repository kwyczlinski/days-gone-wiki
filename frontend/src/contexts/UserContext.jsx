import { createContext, useState, useEffect, useMemo, useCallback, useContext } from "react";
import { toast } from "react-toastify";

// =====================================================================
// AUTHENTIK CONFIG 
// =====================================================================
const AUTHENTIK_PUBLIC_URL = import.meta.env.VITE_AUTHENTIK_PUBLIC_URL;
const CLIENT_ID = import.meta.env.VITE_AUTHENTIK_CLIENT_ID;
const REDIRECT_URI = window.location.origin;

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  const fetchUser = useCallback(async () => {
    try {
      // Requests with credentials automatically attach HttpOnly session cookies
      const res = await fetch("/api/me", {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();

      // Maps username, id, and groups/roles from your backend payload
      setUser({
        userId: data.user_id || data.sub, // Fallback depending on your backend key
        username: data.username || data.preferred_username,
        email: data.email,
        roles: data.roles || data.groups || [], 
      });
    } catch (err) {
      console.error("fetchUser error:", err);
      setUser(null);
    }
  }, []);


  useEffect(() => {
    const handleAuthOrFetch = async () => {
      setIsLoading(true);
      
      // Check if we just got redirected back from Authentik with a code
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        try {
          // Send the code to your backend so it can swap it for access tokens/cookies
          const exchangeRes = await fetch("/api/auth/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
          });

          if (!exchangeRes.ok) {
            throw new Error("Failed to exchange authorization code");
          }

          // Clean up the URL query params so the user doesn't see '?code=...'
          window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
          
          toast.success("Successfully logged in!");
        } catch (err) {
          console.error("OAuth callback error:", err);
          toast.error("Authentication failed.");
        }
      }

      // No matter what (fresh load OR just finished exchanging code), fetch the user profile
      await fetchUser();
      setIsLoading(false);
    };

    handleAuthOrFetch();
  }, [fetchUser]);


  const login = useCallback(() => {
    if (!CLIENT_ID || !AUTHENTIK_PUBLIC_URL) {
      console.error("Missing Authentik environment variables!");
      toast.error("Auth configuration error");
      return;
    }

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code", 
      scope: "openid profile email groups", // Added 'groups' to scope so Authentik sends roles
      redirect_uri: REDIRECT_URI,
    });

    const targetUrl = `${AUTHENTIK_PUBLIC_URL}/application/o/authorize/?${params.toString()}`;
    window.location.href = targetUrl;
  }, []);


  const logout = useCallback(async () => {
    try {
      // 1. Informujemy nasz backend, aby skasował ciasteczko access_token
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Backend logout failed", err);
    }

    // 2. Czyścimy stan lokalny w React
    setUser(null);
    toast.info("Logging out from SSO...");

    // 3. PRZEKIEROWANIE DO AUTHENTIKA: To zabije sesję w panelu Authentika.
    // Parametr 'post_logout_redirect_uri' mówi Authentikowi, gdzie ma odesłać użytkownika PO wylogowaniu.
    const endSessionUrl = `${AUTHENTIK_PUBLIC_URL}/application/o/days-gone-wiki/end-session/`;
    const params = new URLSearchParams({
      post_logout_redirect_uri: window.location.origin // czyli https://localhost:5173
    });

    window.location.href = `${endSessionUrl}?${params.toString()}`;
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      refreshUser: fetchUser,
    }),
    [user, isLoading, isAuthenticated, login, logout, fetchUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserCtx() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserCtx must be used within UserProvider");
  }
  return context;
}