import RollerSkatingIcon from "@mui/icons-material/RollerSkating";
import Groups2Icon from "@mui/icons-material/Groups2";
import EventIcon from "@mui/icons-material/Event";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PublicIcon from "@mui/icons-material/Public";
import { LayoutDashboard } from "lucide-react";

export const navigationGroups = [
  {
    label: "Overview",
    items: [{ slug: "dashboard", to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
  },
  {
    label: "Management",
    items: [
      { slug: "states", to: "/states", label: "States", icon: PublicIcon },
      { slug: "districts", to: "/districts", label: "Districts", icon: LocationCityIcon },
      { slug: "clubs", to: "/clubs", label: "Clubs", icon: Groups2Icon },
      { slug: "skaters", to: "/skaters", label: "Skaters", icon: RollerSkatingIcon },
      { slug: "events", to: "/events", label: "Events", icon: EventIcon }
    ]
  }
];

export const navigationItems = navigationGroups.flatMap((group) => group.items);
