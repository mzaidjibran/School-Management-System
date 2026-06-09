import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
