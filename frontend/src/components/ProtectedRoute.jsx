import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken, getCurrentUser, logout } from "../services/authService";

function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const allowedRolesKey = allowedRoles.join(",");

  useEffect(() => {
    async function checkAccess() {
      const token = getAccessToken();

      if (!token) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        const role = user.profile?.role;

        setAllowed(allowedRoles.includes(role));
      } catch (err) {
        logout();
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [allowedRolesKey]);

  if (loading) {
    return <div className="loading-page">Checking access...</div>;
  }

  if (!getAccessToken()) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;