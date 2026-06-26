import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../pages/auth/useAuth.js";
import { logOut } from "../../Api/Auth_Api.js";

const navItems = [
  { name: "Dashboard",  path: "/" },
  { name: "Students",   path: "/students" },
  { name: "Teachers",   path: "/teachers" },
  { name: "Classes",    path: "/classes" },
  { name: "Attendance", path: "/attendance" },
  { name: "Exams",      path: "/exams" },
  { name: "Fees",       path: "/fees" },
  { name: "Subjects",   path: "/subjects" },
  { name: "Timetable",  path: "/timetable" },
  { name: "Notices",    path: "/notices" },
];

export default function ProHeader() {
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);
  const [userDropdownOpen,  setUserDropdownOpen]  = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const userDropdownRef  = useRef(null);
  const notifDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Real auth data
  const { userName, userEmail, userRole } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target))
        setUserDropdownOpen(false);
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target))
        setNotifDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await logOut();
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch {
      // logOut internally always clears localStorage — navigate anyway
      navigate("/login");
    }
  }

  // Avatar URL — real name se generate hoga
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "U")}&background=4f46e5&color=fff&bold=true&size=40`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-lg border-b border-slate-200/80">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <div className="flex items-center shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-lg font-bold">S</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex flex-1 justify-center overflow-x-auto scrollbar-none">
            <nav className="flex items-center gap-1 xl:gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap
                    ${isActive
                      ? "text-indigo-700 bg-indigo-50/80"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100/60"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.name}
                      {isActive && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Notification Bell */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-700">Notifications</h3>
                  </div>
                  <div className="px-4 py-6 text-center text-slate-400 text-sm">
                    No notifications yet
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full hover:scale-105 transition-transform"
                aria-label="User menu"
              >
                <img
                  src={avatarUrl}
                  alt="User avatar"
                  className="w-9 h-9 rounded-full ring-2 ring-slate-200 hover:ring-indigo-300"
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-fadeIn">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {userName || "User"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {userEmail || ""}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 capitalize">
                      {userRole || "user"}
                    </span>
                  </div>

                  <hr className="my-1 border-slate-100" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-slate-100 shadow-inner">
          <nav className="px-4 py-3 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm font-medium rounded-lg transition-all
                  ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <hr className="my-2 border-slate-100" />
            <button
              onClick={handleLogout}
              className="text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              🚪 Logout
            </button>
          </nav>
        </div>
      )}

      <style>{`
        .scrollbar-none { scrollbar-width:none; -ms-overflow-style:none; }
        .scrollbar-none::-webkit-scrollbar { display:none; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .animate-fadeIn { animation:fadeIn 0.2s ease-out; }
      `}</style>
    </header>
  );
}