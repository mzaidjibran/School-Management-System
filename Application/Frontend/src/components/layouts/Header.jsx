import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../pages/auth/useAuth.js";
import { logOut, updateMyProfile } from "../../Api/Auth_Api.js";
import {
  LogOut as LogOutIcon,
  LayoutDashboard,
  GraduationCap,
  Users,
  School,
  CalendarCheck,
  FileSpreadsheet,
  DollarSign,
  BookOpen,
  Clock,
  Megaphone,
  User,
  Lock,
} from "lucide-react";

const navItems = [
  { name: "Dashboard",  path: "/",           icon: <LayoutDashboard size={15} /> },
  { name: "Students",   path: "/students",   icon: <GraduationCap size={15} /> },
  { name: "Teachers",   path: "/teachers",   icon: <Users size={15} /> },
  { name: "Classes",    path: "/classes",    icon: <School size={15} /> },
  { name: "Attendance", path: "/attendance", icon: <CalendarCheck size={15} /> },
  { name: "Exams",      path: "/exams",      icon: <FileSpreadsheet size={15} /> },
  { name: "Fees",       path: "/fees",       icon: <DollarSign size={15} /> },
  { name: "Subjects",   path: "/subjects",   icon: <BookOpen size={15} /> },
  { name: "Timetable",  path: "/timetable",  icon: <Clock size={15} /> },
  { name: "Notices",    path: "/notices",    icon: <Megaphone size={15} /> },
];

