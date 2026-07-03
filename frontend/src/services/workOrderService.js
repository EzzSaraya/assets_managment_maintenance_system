const API_BASE_URL = "http://127.0.0.1:8000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getWorkOrders(search = "") {
  const url = search
    ? `${API_BASE_URL}/work-orders/?search=${encodeURIComponent(search)}`
    : `${API_BASE_URL}/work-orders/`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch work orders");
  }

  return response.json();
}

export async function createWorkOrder(workOrderData) {
  const response = await fetch(`${API_BASE_URL}/work-orders/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(workOrderData),
  });

  if (!response.ok) {
    throw new Error("Failed to create work order");
  }

  return response.json();
}

export async function updateWorkOrder(workOrderId, workOrderData) {
  const response = await fetch(`${API_BASE_URL}/work-orders/${workOrderId}/`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(workOrderData),
  });

  if (!response.ok) {
    throw new Error("Failed to update work order");
  }

  return response.json();
}

export async function deleteWorkOrder(workOrderId) {
  const response = await fetch(`${API_BASE_URL}/work-orders/${workOrderId}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete work order");
  }
}