import { AppRoutes } from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./features/auth/store/auth-store";
import { useFirebaseMessaging } from "./hooks/useFirebaseMessaging";

const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // Initialize Firebase Messaging when the user is authenticated
  useFirebaseMessaging(isAuthenticated);

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500
        }}
      />
    </>
  );
};

export default App;
