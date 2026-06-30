import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";
import { FileSpreadsheet, Plus, Edit, Award } from "lucide-react";

export default function ExamPage() {
  const tabs = [
    { label: "Exam List", path: "/exams", icon: <FileSpreadsheet size={14} /> },
    { label: "Add Exam", path: "/exams/add", icon: <Plus size={14} /> },
    { label: "Marks Entry", path: "/exams/marks", icon: <Edit size={14} /> },
    { label: "Results", path: "/exams/results", icon: <Award size={14} /> },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
