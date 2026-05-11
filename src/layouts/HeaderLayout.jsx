import { AppHeader } from "@/components/navigation/AppHeader";

export const HeaderLayout = ({ children }) => {
  return (
    <div className="h-dvh bg-[linear-gradient(180deg,#fcf8f6_0%,#f5efeb_100%)]">
      {/* AppHeader is position:fixed — this pt-[74px] spacer ensures
          the page content always starts below the header on ALL screen sizes,
          including mobile where sticky can be unreliable */}
      <AppHeader />
      <div className="pt-[74px] h-full">{children}</div>
    </div>
  );
};
