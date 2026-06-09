import { NavLink } from "react-router-dom";

export default function TopTabs({ tabs = [] }) {
  return (
    <div className="border-b bg-white">
      <div className="flex gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end
            className={({ isActive }) =>
              `py-3 whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
