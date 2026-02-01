import {
  createContext,
  useState,
  use,
  useEffect,
  useMemo,
  useCallback,
} from "react";

const API_URL = import.meta.env.VITE_API_URL;

const UserContext = createContext({ userId: null, username: null });

export function UserProvider({ children }) {
  const [user, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUserData({ userId: data.user_id, username: data.username });
        }
      } catch (err) {
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const setUser = useCallback((userData) => {
    setUserData(userData);
  }, []);

  const clearUser = useCallback(async () => {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUserData(null);
  }, []);

  const value = useMemo(
    () => ({
      userId: user?.userId || null,
      username: user?.username || null,
      isLoading,
      setUser,
      clearUser,
    }),
    [user, isLoading, setUser, clearUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserCtx() {
  const context = use(UserContext);
  if (!context) {
    throw new Error("useUserCtx must be used within UserProvider");
  }
  return context;
}
