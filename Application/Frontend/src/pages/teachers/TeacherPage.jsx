import TopTabs from "../../components/layouts/TopTabs";
import { Outlet } from "react-router-dom";
import { Users, Plus, CreditCard, Fingerprint } from "lucide-react";
import { useAuth } from "../auth/useAuth.js";
import toast from "react-hot-toast";

export default function TeacherPage() {
  const { isAdmin } = useAuth();

  const tabs = [
    { label: "All Teachers", path: "/teachers", icon: <Users size={14} /> },
    { label: "Add Teacher", path: "/teachers/add", icon: <Plus size={14} /> },
    {
      label: "Payroll",
      path: "/teachers/payroll",
      icon: <CreditCard size={14} />,
      onClick: !isAdmin ? () => toast.error("Only administrators are authorized to access this section.") : null
    },
    {
      label: "Biometric Upload",
      path: "/teachers/biometric",
      icon: <Fingerprint size={14} />,
      onClick: !isAdmin ? () => toast.error("Only administrators are authorized to access this section.") : null
    },
  ];

  return (
    <>
      <TopTabs tabs={tabs} />
      <Outlet />
    </>
  );
}
