import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";
import { Users, Plus } from "lucide-react";

export default function TeacherPage() {
  const tabs = [
    { label: "All Teachers", path: "/teachers", icon: <Users size={14} /> },
    { label: "Add Teacher", path: "/teachers/add", icon: <Plus size={14} /> },
  ];

  return (
    <div className="space-y-6">
      <TopTabs tabs={tabs} />
      <Outlet />
    </div>
  );
}
