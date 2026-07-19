const API_BASE_URL =
  import.meta.env.PUBLIC_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const API_BASE = `${API_BASE_URL}/api/analysis`;

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: HeadersInit;
};

export async function apiRequest(path: string, options: ApiOptions = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "API request failed");
  }

  return res.json();
}
