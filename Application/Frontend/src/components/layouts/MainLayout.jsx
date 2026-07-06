import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import ProHeader from "./Header.jsx";
import Footer from "./Footer.jsx";
import BranchSectionModal from "./BranchSectionModal.jsx";

import { useAuth } from "../../pages/auth/useAuth.js";

export default function MainLayout() {
  const [modalOpen, setModalOpen] = useState(false);
  const { isTeacher } = useAuth();

  useEffect(() => {
    if (isTeacher) {
      setModalOpen(false);
      return;
    }

    const activeBranch = localStorage.getItem("activeBranch");
    const activeSection = localStorage.getItem("activeSection");
    if (!activeBranch || !activeSection) {
      setModalOpen(true);
    }

    const handleOpen = () => {
      if (!isTeacher) setModalOpen(true);
    };
    window.addEventListener("open-branch-modal", handleOpen);
    return () => {
      window.removeEventListener("open-branch-modal", handleOpen);
    };
  }, [isTeacher]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ProHeader />
      <main className="flex-1 w-full px-2 sm:px-3 py-4">
        <Outlet />
      </main>
      <Footer />
      <BranchSectionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}