import axios from "axios";

const API_BASE_URL =
  import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:5000";

const apiClient = axios.create({
  // /api prefix so downstream calls stay as `/auth/...`, `/analysis/...`
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // CRITICAL — sends the session cookie cross-origin
  headers: {
    "Content-Type": "application/json",
  },
});

// Dev-only: log auth failures to help diagnose cookie/CORS issues
if (import.meta.env.DEV) {
  apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        console.warn(
          "[apiClient] Auth error:",
          err.response.status,
          err.config?.url,
        );
      }
      return Promise.reject(err);
    },
  );
}

export default apiClient;
