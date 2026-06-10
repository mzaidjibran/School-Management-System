import { NavLink } from "react-router-dom";

/**

 *
 * @param {Array} tabs - Array of { path, label } objects for navigation
 * @param {string} schoolName - (Optional) Custom school name
 * @param {string} logoSrc - (Optional) Path to logo image
 */
export default function TopHeader({
  tabs = [],
  schoolName = "Punjab Public High School",
  logoSrc = null,
}) {
  return (
    <div className="w-full bg-white shadow-sm border-b border-slate-100">
      {/* Top Bar: Logo / School Name */}
      <div className="px-6 py-3 flex items-center justify-between gap-4 border-b border-slate-50">
        <div className="flex items-center gap-3 min-w-0">
          {logoSrc && (
            <img
              src={logoSrc}
              alt="School Logo"
              className="h-10 w-auto object-contain"
            />
          )}
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight truncate">
              {schoolName}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Excellence in Education
            </p>
          </div>
        </div>

        {/* Optional: Right side content (e.g., profile, date) */}
        <div className="text-sm text-slate-400">
          📅 {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Navigation Tabs (Original logic preserved) */}
      <div className="w-full">
        {/* Horizontal scroll container – scrollbar hidden for clean mobile layout */}
        <div className="flex gap-8 overflow-x-auto px-6 scrollbar-none">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end
              className={({ isActive }) =>
                `relative py-3.5 text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out border-b-2 -mb-[2px] outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded-sm
                ${
                  isActive
                    ? "border-blue-600 text-blue-700 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
