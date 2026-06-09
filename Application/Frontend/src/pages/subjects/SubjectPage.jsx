import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";

export default function SubjectPage() {
  const tabs = [
    { label: "Subjects", path: "/subjects" },
    { label: "Add Subject", path: "/subjects/add" },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
