import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssets } from "../services/assetService";
import { getStoredUser, getTechnicians, logout } from "../services/authService";
import { getMaintenanceSchedules } from "../services/maintenanceScheduleService";
import {
  createMaintenanceHistory,
  deleteMaintenanceHistory,
  getMaintenanceHistory,
  getReportsSummary,
} from "../services/reportsService";
import { getWorkOrders } from "../services/workOrderService";

const emptyForm = {
  history_code: "",
  asset: "",
  work_order: "",
  maintenance_schedule: "",
  performed_by: "",
  title: "",
  description: "",
  maintenance_type: "CORRECTIVE",
  completion_date: "",
  cost: "0",
  downtime_hours: "0",
  result_notes: "",
};

function Reports() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = user?.profile?.role;

  const canManageReports = ["ADMIN", "MANAGER"].includes(role);
  const canCreateHistory = ["ADMIN", "MANAGER", "TECHNICIAN"].includes(role);

  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [assets, setAssets] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSummary() {
    if (!canManageReports) return;

    try {
      const data = await getReportsSummary();
      setSummary(data);
    } catch (err) {
      setError("Failed to load reports summary");
    }
  }

  async function loadHistory(searchValue = "") {
    try {
      setLoading(true);
      setError("");
      const data = await getMaintenanceHistory(searchValue);
      setHistory(data.results || data);
    } catch (err) {
      setError("Failed to load maintenance history");
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialData() {
    try {
      const assetsData = await getAssets();
      setAssets(assetsData.results || assetsData);

      const workOrdersData = await getWorkOrders();
      setWorkOrders(workOrdersData.results || workOrdersData);

      const schedulesData = await getMaintenanceSchedules();
      setSchedules(schedulesData.results || schedulesData);

      if (canManageReports) {
        const techniciansData = await getTechnicians();
        setTechnicians(techniciansData.results || techniciansData);
      }
    } catch (err) {
      setError("Failed to load form data");
    }
  }

  useEffect(() => {
    loadSummary();
    loadHistory();
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

    if (!canCreateHistory) {
      setError("Your role cannot create maintenance history records");
      return;
    }

    try {
      setError("");
      setMessage("");

      const payload = {
        ...formData,
        asset: Number(formData.asset),
        work_order: formData.work_order ? Number(formData.work_order) : null,
        maintenance_schedule: formData.maintenance_schedule
          ? Number(formData.maintenance_schedule)
          : null,
        performed_by: formData.performed_by
          ? Number(formData.performed_by)
          : undefined,
        cost: Number(formData.cost || 0),
        downtime_hours: Number(formData.downtime_hours || 0),
      };

      await createMaintenanceHistory(payload);

      setMessage("Maintenance history record created successfully");
      setFormData(emptyForm);
      loadHistory(search);
      loadSummary();
    } catch (err) {
      setError("Failed to create maintenance history record");
    }
  }

  async function handleDelete(historyId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this maintenance history record?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteMaintenanceHistory(historyId);

      setMessage("Maintenance history record deleted successfully");
      loadHistory(search);
      loadSummary();
    } catch (err) {
      setError("Failed to delete maintenance history record");
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadHistory(search);
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Reports & Maintenance History</h1>
          <p>Review maintenance records, costs, downtime, and system performance.</p>
        </div>

        <div className="header-actions">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {canManageReports && summary && (
          <section className="reports-summary-grid">
            <div className="dashboard-card summary-card">
              <h3>Assets</h3>
              <p>Total: {summary.assets.total}</p>
              <p>Active: {summary.assets.active}</p>
              <p>Under Maintenance: {summary.assets.under_maintenance}</p>
              <p>Retired: {summary.assets.retired}</p>
            </div>

            <div className="dashboard-card summary-card">
              <h3>Service Requests</h3>
              <p>Total: {summary.service_requests.total}</p>
              <p>Pending: {summary.service_requests.pending}</p>
              <p>Approved: {summary.service_requests.approved}</p>
              <p>Completed: {summary.service_requests.completed}</p>
            </div>

            <div className="dashboard-card summary-card">
              <h3>Work Orders</h3>
              <p>Total: {summary.work_orders.total}</p>
              <p>Open: {summary.work_orders.open}</p>
              <p>Assigned: {summary.work_orders.assigned}</p>
              <p>In Progress: {summary.work_orders.in_progress}</p>
              <p>Completed: {summary.work_orders.completed}</p>
            </div>

            <div className="dashboard-card summary-card">
              <h3>Maintenance</h3>
              <p>Schedules: {summary.maintenance_schedules.total}</p>
              <p>History Records: {summary.maintenance_history.total_records}</p>
              <p>Total Cost: {summary.maintenance_history.total_cost}</p>
              <p>
                Downtime Hours: {summary.maintenance_history.total_downtime_hours}
              </p>
            </div>
          </section>
        )}

        {canCreateHistory && (
          <section className="dashboard-card asset-form-card">
            <h2>Create Maintenance History Record</h2>

            <form className="asset-form" onSubmit={handleSubmit}>
              <div>
                <label>History Code</label>
                <input
                  name="history_code"
                  value={formData.history_code}
                  onChange={handleChange}
                  placeholder="MH-001"
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
                <label>Work Order</label>
                <select
                  name="work_order"
                  value={formData.work_order}
                  onChange={handleChange}
                >
                  <option value="">No linked work order</option>
                  {workOrders.map((workOrder) => (
                    <option key={workOrder.id} value={workOrder.id}>
                      {workOrder.work_order_code} - {workOrder.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Maintenance Schedule</label>
                <select
                  name="maintenance_schedule"
                  value={formData.maintenance_schedule}
                  onChange={handleChange}
                >
                  <option value="">No linked schedule</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.schedule_code} - {schedule.title}
                    </option>
                  ))}
                </select>
              </div>

              {canManageReports && (
                <div>
                  <label>Performed By</label>
                  <select
                    name="performed_by"
                    value={formData.performed_by}
                    onChange={handleChange}
                  >
                    <option value="">Current user</option>
                    {technicians.map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label>Maintenance Type</label>
                <select
                  name="maintenance_type"
                  value={formData.maintenance_type}
                  onChange={handleChange}
                >
                  <option value="PREVENTIVE">Preventive</option>
                  <option value="CORRECTIVE">Corrective</option>
                  <option value="INSPECTION">Inspection</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>

              <div>
                <label>Completion Date</label>
                <input
                  type="date"
                  name="completion_date"
                  value={formData.completion_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Downtime Hours</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="downtime_hours"
                  value={formData.downtime_hours}
                  onChange={handleChange}
                />
              </div>

              <div className="full-width">
                <label>Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Generator cooling system inspection completed"
                  required
                />
              </div>

              <div className="full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="full-width">
                <label>Result Notes</label>
                <textarea
                  name="result_notes"
                  value={formData.result_notes}
                  onChange={handleChange}
                  placeholder="Write maintenance result notes"
                />
              </div>

              <div className="form-actions full-width">
                <button type="submit">Create History Record</button>
              </div>
            </form>
          </section>
        )}

        <section className="dashboard-card asset-list-card">
          <div className="asset-list-header">
            <h2>Maintenance History</h2>

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
                  loadHistory("");
                }}
              >
                Reset
              </button>
            </form>
          </div>

          {loading ? (
            <p>Loading maintenance history...</p>
          ) : (
            <div className="table-wrapper">
              <table className="assets-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Asset</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Performed By</th>
                    <th>Completion Date</th>
                    <th>Cost</th>
                    <th>Downtime</th>
                    <th>Result Notes</th>
                    {canManageReports && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={canManageReports ? "10" : "9"}>
                        No maintenance history records found.
                      </td>
                    </tr>
                  ) : (
                    history.map((record) => (
                      <tr key={record.id}>
                        <td>{record.history_code}</td>

                        <td>
                          {record.asset_code} - {record.asset_name}
                        </td>

                        <td>
                          <strong>{record.title}</strong>
                          <br />
                          <span>{record.description || "-"}</span>
                        </td>

                        <td>{record.maintenance_type_display}</td>
                        <td>{record.performed_by_username || "-"}</td>
                        <td>{record.completion_date}</td>
                        <td>{record.cost}</td>
                        <td>{record.downtime_hours} hrs</td>
                        <td>{record.result_notes || "-"}</td>

                        {canManageReports && (
                          <td>
                            <div className="table-actions">
                              <button
                                className="danger-button"
                                onClick={() => handleDelete(record.id)}
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

export default Reports;