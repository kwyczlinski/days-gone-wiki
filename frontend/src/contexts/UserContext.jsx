import { createContext, useState, useEffect, useMemo, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { generateRandomString, createCodeChallenge } from "../utils/auth/pkce"

const API_URL = window._env_?.VITE_API_URL || import.meta.env.VITE_API_URL;
const AUTHENTIK_PUBLIC_URL = window._env_?.VITE_AUTHENTIK_PUBLIC_URL || import.meta.env.VITE_AUTHENTIK_PUBLIC_URL;
const CLIENT_ID = window._env_?.VITE_AUTHENTIK_CLIENT_ID || import.meta.env.VITE_AUTHENTIK_CLIENT_ID;
const REDIRECT_URI = window.location.origin;

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();

      setUser({
        userId: data.user_id || data.sub,
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
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
      // const codeVerifier = "thatIsNotAValidCodeVerifierForTestingIfItReallyUsesIt"

      if (code && codeVerifier) {
        try {
          const exchangeRes = await fetch(`${API_URL}/auth/callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, redirect_uri: REDIRECT_URI, code_verifier: codeVerifier }),
          });

          if (!exchangeRes.ok) {
            throw new Error("Failed to exchange authorization code");
          }

          sessionStorage.removeItem("pkce_code_verifier");
          window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);

          toast.success("Successfully logged in!");
        } catch (err) {
          console.error("OAuth callback error:", err);
          toast.error("Authentication failed.");
        }
      }

      await fetchUser();
      setIsLoading(false);
    };

    handleAuthOrFetch();
  }, [fetchUser]);


  const login = useCallback(async () => {

    const codeVerifier = generateRandomString(64);
    sessionStorage.setItem("pkce_code_verifier", codeVerifier);

    const codeChallenge = await createCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      scope: "openid profile email groups",
      redirect_uri: REDIRECT_URI,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const targetUrl = `${AUTHENTIK_PUBLIC_URL}/application/o/authorize/?${params.toString()}`;
    window.location.href = targetUrl;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: "POST" });
    } catch (err) {
      console.error("Backend logout failed", err);
    }

    setUser(null);
    toast.info("Logging out from SSO...");

    const endSessionUrl = `${AUTHENTIK_PUBLIC_URL}/application/o/days-gone-wiki/end-session/`;
    const params = new URLSearchParams({
      post_logout_redirect_uri: window.location.origin
    });

    window.location.href = `${endSessionUrl}?${params.toString()}`;
    // window.location.href = REDIRECT_URI;
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