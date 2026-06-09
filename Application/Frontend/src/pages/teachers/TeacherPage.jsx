import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";

export default function TeacherPage() {
  const tabs = [
    { label: "All Teachers", path: "/teachers" },
    { label: "Add Teacher", path: "/teachers/add" },
  ];

  return (
    <div className="space-y-6">
      <TopTabs tabs={tabs} />
      <Outlet />
    </div>
  );
}
