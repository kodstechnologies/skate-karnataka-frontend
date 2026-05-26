import React, { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isRoleAllowed = (role, allowedRoles) => {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return allowedRoles.some((allowed) => normalizeRole(allowed) === normalized);
};

export default function ProtectedRoutes({ children, allowedRoles }) {
  const { isAuthenticated, role, isLoading, logout } = useAuthStore((state) => state);
  const roleAllowed = isRoleAllowed(role, allowedRoles);

  useEffect(() => {
    if (isAuthenticated && !isLoading && role && !roleAllowed) {
      toast.error("You are unauthorised");
      logout();
    }
  }, [isAuthenticated, isLoading, role, roleAllowed, logout]);

  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 flex h-screen w-screen items-center justify-center bg-[#fbf6f4]">
        <h1 className="text-3xl font-semibold text-[#2f2829]">Loading...</h1>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!roleAllowed) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
