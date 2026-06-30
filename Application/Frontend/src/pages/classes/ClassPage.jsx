import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";
import { School, Plus } from "lucide-react";

export default function ClassPage() {
  const tabs = [
    {
      label: "Classes",
      path: "/classes",
      icon: <School size={14} />,
    },
    {
      label: "Add Class",
      path: "/classes/add",
      icon: <Plus size={14} />,
    },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
