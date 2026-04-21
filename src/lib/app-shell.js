import RollerSkatingIcon from "@mui/icons-material/RollerSkating";
import Groups2Icon from "@mui/icons-material/Groups2";
import EventIcon from "@mui/icons-material/Event";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PublicIcon from "@mui/icons-material/Public";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import BusinessIcon from "@mui/icons-material/Business";
import { LayoutDashboard, Megaphone, Inbox } from "lucide-react";

export const navigationGroups = [
  {
    label: "Overview",
    items: [{ slug: "dashboard", to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
  },
  {
    label: "Management",
    items: [
      { slug: "states", to: "/states", label: "State Officials", icon: PublicIcon },
      { slug: "districts", to: "/districts", label: "Districts", icon: LocationCityIcon },
      { slug: "clubs", to: "/clubs", label: "Clubs", icon: Groups2Icon },
      { slug: "skaters", to: "/skaters", label: "Skaters", icon: RollerSkatingIcon },
      { slug: "events", to: "/events", label: "Events", icon: EventIcon },
      { slug: "circulars", to: "/circulars", label: "Circulars", icon: Megaphone },
      {
        slug: "requests",
        to: "/requests/school",
        label: "Requests",
        icon: Inbox,
        children: [
          { slug: "school-requests", to: "/requests/school", label: "School", icon: SchoolIcon },
          {
            slug: "official-requests",
            to: "/requests/official",
            label: "Official",
            icon: WorkspacePremiumIcon
          },
          {
            slug: "academy-requests",
            to: "/requests/academy",
            label: "Academy",
            icon: BusinessIcon
          }
        ]
      }
    ]
  }
];

export const navigationItems = navigationGroups.flatMap((group) => group.items);
