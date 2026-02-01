import { useUserCtx } from "../../contexts/UserContext";
import { Navigate } from "react-router-dom";

export function GuestGuard({ children }) {
  const { userId, isLoading } = useUserCtx();

  if (isLoading) {
    return (
      <div>
        <p>Checking if you are logged in...</p>
      </div>
    );
  }

  if (userId) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
