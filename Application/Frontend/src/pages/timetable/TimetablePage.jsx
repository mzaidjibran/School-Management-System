import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";

export default function TimetablePage() {
  const tabs = [
    { label: "Timetable", path: "/timetable" },
    { label: "Create", path: "/timetable/create" },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
