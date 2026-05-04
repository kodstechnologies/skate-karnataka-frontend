import RollerSkatingIcon from "@mui/icons-material/RollerSkating";
import Groups2Icon from "@mui/icons-material/Groups2";
import EventIcon from "@mui/icons-material/Event";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import BusinessIcon from "@mui/icons-material/Business";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import { LayoutDashboard, Inbox, Image, Headphones, MessageSquare } from "lucide-react";

export const navigationGroups = [
  {
    label: "Overview",
    items: [{ slug: "dashboard", to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
  },
  {
    label: "Admin Controls",
    items: [
      {
        slug: "officials",
        to: "/officials",
        label: "State Officials",
        icon: AdminPanelSettingsIcon
      }
    ]
  },
  {
    label: "Management",
    items: [
      { slug: "districts", to: "/districts", label: "Districts", icon: LocationCityIcon },
      { slug: "clubs", to: "/clubs", label: "Clubs", icon: Groups2Icon },
      { slug: "skaters", to: "/skaters", label: "Skaters", icon: RollerSkatingIcon },
      { slug: "events", to: "/events", label: "Events", icon: EventIcon },
      { slug: "gallery", to: "/gallery", label: "Gallery", icon: Image },
      { slug: "contact-us", to: "/contact-us", label: "Contact Us", icon: Headphones },
      { slug: "feedback", to: "/feedback", label: "Feedback", icon: MessageSquare },
      {
        slug: "reports",
        to: "/reports/school",
        label: "Reports",
        icon: Inbox,
        children: [
          { slug: "school-reports", to: "/reports/school", label: "School", icon: SchoolIcon },
          {
            slug: "official-reports",
            to: "/reports/official",
            label: "Official",
            icon: WorkspacePremiumIcon
          },
          {
            slug: "parent-reports",
            to: "/reports/parent",
            label: "Parent",
            icon: FamilyRestroomIcon
          },
          {
            slug: "academy-reports",
            to: "/reports/academy",
            label: "Academy",
            icon: BusinessIcon
          }
        ]
      }
    ]
  }
];

export const navigationItems = navigationGroups.flatMap((group) => group.items);