export default function ProHeader() {
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);
  const [userDropdownOpen,  setUserDropdownOpen]  = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const userDropdownRef  = useRef(null);
  const notifDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Real auth data
  const { userName, userEmail, userRole, userImage, isAdmin, isTeacher, assignedPages } = useAuth();

  const visibleNavItems = navItems.filter((item) => {
    if (isAdmin) return true;
    if (item.path === "/") return true;
    const pageKey = item.path.replace("/", "");
    return assignedPages.includes(pageKey);
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalAssignedPages, setModalAssignedPages] = useState([]);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [teacherPassword, setTeacherPassword] = useState("");

  const fetchPermissionsList = async () => {
    setPermissionsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/teachers/permissions/list`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setTeachersList(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedTeacher(data.data[0]);
          setModalAssignedPages(data.data[0].assignedPages || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPermissionsLoading(false);
    }
  };

  useEffect(() => {
    if (permissionsModalOpen) {
      fetchPermissionsList();
    }
  }, [permissionsModalOpen]);

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setModalAssignedPages(teacher.assignedPages || []);
    setTeacherPassword("");
  };

  const handleTogglePageKey = (key) => {
    setModalAssignedPages((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedTeacher) return;
    setSavingPermissions(true);
    try {
      const res = await fetch(`${API_BASE}/api/teachers/permissions/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          email: selectedTeacher.email,
          name: selectedTeacher.name,
          assignedPages: modalAssignedPages,
          password: teacherPassword || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTeachersList((prev) =>
          prev.map((t) =>
            t.email === selectedTeacher.email ? { ...t, assignedPages: modalAssignedPages, hasAccount: true } : t
          )
        );
        toast.success(teacherPassword ? "User account & permissions updated!" : "Permissions updated successfully!");
        setTeacherPassword("");
      } else {
        toast.error(data.message || "Failed to update permissions");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "An error occurred");
    } finally {
      setSavingPermissions(false);
    }
  };

  const [newName, setNewName] = useState(userName || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const [activeBranchName, setActiveBranchName] = useState(localStorage.getItem("activeBranchName") || "");
  const [activeSection, setActiveSection] = useState(localStorage.getItem("activeSection") || "");

  useEffect(() => {
    const handleUpdate = () => {
      setActiveBranchName(localStorage.getItem("activeBranchName") || "");
      setActiveSection(localStorage.getItem("activeSection") || "");
    };
    window.addEventListener("branch-changed", handleUpdate);
    return () => window.removeEventListener("branch-changed", handleUpdate);
  }, []);

  // Sync state when modal opens
  useEffect(() => {
    if (editModalOpen) {
      setNewName(userName || "");
      setPreviewImage(avatarUrl);
      setSelectedFile(null);
    }
  }, [editModalOpen, userName]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return alert("Name is required");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("Name", newName.trim());
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      const res = await updateMyProfile(formData);
      if (res.success && res.data) {
        localStorage.setItem("userName", res.data.Name || "");
        localStorage.setItem("userImage", res.data.profileImage || "");
        localStorage.setItem("user", JSON.stringify(res.data));
        window.dispatchEvent(new Event("auth-changed"));
        setEditModalOpen(false);
      } else {
        alert(res.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  async function handleLogout() {
    try {
      await logOut();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  }

  // Avatar URL — real custom upload or UI Avatars fallback
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  const avatarUrl = userImage
    ? `${API_BASE}${userImage}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "U")}&background=4f46e5&color=fff&bold=true&size=40`;
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-lg border-b border-slate-200/80">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 xl:gap-4">

          {/* Logo & School Name */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 xl:w-10 xl:h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-md flex items-center justify-center shadow-md shrink-0">
              <span className="text-white text-base xl:text-lg font-bold">S</span>
            </div>
            <div className="flex flex-col select-none hidden md:flex">
              <span className="text-[10px] xl:text-xs 2xl:text-sm font-bold text-slate-800 font-serif leading-none tracking-tight">Punjab Public</span>
              <span className="text-[8px] xl:text-[9px] 2xl:text-[10px] font-bold text-indigo-600 tracking-widest uppercase mt-0.5">High School</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex flex-1 justify-center overflow-x-auto scrollbar-none px-1 xl:px-2">
            <nav className="flex items-center gap-0.5 xl:gap-1.5 2xl:gap-2">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `relative px-1.5 py-1.5 xl:px-2.5 xl:py-2 2xl:px-3 2xl:py-2 text-[10px] xl:text-xs 2xl:text-sm font-semibold rounded-md transition-all duration-200 whitespace-nowrap
                    ${isActive
                      ? "text-indigo-700 bg-indigo-50/80"
                      : "text-slate-650 hover:text-indigo-600 hover:bg-slate-100/60"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-1 xl:gap-1.5 [&>svg]:w-3.5 [&>svg]:h-3.5 xl:[&>svg]:w-4 xl:[&>svg]:h-4">
                        {item.icon}
                        {item.name}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-indigo-600 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">

            {/* Active Branch & Section Badge */}
            {!isTeacher && (
              <div 
                onClick={() => window.dispatchEvent(new Event("open-branch-modal"))}
                className="flex items-center gap-1 xl:gap-2 px-1.5 py-1 xl:px-3 xl:py-1.5 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100/60 rounded-md cursor-pointer select-none transition-all group shrink-0"
                title="Click to Switch Branch or Section"
              >
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-[9px] xl:text-[10px] 2xl:text-[11px] font-semibold text-indigo-700 leading-tight truncate max-w-[70px] xl:max-w-[100px] 2xl:max-w-[140px]">
                    {activeBranchName || "Select Branch"}
                  </span>
                  <span className="text-[7px] xl:text-[8px] 2xl:text-[9px] font-bold text-indigo-500 capitalize leading-none">
                    {activeSection ? `${activeSection} Section` : "Select Section"}
                  </span>
                </div>
                <div className="w-6 h-6 xl:w-7 xl:h-7 rounded-md bg-indigo-600/10 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <School size={13} />
                </div>
              </div>
            )}

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
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl border border-slate-100 py-2 z-50">
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
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border border-slate-100 py-1 z-50 animate-fadeIn">
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

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setEditModalOpen(true);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition flex items-center gap-1.5 cursor-pointer font-semibold"
                    >
                      <User size={14} className="text-slate-400" /> Edit Profile
                    </button>
                  </div>
                  {isAdmin && (
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setPermissionsModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition flex items-center gap-1.5 cursor-pointer font-semibold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50"
                      >
                        <Lock size={14} className="text-indigo-500" /> Teacher Permissions
                      </button>
                    </div>
                  )}

                  <hr className="my-1 border-slate-100" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-1.5"
                  >
                    <LogOutIcon size={14} /> Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
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
        <div className="xl:hidden bg-white/95 backdrop-blur-sm border-t border-slate-100 shadow-inner">
          <nav className="px-4 py-3 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm font-medium rounded-md transition-all
                  ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`
                }
              >
                <span className="flex items-center gap-2">
                  {item.icon}
                  {item.name}
                </span>
              </NavLink>
            ))}
            <hr className="my-2 border-slate-100" />
            <button
              onClick={handleLogout}
              className="text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition flex items-center gap-1.5"
            >
              <LogOutIcon size={14} /> Logout
            </button>
          </nav>
        </div>
      )}

      <style>{`
        .scrollbar-none { scrollbar-width:none; -ms-overflow-style:none; }
        .scrollbar-none::-webkit-scrollbar { display:none; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .animate-fadeIn { animation:fadeIn 0.2s ease-out; }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .animate-scaleIn { animation:scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      {/* Edit Profile Modal */}
      {editModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-md border border-slate-100 shadow-2xl p-6 overflow-hidden animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <User size={20} className="text-indigo-600" /> Edit Profile
              </h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-md transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-5">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-slate-100 hover:ring-indigo-300 transition duration-300">
                  <img
                    src={previewImage || avatarUrl}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-[10px] text-white font-bold cursor-pointer gap-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Change Photo</span>
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <p className="text-[10px] text-slate-400 font-semibold">JPG, PNG, or WEBP. Max 2MB.</p>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-md focus:border-indigo-500 focus:bg-white transition outline-none font-semibold text-slate-800"
                  required
                />
              </div>

              {/* Email Input (Disabled) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={userEmail || ""}
                  disabled
                  className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-md font-semibold text-slate-400 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400/80 font-semibold italic">Email cannot be changed.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-md text-xs font-bold text-slate-600 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold shadow-md shadow-indigo-600/10 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Teacher Permissions Modal */}
      {permissionsModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-md border border-slate-100 shadow-2xl p-6 overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Lock size={20} className="text-indigo-600" /> Teacher Page Permissions
              </h2>
              <button
                onClick={() => setPermissionsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-md transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {permissionsLoading ? (
              <div className="py-12 text-center text-slate-400 text-sm flex-1 flex flex-col justify-center items-center gap-2">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
                <span>Loading teachers list...</span>
              </div>
            ) : teachersList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm flex-1">
                No teachers found in the database. Please add teachers first.
              </div>
            ) : (
              <div className="mt-4 flex-1 overflow-y-auto space-y-5 pr-1">
                {/* Select Teacher */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Teacher</label>
                  <select
                    value={selectedTeacher ? selectedTeacher._id : ""}
                    onChange={(e) => {
                      const t = teachersList.find((x) => x._id === e.target.value);
                      if (t) handleSelectTeacher(t);
                    }}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-indigo-500 focus:bg-white transition font-medium text-slate-700"
                  >
                    {teachersList.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTeacher && (
                  <>
                    {/* Account Status Badge */}
                    <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 rounded-md p-3">
                      <div>
                        <p className="font-semibold text-slate-600">{selectedTeacher.name}</p>
                        <p className="text-slate-400 mt-0.5">{selectedTeacher.email}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] uppercase ${selectedTeacher.hasAccount ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {selectedTeacher.hasAccount ? "Account Active" : "No Login Yet (Will Auto-Create)"}
                      </span>
                    </div>

                    {/* Password Fields */}
                    <div className="space-y-1.5 p-3 border border-indigo-50/50 bg-indigo-50/10 rounded-md">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {selectedTeacher.hasAccount ? "Reset / Change Password" : "Create User Password"}
                      </label>
                      <input
                        type="text"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        placeholder={selectedTeacher.hasAccount ? "Leave empty to keep current password" : "Enter password (default: 123456)"}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded outline-none focus:border-indigo-400 transition"
                      />
                    </div>

                    {/* Permissions list */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Access Pages</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { key: "students",   label: "Students Portal" },
                          { key: "teachers",   label: "Teachers Portal" },
                          { key: "classes",    label: "Classes Portal" },
                          { key: "attendance", label: "Attendance Portal" },
                          { key: "exams",      label: "Exams & Marks" },
                          { key: "fees",       label: "Fee Collection" },
                          { key: "subjects",   label: "Subject Management" },
                          { key: "timetable",  label: "Timetable Grid" },
                          { key: "notices",    label: "Notices Board" },
                        ].map((p) => {
                          const checked = modalAssignedPages.includes(p.key);
                          return (
                            <label
                              key={p.key}
                              className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition select-none ${
                                checked
                                  ? "border-indigo-200 bg-indigo-50/30 text-indigo-700 font-semibold"
                                  : "border-slate-100 hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              <span className="text-xs">{p.label}</span>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleTogglePageKey(p.key)}
                                className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 pt-4 border-t border-slate-100 mt-5 shrink-0">
              <button
                type="button"
                onClick={() => setPermissionsModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-md text-xs font-bold text-slate-600 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={savingPermissions || teachersList.length === 0}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold shadow-md shadow-indigo-600/10 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {savingPermissions ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Permissions"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}