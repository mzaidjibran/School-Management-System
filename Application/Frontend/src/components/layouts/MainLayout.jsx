import { Outlet } from "react-router-dom";
import ProHeader from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ProHeader />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}