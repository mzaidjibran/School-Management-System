import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";

export default function StudentPage() {
  const tabs = [
    { label: "All Students", path: "/students" },
    { label: "Add Student", path: "/students/add" },
  ];

  return (
    <div className="space-y-6">
      <TopTabs tabs={tabs} />
      <Outlet />
    </div>
  );
}
