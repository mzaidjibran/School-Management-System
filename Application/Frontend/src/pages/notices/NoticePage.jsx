import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";

export default function NoticePage() {
  const tabs = [
    {
      label: "Notice Board",
      path: "/notices",
    },
    {
      label: "Create Notice",
      path: "/notices/create",
    },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
