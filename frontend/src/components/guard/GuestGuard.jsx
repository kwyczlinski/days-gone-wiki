import { useEffect } from "react";
import { useUserCtx } from "@/contexts/UserContext";
import { redirect } from "react-router-dom";

export function GuestGuard({ children }) {
  const { session_token, isLoading, clearUser } = useUserCtx();

  useEffect(() => {
    if (isLoading) return;

    const session_valid = true;
    // #TMP ADD API & DB SESSION VALIDATION
    if (session_valid) {
      throw redirect("/");
    } else {
      clearUser();
    }
  }, [session_token, isLoading]);

  if (isLoading) {
    return (
      <div>
        {/* ADD A SPINNER */}
        <p>Checking if you are logged in</p>
      </div>
    );
  }

  return !session_token ? <>{children}</> : null;
}
