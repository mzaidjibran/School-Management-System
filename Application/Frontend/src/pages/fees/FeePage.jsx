import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";
import { DollarSign, CreditCard, BarChart3 } from "lucide-react";

export default function FeePage() {
  const tabs = [
    { label: "Fee Records", path: "/fees", icon: <DollarSign size={14} /> },
    { label: "Collect Fee", path: "/fees/collection", icon: <CreditCard size={14} /> },
    { label: "Reports", path: "/fees/reports", icon: <BarChart3 size={14} /> },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
