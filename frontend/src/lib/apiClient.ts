import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api", // HARD FIX FOR NOW
  headers: {
    "Content-Type": "application/json",
  },
});



export default apiClient;
