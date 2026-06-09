import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";

export default function ExamPage() {
  const tabs = [
    { label: "Exam List", path: "/exams" },
    { label: "Add Exam", path: "/exams/add" },
    { label: "Marks Entry", path: "/exams/marks" },
    { label: "Results", path: "/exams/results" },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
