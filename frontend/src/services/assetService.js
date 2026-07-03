const API_BASE_URL = "http://127.0.0.1:8000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getAssets(search = "") {
  const url = search
    ? `${API_BASE_URL}/assets/?search=${encodeURIComponent(search)}`
    : `${API_BASE_URL}/assets/`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch assets");
  }

  return response.json();
}

export async function createAsset(assetData) {
  const response = await fetch(`${API_BASE_URL}/assets/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(assetData),
  });

  if (!response.ok) {
    throw new Error("Failed to create asset");
  }

  return response.json();
}

export async function updateAsset(assetId, assetData) {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(assetData),
  });

  if (!response.ok) {
    throw new Error("Failed to update asset");
  }

  return response.json();
}

export async function deleteAsset(assetId) {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete asset");
  }
}