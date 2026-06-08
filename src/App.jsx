import { AppRoutes } from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
const App = () => {
  console.log("hello : 11 ===");
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
