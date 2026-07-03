import { Link, useNavigate } from "react-router-dom";
import { getStoredUser, logout } from "../services/authService";

function DashboardLayout({ title, description }) {
  const navigate = useNavigate();
  const user = getStoredUser();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-card">
          <h2>Welcome, {user?.username}</h2>
          <p>
            Role: <strong>{user?.profile?.role_display}</strong>
          </p>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Assets</h3>
            <p>View and manage company assets.</p>
            <Link className="card-link" to="/assets">
              Open Assets
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>Service Requests</h3>
            <p>Create and track maintenance service requests.</p>
            <Link className="card-link" to="/service-requests">
              Open Service Requests
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>Work Orders</h3>
            <p>Create, assign, and track maintenance work orders.</p>
            <Link className="card-link" to="/work-orders">
              Open Work Orders
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>Maintenance Schedules</h3>
            <p>Plan preventive maintenance and track upcoming due dates.</p>
            <Link className="card-link" to="/maintenance-schedules">
              Open Maintenance Schedules
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>Reports</h3>
            <p>Managers will review maintenance history and reports.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <DashboardLayout
      title="Admin Dashboard"
      description="Manage users, roles, assets, and system settings."
    />
  );
}

export function EmployeeDashboard() {
  return (
    <DashboardLayout
      title="Employee Dashboard"
      description="Submit service requests and track request status."
    />
  );
}

export function TechnicianDashboard() {
  return (
    <DashboardLayout
      title="Technician Dashboard"
      description="View assigned work orders and update maintenance progress."
    />
  );
}

export function ManagerDashboard() {
  return (
    <DashboardLayout
      title="Manager Dashboard"
      description="Monitor assets, work orders, reports, and maintenance performance."
    />
  );
}