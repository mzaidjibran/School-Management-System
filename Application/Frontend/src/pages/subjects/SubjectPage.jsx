import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";
import { BookOpen, Plus } from "lucide-react";

export default function SubjectPage() {
  const tabs = [
    { label: "Subjects", path: "/subjects", icon: <BookOpen size={14} /> },
    { label: "Add Subject", path: "/subjects/add", icon: <Plus size={14} /> },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
