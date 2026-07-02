import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />
      <AppRoutes />
    </>
  );
}

export default App;