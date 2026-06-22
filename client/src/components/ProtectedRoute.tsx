import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-ink p-6 text-white">Loading BillFast...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
