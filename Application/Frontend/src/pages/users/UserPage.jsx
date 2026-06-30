import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";
import { Users, Shield } from "lucide-react";

export default function UserPage() {
  const tabs = [
    {
      label: "Users",
      path: "/users",
      icon: <Users size={14} />,
    },
    {
      label: "Roles",
      path: "/users/roles",
      icon: <Shield size={14} />,
    },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
