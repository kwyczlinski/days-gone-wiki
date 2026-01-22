import { useEffect } from "react";
import { useUserCtx } from "../../contexts/UserContext";
import { useNavigate, Navigate } from "react-router-dom";

export function GuestGuard({ children }) {
  const { session_token, isLoading, clearUser } = useUserCtx();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    const session_valid = false;
    // #TMP ADD API & DB SESSION VALIDATION
    if (session_valid) {
      navigate("/");
    } else {
      clearUser();
    }
  }, [session_token, isLoading, navigate, clearUser]);

  if (isLoading) {
    return (
      <div>
        {/* ADD A SPINNER */}
        <p>Checking if you are logged in</p>
      </div>
    );
  }

  if (session_token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
