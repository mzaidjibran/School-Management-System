import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";
import { Megaphone, Plus } from "lucide-react";

export default function NoticePage() {
  const tabs = [
    {
      label: "Notice Board",
      path: "/notices",
      icon: <Megaphone size={14} />,
    },
    {
      label: "Create Notice",
      path: "/notices/create",
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
