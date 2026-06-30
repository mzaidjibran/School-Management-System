import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";
import { ClipboardList, CheckSquare, BarChart3 } from "lucide-react";

export default function AttendancePage() {
  const tabs = [
    { label: "Attendance List", path: "/attendance", icon: <ClipboardList size={14} /> },
    { label: "Mark Attendance", path: "/attendance/mark", icon: <CheckSquare size={14} /> },
    { label: "Reports", path: "/attendance/reports", icon: <BarChart3 size={14} /> },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
