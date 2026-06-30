import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";
import { Clock, Plus } from "lucide-react";

export default function TimetablePage() {
  const tabs = [
    { label: "Timetable", path: "/timetable", icon: <Clock size={14} /> },
    { label: "Create", path: "/timetable/create", icon: <Plus size={14} /> },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
