const API_BASE_URL = "http://127.0.0.1:8000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getMaintenanceSchedules(search = "") {
  const url = search
    ? `${API_BASE_URL}/maintenance-schedules/?search=${encodeURIComponent(search)}`
    : `${API_BASE_URL}/maintenance-schedules/`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch maintenance schedules");
  }

  return response.json();
}

export async function createMaintenanceSchedule(scheduleData) {
  const response = await fetch(`${API_BASE_URL}/maintenance-schedules/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(scheduleData),
  });

  if (!response.ok) {
    throw new Error("Failed to create maintenance schedule");
  }

  return response.json();
}

export async function updateMaintenanceSchedule(scheduleId, scheduleData) {
  const response = await fetch(
    `${API_BASE_URL}/maintenance-schedules/${scheduleId}/`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(scheduleData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update maintenance schedule");
  }

  return response.json();
}

export async function deleteMaintenanceSchedule(scheduleId) {
  const response = await fetch(
    `${API_BASE_URL}/maintenance-schedules/${scheduleId}/`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete maintenance schedule");
  }
}