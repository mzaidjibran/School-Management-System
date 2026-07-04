import { Users, GraduationCap, BookOpen, DollarSign } from "lucide-react";

const icons = {
  students: Users,
  teachers: GraduationCap,
  classes: BookOpen,
  revenue: DollarSign,
};

export default function StatsCard({ title, value, icon = "students" }) {
  const Icon = icons[icon];

  return (
    <div className="bg-white rounded-md p-5 shadow-sm border">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">{title}</p>

          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>

        <div className="bg-blue-100 p-3 rounded-md">
          <Icon size={24} className="text-blue-600" />
        </div>
      </div>
    </div>
  );
}
