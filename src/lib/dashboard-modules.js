import { normalizeAllowedModules } from "@/lib/navigation-modules";

export const canShowDashboardModule = (role, allowedModule, moduleName) => {
  if (String(role || "").toLowerCase() !== "state") {
    return true;
  }

  const modules = normalizeAllowedModules(allowedModule);
  if (!modules.length) {
    return false;
  }

  return modules.some((entry) => entry.toLowerCase() === String(moduleName || "").toLowerCase());
};

export const filterDashboardStats = (stats, role, allowedModule) =>
  (stats || []).filter((stat) => canShowDashboardModule(role, allowedModule, stat.module));
