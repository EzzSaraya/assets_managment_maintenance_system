import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAsset,
  deleteAsset,
  getAssets,
  updateAsset,
} from "../services/assetService";
import { getStoredUser, logout } from "../services/authService";

const emptyForm = {
  asset_code: "",
  name: "",
  category: "EQUIPMENT",
  status: "ACTIVE",
  location: "",
  manufacturer: "",
  serial_number: "",
  purchase_date: "",
  description: "",
};

function Assets() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = user?.profile?.role;
  const isAdmin = role === "ADMIN";

  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAssets(searchValue = "") {
    try {
      setLoading(true);
      setError("");
      const data = await getAssets(searchValue);
      setAssets(data.results || data);
    } catch (err) {
      setError("Failed to load assets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
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

    if (!isAdmin) {
      setError("Only admin users can modify assets");
      return;
    }

    try {
      setError("");
      setMessage("");

      const payload = {
        ...formData,
        purchase_date: formData.purchase_date || null,
      };

      if (editingId) {
        await updateAsset(editingId, payload);
        setMessage("Asset updated successfully");
      } else {
        await createAsset(payload);
        setMessage("Asset created successfully");
      }

      setFormData(emptyForm);
      setEditingId(null);
      loadAssets(search);
    } catch (err) {
      setError("Failed to save asset");
    }
  }

  function handleEdit(asset) {
    setEditingId(asset.id);
    setFormData({
      asset_code: asset.asset_code || "",
      name: asset.name || "",
      category: asset.category || "EQUIPMENT",
      status: asset.status || "ACTIVE",
      location: asset.location || "",
      manufacturer: asset.manufacturer || "",
      serial_number: asset.serial_number || "",
      purchase_date: asset.purchase_date || "",
      description: asset.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(assetId) {
    const confirmed = window.confirm("Are you sure you want to delete this asset?");

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");
      await deleteAsset(assetId);
      setMessage("Asset deleted successfully");
      loadAssets(search);
    } catch (err) {
      setError("Failed to delete asset");
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormData(emptyForm);
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleSearch(event) {
    event.preventDefault();
    loadAssets(search);
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Asset Management</h1>
          <p>View, register, update, and manage company assets.</p>
        </div>

        <div className="header-actions">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {isAdmin && (
          <section className="dashboard-card asset-form-card">
            <h2>{editingId ? "Edit Asset" : "Add New Asset"}</h2>

            <form className="asset-form" onSubmit={handleSubmit}>
              <div>
                <label>Asset Code</label>
                <input
                  name="asset_code"
                  value={formData.asset_code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="VEHICLE">Vehicle</option>
                  <option value="IT">IT Asset</option>
                  <option value="FURNITURE">Furniture</option>
                  <option value="BUILDING">Building</option>
                  <option value="OTHER">Other</option>
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
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>

              <div>
                <label>Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Manufacturer</label>
                <input
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Serial Number</label>
                <input
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Purchase Date</label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleChange}
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

              <div className="form-actions full-width">
                <button type="submit">
                  {editingId ? "Update Asset" : "Add Asset"}
                </button>

                {editingId && (
                  <button type="button" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        {!isAdmin && (
          <section className="dashboard-card">
            <h2>Assets View Only</h2>
            <p>Your role can view assets but cannot create, update, or delete them.</p>
          </section>
        )}

        <section className="dashboard-card asset-list-card">
          <div className="asset-list-header">
            <h2>Assets List</h2>

            <form onSubmit={handleSearch} className="search-form">
              <input
                placeholder="Search by code, name, location, serial..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="submit">Search</button>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  loadAssets("");
                }}
              >
                Reset
              </button>
            </form>
          </div>

          {loading ? (
            <p>Loading assets...</p>
          ) : (
            <div className="table-wrapper">
              <table className="assets-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Manufacturer</th>
                    <th>Serial</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {assets.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? "8" : "7"}>No assets found.</td>
                    </tr>
                  ) : (
                    assets.map((asset) => (
                      <tr key={asset.id}>
                        <td>{asset.asset_code}</td>
                        <td>{asset.name}</td>
                        <td>{asset.category_display}</td>
                        <td>{asset.status_display}</td>
                        <td>{asset.location}</td>
                        <td>{asset.manufacturer || "-"}</td>
                        <td>{asset.serial_number || "-"}</td>

                        {isAdmin && (
                          <td>
                            <div className="table-actions">
                              <button onClick={() => handleEdit(asset)}>
                                Edit
                              </button>
                              <button
                                className="danger-button"
                                onClick={() => handleDelete(asset.id)}
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

export default Assets;