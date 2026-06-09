import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";

export default function ClassPage() {
  const tabs = [
    {
      label: "Classes",
      path: "/classes",
    },
    {
      label: "Add Class",
      path: "/classes/add",
    },
    {
      label: "Details",
      path: "/classes/details",
    },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
