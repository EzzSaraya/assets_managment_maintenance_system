import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  getCurrentUser,
  getDashboardPath,
  logout,
} from "../services/authService";

function RoleRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    async function redirectUser() {
      const token = getAccessToken();

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const user = await getCurrentUser();
        const role = user.profile?.role;

        navigate(getDashboardPath(role), { replace: true });
      } catch (err) {
        logout();
        navigate("/login", { replace: true });
      }
    }

    redirectUser();
  }, [navigate]);

  return <div className="loading-page">Loading dashboard...</div>;
}

export default RoleRedirect;