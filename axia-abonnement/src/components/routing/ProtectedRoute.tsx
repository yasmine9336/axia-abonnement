import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingState from "../common/LoadingState";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles: string[];
}

export default function ProtectedRoute({
  children,
  roles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState heightClassName="min-h-screen" />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}