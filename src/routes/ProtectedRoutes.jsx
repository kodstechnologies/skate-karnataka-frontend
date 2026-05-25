import React, { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
export default function ProtectedRoutes({ children, allowedRoles }) {
  const { isAuthenticated, role, isLoading, logout } = useAuthStore((state) => state);

  useEffect(() => {
    if (isAuthenticated && !isLoading && role && !allowedRoles.includes(role)) {
      toast.error("You are unauthorised");
      logout();
    }
  }, [isAuthenticated, isLoading, role, allowedRoles, logout]);

  if (isLoading)
    return (
      <div className="fixed top-0 left-0 w-[100vw] h-[100vw] flex items-center justify-center">
        <h1 className="text-3xl font-semibold">Loading...</h1>
      </div>
    );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Check role
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
