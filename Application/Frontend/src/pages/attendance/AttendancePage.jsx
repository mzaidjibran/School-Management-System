import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";
import { ClipboardList, CheckSquare, BarChart3, Users } from "lucide-react";
import { useAuth } from "../auth/useAuth.js";
import toast from "react-hot-toast";

export default function AttendancePage() {
  const { isAdmin } = useAuth();

  const tabs = [
    { label: "Attendance List", path: "/attendance", icon: <ClipboardList size={14} /> },
    { label: "Mark Attendance", path: "/attendance/mark", icon: <CheckSquare size={14} /> },
    { label: "Reports", path: "/attendance/reports", icon: <BarChart3 size={14} /> },
    {
      label: "Staff Attendance",
      path: "/attendance/staff",
      icon: <Users size={14} />,
      onClick: !isAdmin ? () => toast.error("Only administrators are authorized to access this section.") : null
    },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
