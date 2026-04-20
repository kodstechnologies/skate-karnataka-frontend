import { AppHeader } from "@/components/navigation/AppHeader";

export const HeaderLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fcf8f6_0%,#f5efeb_100%)]">
      <AppHeader />
      {children}
    </div>
  );
};
