import axios from "axios";

const API_BASE = "http://localhost:5000/api/analysis";

export async function getRepositories(userId: String) {
  
  const res = await axios.get(`${API_BASE}/repositories`, {
     params: { userId } 
    });
  return res.data.repositories;
}
