const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  const data = await response.json();

  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);

  return data;
}

export async function getCurrentUser() {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/auth/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }

  const user = await response.json();
  localStorage.setItem("user", JSON.stringify(user));

  return user;
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function getStoredUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function getDashboardPath(role) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "EMPLOYEE":
      return "/employee";
    case "TECHNICIAN":
      return "/technician";
    case "MANAGER":
      return "/manager";
    default:
      return "/login";
  }
}
export async function getTechnicians() {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/auth/technicians/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch technicians");
  }

  return response.json();
}