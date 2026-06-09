import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";

export default function AttendancePage() {
  const tabs = [
    { label: "Attendance List", path: "/attendance" },
    { label: "Mark Attendance", path: "/attendance/mark" },
    { label: "Reports", path: "/attendance/reports" },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
