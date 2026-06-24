import RollerSkatingIcon from "@mui/icons-material/RollerSkating";
import Groups2Icon from "@mui/icons-material/Groups2";
import EventIcon from "@mui/icons-material/Event";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import BusinessIcon from "@mui/icons-material/Business";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

import {
  Layers,
  Info,
  FileText,
  LayoutDashboard,
  Inbox,
  Image,
  Headphones,
  MessageSquare,
  AlertTriangle,
  Award,
  Newspaper,
  Handshake,
  HeartHandshake,
  HelpingHand,
  Grid,
  Folder,
  Tags,
  FunctionSquare,
  Smartphone,
  CreditCard
} from "lucide-react";

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
      { slug: "discipline", to: "/discipline", label: "Discipline", icon: Layers },
      { slug: "about", to: "/about", label: "About Us", icon: Info },
      { slug: "about-us-card", to: "/about-us-card", label: "About usCard", icon: CreditCard },
      { slug: "onboarding", to: "/onboarding", label: "Onboarding", icon: Smartphone },
      { slug: "circulars", to: "/circulars", label: "Circulars & Guidelines", icon: FileText },
      { slug: "skaters", to: "/skaters", label: "Skaters", icon: RollerSkatingIcon },
      // { slug: "events", to: "/events", label: "Events", icon: EventIcon },
      {
        slug: "events",
        to: "/event",
        label: "Events",
        icon: Folder,
        children: [
          // Hidden for sub-admin panel — see SUB_ADMIN_HIDDEN_EVENT_CHILD_SLUGS in navigation-modules.js
          { slug: "events-category", to: "/events/category", label: "Events-Category", icon: Tags },
          { slug: "events-formula", to: "/events/formula", label: "Formula", icon: FunctionSquare },
          { slug: "events", to: "/events/detail", label: "Events", icon: Layers }
        ]
      },
      {
        slug: "news",
        to: "/news",
        label: "News",
        icon: Newspaper
      },
      { slug: "gallery", to: "/gallery", label: "Gallery", icon: Image },
      { slug: "contact-us", to: "/contact-us", label: "Contact Us", icon: Headphones },
      { slug: "feedback", to: "/feedback", label: "Feedback", icon: MessageSquare },
      {
        slug: "complains",
        to: "/complains",
        label: "Complains",
        icon: AlertTriangle
      },
      {
        slug: "Certification",
        to: "/certification",
        label: "Certification",
        icon: Award
      },
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
          },
          {
            slug: "guest-reports",
            to: "/reports/guest",
            label: "Guest",
            icon: PersonOutlinedIcon
          }
        ]
      },
      {
        slug: "Support-Hub",
        to: "/support-hub",
        label: "Support-Hub",
        icon: HelpingHand,
        children: [
          {
            slug: "Donation",
            to: "/support-hub/donation",
            label: "Donation",
            icon: HeartHandshake
          },
          {
            slug: "sponsorship",
            to: "/support-hub/sponsorship",
            label: "sponsorship",
            icon: Handshake
          }
        ]
      }
    ]
  }
];

export const navigationItems = navigationGroups.flatMap((group) => group.items);
