import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          style: {
            fontSize: "12px",
            fontWeight: "500",
            padding: "6px 12px",
            color: "#334155",
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            maxWidth: "320px",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default App;