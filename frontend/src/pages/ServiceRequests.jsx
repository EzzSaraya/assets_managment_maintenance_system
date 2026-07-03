import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssets } from "../services/assetService";
import { getStoredUser, logout } from "../services/authService";
import {
  createServiceRequest,
  deleteServiceRequest,
  getServiceRequests,
  updateServiceRequest,
} from "../services/serviceRequestService";

const emptyForm = {
  asset: "",
  issue_title: "",
  issue_description: "",
  priority: "MEDIUM",
};

function ServiceRequests() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = user?.profile?.role;

  const canCreate = ["ADMIN", "MANAGER", "EMPLOYEE"].includes(role);
  const canManage = ["ADMIN", "MANAGER"].includes(role);

  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadRequests(searchValue = "") {
    try {
      setLoading(true);
      setError("");
      const data = await getServiceRequests(searchValue);
      setRequests(data.results || data);
    } catch (err) {
      setError("Failed to load service requests");
    } finally {
      setLoading(false);
    }
  }

  async function loadAssets() {
    try {
      const data = await getAssets();
      setAssets(data.results || data);
    } catch (err) {
      setError("Failed to load assets");
    }
  }

  useEffect(() => {
    loadRequests();
    loadAssets();
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

    if (!canCreate) {
      setError("Your role cannot create service requests");
      return;
    }

    try {
      setError("");
      setMessage("");

      await createServiceRequest({
        ...formData,
        asset: Number(formData.asset),
      });

      setMessage("Service request created successfully");
      setFormData(emptyForm);
      loadRequests(search);
    } catch (err) {
      setError("Failed to create service request");
    }
  }

  async function handleStatusChange(requestId, newStatus) {
    try {
      setError("");
      setMessage("");

      await updateServiceRequest(requestId, {
        status: newStatus,
      });

      setMessage("Request status updated successfully");
      loadRequests(search);
    } catch (err) {
      setError("Failed to update request status");
    }
  }

  async function handleAdminNotesChange(requestId, adminNotes) {
    try {
      setError("");
      setMessage("");

      await updateServiceRequest(requestId, {
        admin_notes: adminNotes,
      });

      setMessage("Admin notes updated successfully");
      loadRequests(search);
    } catch (err) {
      setError("Failed to update admin notes");
    }
  }

  async function handleDelete(requestId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service request?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteServiceRequest(requestId);
      setMessage("Service request deleted successfully");
      loadRequests(search);
    } catch (err) {
      setError("Failed to delete service request");
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadRequests(search);
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Service Requests</h1>
          <p>Create, track, and manage maintenance service requests.</p>
        </div>

        <div className="header-actions">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {canCreate && (
          <section className="dashboard-card asset-form-card">
            <h2>Create Service Request</h2>

            <form className="asset-form" onSubmit={handleSubmit}>
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

              <div className="full-width">
                <label>Issue Title</label>
                <input
                  name="issue_title"
                  value={formData.issue_title}
                  onChange={handleChange}
                  placeholder="Example: Generator overheating"
                  required
                />
              </div>

              <div className="full-width">
                <label>Issue Description</label>
                <textarea
                  name="issue_description"
                  value={formData.issue_description}
                  onChange={handleChange}
                  placeholder="Describe the maintenance problem"
                  required
                />
              </div>

              <div className="form-actions full-width">
                <button type="submit">Submit Request</button>
              </div>
            </form>
          </section>
        )}

        {!canCreate && (
          <section className="dashboard-card">
            <h2>View Only</h2>
            <p>Your role can view assigned service requests only.</p>
          </section>
        )}

        <section className="dashboard-card asset-list-card">
          <div className="asset-list-header">
            <h2>Requests List</h2>

            <form onSubmit={handleSearch} className="search-form">
              <input
                placeholder="Search by issue, asset, requester..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <button type="submit">Search</button>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  loadRequests("");
                }}
              >
                Reset
              </button>
            </form>
          </div>

          {loading ? (
            <p>Loading service requests...</p>
          ) : (
            <div className="table-wrapper">
              <table className="assets-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Asset</th>
                    <th>Issue</th>
                    <th>Requester</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Admin Notes</th>
                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={canManage ? "8" : "7"}>
                        No service requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.id}</td>
                        <td>
                          {request.asset_code} - {request.asset_name}
                        </td>
                        <td>
                          <strong>{request.issue_title}</strong>
                          <br />
                          <span>{request.issue_description}</span>
                        </td>
                        <td>{request.requester_username}</td>
                        <td>{request.priority_display}</td>

                        <td>
                          {canManage ? (
                            <select
                              value={request.status}
                              onChange={(event) =>
                                handleStatusChange(request.id, event.target.value)
                              }
                            >
                              <option value="PENDING">Pending</option>
                              <option value="APPROVED">Approved</option>
                              <option value="REJECTED">Rejected</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          ) : (
                            request.status_display
                          )}
                        </td>

                        <td>
                          {canManage ? (
                            <textarea
                              className="table-notes"
                              defaultValue={request.admin_notes}
                              onBlur={(event) =>
                                handleAdminNotesChange(
                                  request.id,
                                  event.target.value
                                )
                              }
                            />
                          ) : (
                            request.admin_notes || "-"
                          )}
                        </td>

                        {canManage && (
                          <td>
                            <div className="table-actions">
                              <button
                                className="danger-button"
                                onClick={() => handleDelete(request.id)}
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

export default ServiceRequests;