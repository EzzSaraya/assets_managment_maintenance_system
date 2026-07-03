import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssets } from "../services/assetService";
import { getStoredUser, getTechnicians, logout } from "../services/authService";
import {
  createMaintenanceSchedule,
  deleteMaintenanceSchedule,
  getMaintenanceSchedules,
  updateMaintenanceSchedule,
} from "../services/maintenanceScheduleService";

const emptyForm = {
  schedule_code: "",
  asset: "",
  assigned_technician: "",
  title: "",
  description: "",
  frequency: "MONTHLY",
  priority: "MEDIUM",
  status: "ACTIVE",
  next_due_date: "",
  last_completed_date: "",
  notes: "",
};

function MaintenanceSchedules() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = user?.profile?.role;

  const canManage = ["ADMIN", "MANAGER"].includes(role);
  const isTechnician = role === "TECHNICIAN";

  const [schedules, setSchedules] = useState([]);
  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSchedules(searchValue = "") {
    try {
      setLoading(true);
      setError("");
      const data = await getMaintenanceSchedules(searchValue);
      setSchedules(data.results || data);
    } catch (err) {
      setError("Failed to load maintenance schedules");
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialData() {
    try {
      const assetsData = await getAssets();
      setAssets(assetsData.results || assetsData);

      if (canManage) {
        const techniciansData = await getTechnicians();
        setTechnicians(techniciansData.results || techniciansData);
      }
    } catch (err) {
      setError("Failed to load form data");
    }
  }

  useEffect(() => {
    loadSchedules();
    loadInitialData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canManage) {
      setError("Only admin and manager users can create schedules");
      return;
    }

    try {
      setError("");
      setMessage("");

      const payload = {
        ...formData,
        asset: Number(formData.asset),
        assigned_technician: formData.assigned_technician
          ? Number(formData.assigned_technician)
          : null,
        last_completed_date: formData.last_completed_date || null,
      };

      await createMaintenanceSchedule(payload);

      setMessage("Maintenance schedule created successfully");
      setFormData(emptyForm);
      loadSchedules(search);
    } catch (err) {
      setError("Failed to create maintenance schedule");
    }
  }

  async function handleUpdate(scheduleId, payload) {
    try {
      setError("");
      setMessage("");

      await updateMaintenanceSchedule(scheduleId, payload);

      setMessage("Maintenance schedule updated successfully");
      loadSchedules(search);
    } catch (err) {
      setError("Failed to update maintenance schedule");
    }
  }

  async function handleDelete(scheduleId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this maintenance schedule?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteMaintenanceSchedule(scheduleId);
      setMessage("Maintenance schedule deleted successfully");
      loadSchedules(search);
    } catch (err) {
      setError("Failed to delete maintenance schedule");
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadSchedules(search);
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Maintenance Schedules</h1>
          <p>Plan preventive maintenance and track upcoming due dates.</p>
        </div>

        <div className="header-actions">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {canManage && (
          <section className="dashboard-card asset-form-card">
            <h2>Create Maintenance Schedule</h2>

            <form className="asset-form" onSubmit={handleSubmit}>
              <div>
                <label>Schedule Code</label>
                <input
                  name="schedule_code"
                  value={formData.schedule_code}
                  onChange={handleChange}
                  placeholder="MS-001"
                  required
                />
              </div>

              <div>
                <label>Asset</label>
                <select
                  name="asset"
                  value={formData.asset}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select asset</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.asset_code} - {asset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Assigned Technician</label>
                <select
                  name="assigned_technician"
                  value={formData.assigned_technician}
                  onChange={handleChange}
                >
                  <option value="">Unassigned</option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Frequency</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              <div>
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div>
                <label>Next Due Date</label>
                <input
                  type="date"
                  name="next_due_date"
                  value={formData.next_due_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Last Completed Date</label>
                <input
                  type="date"
                  name="last_completed_date"
                  value={formData.last_completed_date}
                  onChange={handleChange}
                />
              </div>

              <div className="full-width">
                <label>Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Monthly generator inspection"
                  required
                />
              </div>

              <div className="full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the preventive maintenance task"
                />
              </div>

              <div className="full-width">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions full-width">
                <button type="submit">Create Schedule</button>
              </div>
            </form>
          </section>
        )}

        {!canManage && (
          <section className="dashboard-card">
            <h2>
              {isTechnician
                ? "Assigned Maintenance Schedules"
                : "Maintenance Schedule View"}
            </h2>
            <p>
              {isTechnician
                ? "You can view assigned schedules and update completion information."
                : "You can view active maintenance schedules."}
            </p>
          </section>
        )}

        <section className="dashboard-card asset-list-card">
          <div className="asset-list-header">
            <h2>Schedules List</h2>

            <form onSubmit={handleSearch} className="search-form">
              <input
                placeholder="Search by code, title, asset, technician..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <button type="submit">Search</button>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  loadSchedules("");
                }}
              >
                Reset
              </button>
            </form>
          </div>

          {loading ? (
            <p>Loading maintenance schedules...</p>
          ) : (
            <div className="table-wrapper">
              <table className="assets-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Asset</th>
                    <th>Title</th>
                    <th>Technician</th>
                    <th>Frequency</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Next Due</th>
                    <th>Last Completed</th>
                    <th>Notes</th>
                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {schedules.length === 0 ? (
                    <tr>
                      <td colSpan={canManage ? "11" : "10"}>
                        No maintenance schedules found.
                      </td>
                    </tr>
                  ) : (
                    schedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td>{schedule.schedule_code}</td>

                        <td>
                          {schedule.asset_code} - {schedule.asset_name}
                        </td>

                        <td>
                          <strong>{schedule.title}</strong>
                          <br />
                          <span>{schedule.description || "-"}</span>
                        </td>

                        <td>{schedule.assigned_technician_username || "-"}</td>
                        <td>{schedule.frequency_display}</td>
                        <td>{schedule.priority_display}</td>

                        <td>
                          {canManage ? (
                            <select
                              value={schedule.status}
                              onChange={(event) =>
                                handleUpdate(schedule.id, {
                                  status: event.target.value,
                                })
                              }
                            >
                              <option value="ACTIVE">Active</option>
                              <option value="INACTIVE">Inactive</option>
                            </select>
                          ) : (
                            schedule.status_display
                          )}
                        </td>

                        <td>
                          {canManage ? (
                            <input
                              type="date"
                              defaultValue={schedule.next_due_date}
                              onBlur={(event) =>
                                handleUpdate(schedule.id, {
                                  next_due_date: event.target.value,
                                })
                              }
                            />
                          ) : (
                            schedule.next_due_date
                          )}
                        </td>

                        <td>
                          {canManage || isTechnician ? (
                            <input
                              type="date"
                              defaultValue={schedule.last_completed_date || ""}
                              onBlur={(event) =>
                                handleUpdate(schedule.id, {
                                  last_completed_date:
                                    event.target.value || null,
                                })
                              }
                            />
                          ) : (
                            schedule.last_completed_date || "-"
                          )}
                        </td>

                        <td>
                          {canManage || isTechnician ? (
                            <textarea
                              className="table-notes"
                              defaultValue={schedule.notes}
                              onBlur={(event) =>
                                handleUpdate(schedule.id, {
                                  notes: event.target.value,
                                })
                              }
                            />
                          ) : (
                            schedule.notes || "-"
                          )}
                        </td>

                        {canManage && (
                          <td>
                            <div className="table-actions">
                              <button
                                className="danger-button"
                                onClick={() => handleDelete(schedule.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MaintenanceSchedules;