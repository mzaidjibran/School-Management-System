import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";
import { GraduationCap, Plus } from "lucide-react";

export default function StudentPage() {
  const tabs = [
    { label: "All Students", path: "/students", icon: <GraduationCap size={14} /> },
    { label: "Add Student", path: "/students/add", icon: <Plus size={14} /> },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
