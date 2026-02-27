import axios from "axios";

const API_BASE = "http://localhost:5000/api/analysis";

export async function getRepositories() {
  const res = await axios.get(`${API_BASE}/repositories`);
  return res.data.repositories;
}
