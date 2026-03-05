import { useMember } from "../../integrations";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: any) {
  const { member, isLoading: loading } = useMember();

  if (loading) return null;

  if (!member) {
    return <Navigate to="/" replace />;
  }

  return children;
}