import axios from "axios";

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;
// import.meta.env.VITE_API_BASE_URL ||
// "http://localhost:5000";

const apiClient = axios.create({
  // Keep /api here so downstream calls can stay `/analysis/...`
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
