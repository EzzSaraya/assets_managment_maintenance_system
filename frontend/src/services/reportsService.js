const API_BASE_URL = "http://127.0.0.1:8000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getMaintenanceHistory(search = "") {
  const url = search
    ? `${API_BASE_URL}/maintenance-history/?search=${encodeURIComponent(search)}`
    : `${API_BASE_URL}/maintenance-history/`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch maintenance history");
  }

  return response.json();
}

export async function createMaintenanceHistory(historyData) {
  const response = await fetch(`${API_BASE_URL}/maintenance-history/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(historyData),
  });

  if (!response.ok) {
    throw new Error("Failed to create maintenance history record");
  }

  return response.json();
}

export async function updateMaintenanceHistory(historyId, historyData) {
  const response = await fetch(`${API_BASE_URL}/maintenance-history/${historyId}/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(historyData),
  });

  if (!response.ok) {
    throw new Error("Failed to update maintenance history record");
  }

  return response.json();
}

export async function deleteMaintenanceHistory(historyId) {
  const response = await fetch(`${API_BASE_URL}/maintenance-history/${historyId}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete maintenance history record");
  }
}

export async function getReportsSummary() {
  const response = await fetch(`${API_BASE_URL}/reports/summary/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reports summary");
  }

  return response.json();
}