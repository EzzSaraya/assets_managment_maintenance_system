const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/health/`);

  if (!response.ok) {
    throw new Error("Backend connection failed");
  }

  return response.json();
}