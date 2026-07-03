import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Assets from "./pages/Assets";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRedirect from "./components/RoleRedirect";
import Login from "./pages/Login";
import {
  AdminDashboard,
  EmployeeDashboard,
  ManagerDashboard,
  TechnicianDashboard,
} from "./pages/Dashboards";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RoleRedirect />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/assets"
  element={
    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "TECHNICIAN", "EMPLOYEE"]}>
      <Assets />
    </ProtectedRoute>
  }
/>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;