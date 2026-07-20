import RollerSkatingIcon from "@mui/icons-material/RollerSkating";
import Groups2Icon from "@mui/icons-material/Groups2";
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
  Folder,
  Tags,
  FunctionSquare,
  Smartphone,
  CreditCard,
  Circle
} from "lucide-react";

/** Maps lucide / MUI icon name strings from the API to React components. */
export const SIDEBAR_ICON_MAP = {
  LayoutDashboard,
  AdminPanelSettings: AdminPanelSettingsIcon,
  LocationCity: LocationCityIcon,
  Groups2: Groups2Icon,
  Layers,
  Info,
  CreditCard,
  Smartphone,
  FileText,
  RollerSkating: RollerSkatingIcon,
  Folder,
  Tags,
  FunctionSquare,
  Newspaper,
  Image,
  Headphones,
  MessageSquare,
  AlertTriangle,
  Award,
  Inbox,
  School: SchoolIcon,
  WorkspacePremium: WorkspacePremiumIcon,
  FamilyRestroom: FamilyRestroomIcon,
  Business: BusinessIcon,
  PersonOutlined: PersonOutlinedIcon,
  HelpingHand,
  HeartHandshake,
  Handshake
};

export const resolveSidebarIcon = (iconName) => {
  if (!iconName) return Circle;
  return SIDEBAR_ICON_MAP[iconName] || Circle;
};
