import {
  LayoutDashboard,
  CalendarDays,
  UserPlus,
  Users,
  FileSpreadsheet,
  Image,
  Layers,
  FunctionSquare,
  Tags
} from "lucide-react";

export const CLUB_NAV_SLUGS = new Set([
  "club-dashboard",
  "club-events",
  "club-media",
  "club-event-categories",
  "club-event-categories-home",
  "club-formula",
  "club-members",
  "club-members-list",
  "club-members-create",
  "club-members-bulk"
]);
export const DISTRICT_NAV_SLUGS = new Set([
  "district-dashboard",
  "district-events",
  "district-media",
  "district-event-categories",
  "district-event-categories-home",
  "district-formula",
  "district-members",
  "district-members-list",
  "district-members-create",
  "district-members-bulk"
]);

export const clubNavigationGroups = [
  {
    label: "Club",
    items: [
      {
        slug: "club-dashboard",
        to: "/club/dashboard",
        label: "Club Dashboard",
        icon: LayoutDashboard
      },
      {
        slug: "club-events",
        to: "/club/events",
        label: "Club Events",
        icon: CalendarDays
      },
      {
        slug: "club-media",
        to: "/club/media",
        label: "Club Media",
        icon: Image
      },
      {
        slug: "club-event-categories",
        to: "/club/event-categories",
        label: "Event Categories",
        icon: Layers,
        children: [
          {
            slug: "club-event-categories-home",
            to: "/club/event-categories",
            label: "Categories",
            icon: Tags
          },
          {
            slug: "club-formula",
            to: "/club/formula",
            label: "Rules",
            icon: FunctionSquare
          }
        ]
      },
      {
        slug: "club-members",
        to: "/club/members",
        label: "Club Members",
        icon: Users,
        children: [
          {
            slug: "club-members-list",
            to: "/club/members",
            label: "View members",
            icon: Users
          },
          {
            slug: "club-members-create",
            to: "/club/members/create",
            label: "Add member",
            icon: UserPlus
          },
          {
            slug: "club-members-bulk",
            to: "/club/members/bulk",
            label: "Bulk upload",
            icon: FileSpreadsheet
          }
        ]
      }
    ]
  }
];

export const districtNavigationGroups = [
  {
    label: "District",
    items: [
      {
        slug: "district-dashboard",
        to: "/district/dashboard",
        label: "District Dashboard",
        icon: LayoutDashboard
      },
      {
        slug: "district-events",
        to: "/district/events",
        label: "District Events",
        icon: CalendarDays
      },
      {
        slug: "district-media",
        to: "/district/media",
        label: "District Media",
        icon: Image
      },
      {
        slug: "district-event-categories",
        to: "/district/event-categories",
        label: "Event Categories",
        icon: Layers,
        children: [
          {
            slug: "district-event-categories-home",
            to: "/district/event-categories",
            label: "Categories",
            icon: Tags
          },
          {
            slug: "district-formula",
            to: "/district/formula",
            label: "Rules",
            icon: FunctionSquare
          }
        ]
      },
      {
        slug: "district-members",
        to: "/district/members",
        label: "District Members",
        icon: Users,
        children: [
          {
            slug: "district-members-list",
            to: "/district/members",
            label: "View members",
            icon: Users
          },
          {
            slug: "district-members-create",
            to: "/district/members/create",
            label: "Add member",
            icon: UserPlus
          },
          {
            slug: "district-members-bulk",
            to: "/district/members/bulk",
            label: "Bulk upload",
            icon: FileSpreadsheet
          }
        ]
      }
    ]
  }
];

const CLUB_PATH_PREFIXES = [
  ["/club/dashboard", "club-dashboard"],
  ["/club/events", "club-events"],
  ["/club/media", "club-media"],
  ["/club/event-categories", "club-event-categories"],
  ["/club/formula", "club-formula"],
  ["/club/members/create", "club-members-create"],
  ["/club/members/bulk", "club-members-bulk"],
  ["/club/members", "club-members-list"],
  ["/profile", "club-dashboard"]
];

const DISTRICT_PATH_PREFIXES = [
  ["/district/dashboard", "district-dashboard"],
  ["/district/events", "district-events"],
  ["/district/media", "district-media"],
  ["/district/event-categories", "district-event-categories"],
  ["/district/formula", "district-formula"],
  ["/district/members/create", "district-members-create"],
  ["/district/members/bulk", "district-members-bulk"],
  ["/district/members", "district-members-list"],
  ["/profile", "district-dashboard"]
];

/** Member list links must match exactly so /members/create does not highlight "View members". */
export const isNavChildActive = (childTo, pathname) => {
  const path = String(pathname || "").split("?")[0];
  const listExactOnly = ["/club/members", "/district/members"];
  if (listExactOnly.includes(childTo)) {
    return path === childTo;
  }
  return path === childTo || path.startsWith(`${childTo}/`);
};

export const getHomePathForRole = (role) => {
  const normalized = String(role || "").toLowerCase();
  if (normalized === "club") return "/club/dashboard";
  if (normalized === "district") return "/district/dashboard";
  return "/dashboard";
};

export const isPathAllowedForClub = (pathname) => {
  const path = pathname.split("?")[0];
  return CLUB_PATH_PREFIXES.some(
    ([prefix]) => path === prefix || path.startsWith(`${prefix}/`)
  );
};

export const isPathAllowedForDistrict = (pathname) => {
  const path = pathname.split("?")[0];
  return DISTRICT_PATH_PREFIXES.some(
    ([prefix]) => path === prefix || path.startsWith(`${prefix}/`)
  );
};
