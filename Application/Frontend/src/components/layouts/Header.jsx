import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

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
  // "Users" tab removed to reduce overcrowding
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo only – no school name text */}
          <div className="flex items-center shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-base font-bold">P</span>
            </div>
          </div>

          {/* Desktop Navigation – scrollable if too many tabs */}
          <div className="hidden lg:flex flex-1 overflow-x-auto scrollbar-none">
            <nav className="flex items-center gap-1 xl:gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.name}
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right side: Only avatar icon with dropdown (no name/role text) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full"
                aria-label="User menu"
              >
                <img
                  src="https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff&bold=true&size=36"
                  alt="User avatar"
                  className="w-9 h-9 rounded-full ring-2 ring-slate-200 hover:ring-blue-300 transition-all"
                />
              </button>

              {/* Dropdown menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    👤 Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    ⚙️ Settings
                  </button>
                  <hr className="my-1 border-slate-100" />
                  <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white/95">
          <nav className="px-4 py-3 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm font-medium rounded-md
                  ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
