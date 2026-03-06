import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/analysis`;

export async function getRepositories(userId: String) {
  
  const res = await axios.get(`${API_BASE}/repositories`, {
     params: { userId } 
    });
  return res.data.repositories;
}
