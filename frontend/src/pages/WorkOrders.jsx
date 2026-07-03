import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssets } from "../services/assetService";
import { getServiceRequests } from "../services/serviceRequestService";
import { getStoredUser, getTechnicians, logout } from "../services/authService";
import {
  createWorkOrder,
  deleteWorkOrder,
  getWorkOrders,
  updateWorkOrder,
} from "../services/workOrderService";

const emptyForm = {
  work_order_code: "",
  service_request: "",
  asset: "",
  assigned_technician: "",
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "OPEN",
  scheduled_date: "",
  manager_notes: "",
};

function WorkOrders() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = user?.profile?.role;

  const canManage = ["ADMIN", "MANAGER"].includes(role);
  const isTechnician = role === "TECHNICIAN";

  const [workOrders, setWorkOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadWorkOrders(searchValue = "") {
    try {
      setLoading(true);
      setError("");
      const data = await getWorkOrders(searchValue);
      setWorkOrders(data.results || data);
    } catch (err) {
      setError("Failed to load work orders");
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialData() {
    try {
      const assetsData = await getAssets();
      setAssets(assetsData.results || assetsData);

      const serviceRequestsData = await getServiceRequests();
      setServiceRequests(serviceRequestsData.results || serviceRequestsData);

      if (canManage) {
        const techniciansData = await getTechnicians();
        setTechnicians(techniciansData.results || techniciansData);
      }
    } catch (err) {
      setError("Failed to load form data");
    }
  }

  useEffect(() => {
    loadWorkOrders();
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
      setError("Only admin and manager users can create work orders");
      return;
    }

    try {
      setError("");
      setMessage("");

      const payload = {
        ...formData,
        asset: Number(formData.asset),
        service_request: formData.service_request
          ? Number(formData.service_request)
          : null,
        assigned_technician: formData.assigned_technician
          ? Number(formData.assigned_technician)
          : null,
        scheduled_date: formData.scheduled_date || null,
      };

      await createWorkOrder(payload);

      setMessage("Work order created successfully");
      setFormData(emptyForm);
      loadWorkOrders(search);
    } catch (err) {
      setError("Failed to create work order");
    }
  }

  async function handleUpdate(workOrderId, payload) {
    try {
      setError("");
      setMessage("");

      await updateWorkOrder(workOrderId, payload);

      setMessage("Work order updated successfully");
      loadWorkOrders(search);
    } catch (err) {
      setError("Failed to update work order");
    }
  }

  async function handleDelete(workOrderId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this work order?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteWorkOrder(workOrderId);
      setMessage("Work order deleted successfully");
      loadWorkOrders(search);
    } catch (err) {
      setError("Failed to delete work order");
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadWorkOrders(search);
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Work Orders</h1>
          <p>Create, assign, track, and complete maintenance work orders.</p>
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
            <h2>Create Work Order</h2>

            <form className="asset-form" onSubmit={handleSubmit}>
              <div>
                <label>Work Order Code</label>
                <input
                  name="work_order_code"
                  value={formData.work_order_code}
                  onChange={handleChange}
                  placeholder="WO-001"
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
                <label>Service Request</label>
                <select
                  name="service_request"
                  value={formData.service_request}
                  onChange={handleChange}
                >
                  <option value="">No linked request</option>
                  {serviceRequests.map((request) => (
                    <option key={request.id} value={request.id}>
                      #{request.id} - {request.issue_title}
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
                  <option value="OPEN">Open</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label>Scheduled Date</label>
                <input
                  type="date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleChange}
                />
              </div>

              <div className="full-width">
                <label>Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Inspect generator cooling system"
                  required
                />
              </div>

              <div className="full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the work needed"
                  required
                />
              </div>

              <div className="full-width">
                <label>Manager Notes</label>
                <textarea
                  name="manager_notes"
                  value={formData.manager_notes}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions full-width">
                <button type="submit">Create Work Order</button>
              </div>
            </form>
          </section>
        )}

        {!canManage && (
          <section className="dashboard-card">
            <h2>{isTechnician ? "Assigned Work Orders" : "Work Orders View"}</h2>
            <p>
              {isTechnician
                ? "You can view and update your assigned work orders."
                : "You can view work orders related to your own service requests."}
            </p>
          </section>
        )}

        <section className="dashboard-card asset-list-card">
          <div className="asset-list-header">
            <h2>Work Orders List</h2>

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
                  loadWorkOrders("");
                }}
              >
                Reset
              </button>
            </form>
          </div>

          {loading ? (
            <p>Loading work orders...</p>
          ) : (
            <div className="table-wrapper">
              <table className="assets-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Asset</th>
                    <th>Title</th>
                    <th>Technician</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Technician Notes</th>
                    <th>Manager Notes</th>
                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {workOrders.length === 0 ? (
                    <tr>
                      <td colSpan={canManage ? "10" : "9"}>
                        No work orders found.
                      </td>
                    </tr>
                  ) : (
                    workOrders.map((workOrder) => (
                      <tr key={workOrder.id}>
                        <td>{workOrder.work_order_code}</td>

                        <td>
                          {workOrder.asset_code} - {workOrder.asset_name}
                        </td>

                        <td>
                          <strong>{workOrder.title}</strong>
                          <br />
                          <span>{workOrder.description}</span>
                        </td>

                        <td>{workOrder.assigned_technician_username || "-"}</td>
                        <td>{workOrder.priority_display}</td>

                        <td>
                          {canManage || isTechnician ? (
                            <select
                              value={workOrder.status}
                              onChange={(event) =>
                                handleUpdate(workOrder.id, {
                                  status: event.target.value,
                                })
                              }
                            >
                              <option value="OPEN">Open</option>
                              <option value="ASSIGNED">Assigned</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="ON_HOLD">On Hold</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          ) : (
                            workOrder.status_display
                          )}
                        </td>

                        <td>
                          {canManage || isTechnician ? (
                            <input
                              className="table-progress"
                              type="number"
                              min="0"
                              max="100"
                              defaultValue={workOrder.progress_percentage}
                              onBlur={(event) =>
                                handleUpdate(workOrder.id, {
                                  progress_percentage: Number(event.target.value),
                                })
                              }
                            />
                          ) : (
                            `${workOrder.progress_percentage}%`
                          )}
                        </td>

                        <td>
                          {isTechnician ? (
                            <textarea
                              className="table-notes"
                              defaultValue={workOrder.technician_notes}
                              onBlur={(event) =>
                                handleUpdate(workOrder.id, {
                                  technician_notes: event.target.value,
                                })
                              }
                            />
                          ) : (
                            workOrder.technician_notes || "-"
                          )}
                        </td>

                        <td>
                          {canManage ? (
                            <textarea
                              className="table-notes"
                              defaultValue={workOrder.manager_notes}
                              onBlur={(event) =>
                                handleUpdate(workOrder.id, {
                                  manager_notes: event.target.value,
                                })
                              }
                            />
                          ) : (
                            workOrder.manager_notes || "-"
                          )}
                        </td>

                        {canManage && (
                          <td>
                            <div className="table-actions">
                              <button
                                className="danger-button"
                                onClick={() => handleDelete(workOrder.id)}
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

export default WorkOrders;