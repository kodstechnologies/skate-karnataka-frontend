import { navigationGroups } from "@/lib/app-shell";
import {
  clubNavigationGroups,
  districtNavigationGroups,
  CLUB_NAV_SLUGS,
  DISTRICT_NAV_SLUGS,
  isPathAllowedForClub,
  isPathAllowedForDistrict
} from "@/lib/role-navigation";

/** Must match OfficialFormPage / backend state official module options. */
export const SUB_ADMIN_MODULE_OPTIONS = [
  "Skaters",
  "Clubs",
  "Events",
  "Gallery",
  "Districts",
  "Reports"
];

const MODULE_TO_NAV_SLUGS = {
  Skaters: ["skaters"],
  Clubs: ["clubs"],
  Events: ["events"],
  Gallery: ["gallery"],
  Districts: ["districts"],
  Reports: ["reports", "complains"]
};

/** Sub-admin Events submenu: hide Events-Category and Formula (state officials with assigned modules). */
const SUB_ADMIN_HIDDEN_EVENT_CHILD_SLUGS = new Set(["events-category", "events-formula"]);

const SUB_ADMIN_BLOCKED_EVENT_PATHS = ["/events/category", "/events/formula"];

const isSubAdminUser = (role, allowedModule) => {
  if (String(role || "").toLowerCase() !== "state") return false;
  return normalizeAllowedModules(allowedModule).length > 0;
};

const PATH_PREFIX_TO_SLUG = [
  ["/skaters", "skaters"],
  ["/clubs", "clubs"],
  ["/events", "events"],
  ["/event", "events"],
  ["/gallery", "gallery"],
  ["/gallery/approvals", "gallery"],
  ["/state/media", "gallery"],
  ["/districts", "districts"],
  ["/discipline", "discipline"],
  ["/reports", "reports"],
  ["/complains", "complains"]
];

const ALWAYS_ALLOWED_PATHS = ["/dashboard", "/profile"];

export const normalizeAllowedModules = (allowedModule) => {
  if (!allowedModule) return [];

  let raw = allowedModule;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        raw = JSON.parse(trimmed);
      } catch {
        raw = [trimmed];
      }
    } else {
      raw = [trimmed];
    }
  }

  if (!Array.isArray(raw)) return [];

  const normalized = [];
  for (const value of raw) {
    if (typeof value !== "string") continue;
    const moduleName = value.trim();
    if (!moduleName) continue;
    normalized.push(moduleName);
  }

  return [...new Set(normalized)];
};

const resolveModuleKey = (moduleName) =>
  SUB_ADMIN_MODULE_OPTIONS.find((option) => option.toLowerCase() === moduleName.toLowerCase());

/** `null` = full access (admin). Otherwise a Set of nav slugs. */
export const getAllowedNavSlugs = (role, allowedModule) => {
  const normalizedRole = String(role || "").toLowerCase();
  if (normalizedRole === "club") {
    return CLUB_NAV_SLUGS;
  }
  if (normalizedRole === "district") {
    return DISTRICT_NAV_SLUGS;
  }
  if (normalizedRole !== "state") {
    return null;
  }

  const modules = normalizeAllowedModules(allowedModule);
  const slugs = new Set(["dashboard"]);

  for (const moduleName of modules) {
    const key = resolveModuleKey(moduleName);
    if (!key) continue;
    const navSlugs = MODULE_TO_NAV_SLUGS[key] || [];
    navSlugs.forEach((slug) => slugs.add(slug));
  }

  return slugs;
};

export const filterNavigationGroups = (groups, role, allowedModule) => {
  const allowedSlugs = getAllowedNavSlugs(role, allowedModule);
  if (!allowedSlugs) {
    return groups;
  }

  return groups
    .map((group) => {
      if (group.label === "Admin Controls") {
        return null;
      }

      const items = group.items
        .filter((item) => {
          if (item.slug === "states") return false;
          if (item.slug === "dashboard") return true;
          return allowedSlugs.has(item.slug);
        })
        .map((item) => {
          if (!Array.isArray(item.children) || !item.children.length) {
            return item;
          }
          if (!allowedSlugs.has(item.slug)) {
            return null;
          }

          // Sub-admin panel: only show Events list — not Events-Category or Formula.
          if (isSubAdminUser(role, allowedModule) && item.slug === "events") {
            const children = item.children.filter(
              (child) => !SUB_ADMIN_HIDDEN_EVENT_CHILD_SLUGS.has(child.slug)
            );
            return children.length ? { ...item, children } : null;
          }

          return item;
        })
        .filter(Boolean);

      if (!items.length) return null;
      return { ...group, items };
    })
    .filter(Boolean);
};

export const getNavigationForUser = (role, allowedModule) => {
  const normalizedRole = String(role || "").toLowerCase();
  if (normalizedRole === "club") {
    const allowedSlugs = CLUB_NAV_SLUGS;
    return {
      navigationGroups: clubNavigationGroups,
      navigationItems: clubNavigationGroups.flatMap((group) => group.items),
      allowedSlugs
    };
  }
  if (normalizedRole === "district") {
    const allowedSlugs = DISTRICT_NAV_SLUGS;
    return {
      navigationGroups: districtNavigationGroups,
      navigationItems: districtNavigationGroups.flatMap((group) => group.items),
      allowedSlugs
    };
  }

  const groups = filterNavigationGroups(navigationGroups, role, allowedModule);
  const items = groups.flatMap((group) => group.items);
  const allowedSlugs = getAllowedNavSlugs(role, allowedModule);
  return { navigationGroups: groups, navigationItems: items, allowedSlugs };
};

export const isPathAllowedForModules = (pathname, allowedSlugs, role, allowedModule) => {
  const normalizedRole = String(role || "").toLowerCase();
  if (normalizedRole === "club") {
    return isPathAllowedForClub(pathname);
  }
  if (normalizedRole === "district") {
    return isPathAllowedForDistrict(pathname);
  }

  if (!allowedSlugs) return true;

  const path = pathname.split("?")[0];

  if (isSubAdminUser(normalizedRole, allowedModule)) {
    const blocked = SUB_ADMIN_BLOCKED_EVENT_PATHS.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    );
    if (blocked) return false;
  }
  if (ALWAYS_ALLOWED_PATHS.some((allowed) => path === allowed || path.startsWith(`${allowed}/`))) {
    return true;
  }

  for (const [prefix, slug] of PATH_PREFIX_TO_SLUG) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return allowedSlugs.has(slug);
    }
  }

  return false;
};
