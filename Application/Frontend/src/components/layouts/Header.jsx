import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Dashboard", path: "/" },
  { name: "Students", path: "/students" },
  { name: "Teachers", path: "/teachers" },
  { name: "Classes", path: "/classes" },
  { name: "Attendance", path: "/attendance" },
  { name: "Exams", path: "/exams" },
  { name: "Fees", path: "/fees" },
  { name: "Subjects", path: "/subjects" },
  { name: "Timetable", path: "/timetable" },
  { name: "Notices", path: "/notices" },
  { name: "Users", path: "/users" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div>
            <h1 className="text-xl font-bold text-blue-600">School ERP</h1>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <img
              src="https://ui-avatars.com/api/?name=Admin"
              alt="Admin"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
