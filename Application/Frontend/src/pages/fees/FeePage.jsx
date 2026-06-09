import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";

export default function FeePage() {
  const tabs = [
    { label: "Fee Records", path: "/fees" },
    { label: "Collect Fee", path: "/fees/collection" },
    { label: "Reports", path: "/fees/reports" },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
