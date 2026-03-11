import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://codelens-platform.onrender.com";

const apiClient = axios.create({
  // Keep /api here so downstream calls can stay `/analysis/...`
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
