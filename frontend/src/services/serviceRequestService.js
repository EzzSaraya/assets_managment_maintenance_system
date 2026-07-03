const API_BASE_URL = "http://127.0.0.1:8000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getServiceRequests(search = "") {
  const url = search
    ? `${API_BASE_URL}/service-requests/?search=${encodeURIComponent(search)}`
    : `${API_BASE_URL}/service-requests/`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch service requests");
  }

  return response.json();
}

export async function createServiceRequest(requestData) {
  const response = await fetch(`${API_BASE_URL}/service-requests/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    throw new Error("Failed to create service request");
  }

  return response.json();
}

export async function updateServiceRequest(requestId, requestData) {
  const response = await fetch(`${API_BASE_URL}/service-requests/${requestId}/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    throw new Error("Failed to update service request");
  }

  return response.json();
}

export async function deleteServiceRequest(requestId) {
  const response = await fetch(`${API_BASE_URL}/service-requests/${requestId}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete service request");
  }
}