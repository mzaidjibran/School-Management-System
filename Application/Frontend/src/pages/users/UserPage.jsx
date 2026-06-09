import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";

export default function UserPage() {
  const tabs = [
    {
      label: "Users",
      path: "/users",
    },
    {
      label: "Roles",
      path: "/users/roles",
    },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
