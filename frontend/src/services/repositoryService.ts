import apiClient from "@/lib/apiClient";

export async function getRepositories(userId: String) {
  const res = await apiClient.get("/analysis/repositories", {
    params: { userId },
  });
  return res.data.repositories;
}
