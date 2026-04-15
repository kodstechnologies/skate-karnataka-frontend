import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  path?: string; // optional (last item no path)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

function AppBreadcrumb({ items }: BreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return isLast ? (
          <Typography key={index} color="text.primary">
            {item.label}
          </Typography>
        ) : (
          <Link
            key={index}
            underline="hover"
            color="inherit"
            sx={{ cursor: "pointer" }}
            onClick={() => item.path && navigate(item.path)}
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}

export default AppBreadcrumb;


{/* <AppBreadcrumb
  items={[
    { label: "Home", path: "/" },
    { label: "Skaters", path: "/skaters" },
    { label: "Add Skater" },
  ]}
/> */}