import { NavLink } from "react-router-dom";

/**
 * TopHeader / TopTabs Navigation Component
 * Styled as a clean white card containing only tab navigation links.
 * 
 * @param {Array} tabs - Array of { path, label } objects for navigation
 */
export default function TopHeader({ tabs = [] }) {
  return (
    <div className="top-tabs-container bg-white rounded-md border border-slate-100/80 shadow-sm p-3 mb-6">
      <div className="w-full">
        {/* Horizontal scroll container – scrollbar hidden for clean mobile layout */}
        <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end
              className={({ isActive }) =>
                `top-tab-link px-4 py-2 text-xs font-bold rounded-md transition-all duration-200 whitespace-nowrap outline-none flex items-center gap-1.5
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
