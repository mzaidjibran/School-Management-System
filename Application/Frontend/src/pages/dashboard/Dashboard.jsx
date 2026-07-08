import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import toast from "react-hot-toast";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  GraduationCap,
  Users,
  School,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  DollarSign,
  Clock,
  Megaphone,
} from "lucide-react";

// ── API base ──────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const authHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
  const activeBranch = localStorage.getItem("activeBranch");
  const activeSection = localStorage.getItem("activeSection");
  if (activeBranch) headers["x-branch-id"] = activeBranch;
  if (activeSection) headers["x-section"] = activeSection;
  return headers;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { userName, isAdmin, assignedPages } = useAuth();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  // ── Real data states ──────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [recentFees, setRecentFees] = useState([]);
  const [exams, setExams] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeChartData, setFeeChartData] = useState([]);
  const [enrollmentChartData, setEnrollmentChartData] = useState([]);

  // ── Clock ─────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, [currentTime]);

  // ── Fetch all dashboard data ──────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [
          studRes,
          teachRes,
          classRes,
          subRes,
          examRes,
          noticeRes,
          feeRes,
          attRes,
        ] = await Promise.allSettled([
          fetch(`${API}/api/students`, { headers: authHeaders() }),
          fetch(`${API}/api/teachers`, { headers: authHeaders() }),
          fetch(`${API}/api/classes`, { headers: authHeaders() }),
          fetch(`${API}/api/subjects`, { headers: authHeaders() }),
          fetch(`${API}/api/exams`, { headers: authHeaders() }),
          fetch(`${API}/api/notices`, { headers: authHeaders() }),
          fetch(`${API}/api/fee`, { headers: authHeaders() }),
          fetch(`${API}/api/attendance/today-summary`, {
            headers: authHeaders(),
          }),
        ]);

        const toJson = async (res) => {
          if (res.status === "fulfilled" && res.value.ok)
            return res.value.json();
          return null;
        };

        const [
          studData,
          teachData,
          classData,
          subData,
          examData,
          noticeData,
          feeData,
          attData,
        ] = await Promise.all([
          toJson(studRes),
          toJson(teachRes),
          toJson(classRes),
          toJson(subRes),
          toJson(examRes),
          toJson(noticeRes),
          toJson(feeRes),
          toJson(attRes), // ✅ attRes fix
        ]);

        setStats({
          students: studData?.total ?? studData?.data?.length ?? 0,
          teachers: teachData?.total ?? teachData?.data?.length ?? 0,
          classes: classData?.total ?? classData?.data?.length ?? 0,
          subjects: subData?.total ?? subData?.data?.length ?? 0,
        });

        const allExams = examData?.data ?? [];
        const today = new Date();
        setExams(
          allExams
            .filter((e) => new Date(e.examDate || e.date) >= today)
            .sort((a, b) => new Date(a.examDate || a.date) - new Date(b.examDate || b.date))
            .slice(0, 2),
        );

        const fetchedNotices = noticeData?.notices || noticeData?.data || [];
        setNotices(fetchedNotices.slice(0, 3));
        
        const fetchedFees = feeData?.data || [];
        setRecentFees(fetchedFees.slice(0, 4));

        // Group & sum real fees by month for charts
        if (fetchedFees.length) {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const groupedFees = {};
          
          // Sort fees chronologically
          const sortedFees = [...fetchedFees].sort(
            (a, b) => new Date(a.createdAt || a.dueDate) - new Date(b.createdAt || b.dueDate)
          );
          
          sortedFees.forEach(fee => {
            const date = new Date(fee.createdAt || fee.dueDate);
            const m = months[date.getMonth()];
            const y = date.getFullYear().toString().slice(-2);
            const label = `${m} ${y}`;
            if (!groupedFees[label]) {
              groupedFees[label] = 0;
            }
            groupedFees[label] += fee.amount || 0;
          });
          
          const formattedFees = Object.entries(groupedFees)
            .map(([name, amount]) => ({ name, amount }))
            .slice(-6);
          setFeeChartData(formattedFees);
        }

        // Group & count real students by class for charts
        if (studData?.data) {
          const groupedStuds = {};
          studData.data.forEach(student => {
            const className = student.currentClass?.name || "Unassigned";
            if (!groupedStuds[className]) {
              groupedStuds[className] = 0;
            }
            groupedStuds[className]++;
          });
          
          const formattedStuds = Object.entries(groupedStuds)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
          setEnrollmentChartData(formattedStuds);
        }

        if (attData?.data) {
          setAttendance({
            present: attData.data.present,
            absent: attData.data.absent,
            leave: attData.data.leave,
            late: attData.data.late,
            date: attData.data.date,
          });
        } else {
          setAttendance(null);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        toast.error("Dashboard data load nahi ho saka: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();

    window.addEventListener("branch-changed", fetchAll);
    return () => {
      window.removeEventListener("branch-changed", fetchAll);
    };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────
  const formattedDate = currentTime.toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const attTotal = attendance
    ? attendance.present +
      attendance.absent +
      attendance.leave +
      attendance.late
    : 0;
  const attPct = attTotal
    ? ((attendance.present / attTotal) * 100).toFixed(1)
    : "—";

  const feeStatusColor = (s) =>
    s === "Paid"
      ? "bg-emerald-50 text-emerald-700"
      : s === "Pending"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";

  const priorityStyle = (p) =>
    p === "Urgent"
      ? "border-l-4 border-rose-400 bg-rose-50"
      : p === "Important"
        ? "border-l-4 border-amber-400 bg-amber-50"
        : "border-l-4 border-slate-300 bg-slate-50";

  const priorityBadge = (p) =>
    p === "Urgent"
      ? "bg-rose-100 text-rose-700"
      : p === "Important"
        ? "bg-amber-100 text-amber-700"
        : "bg-blue-100 text-blue-700";

  const thClass =
    "text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide";
  const tdClass = "py-2 px-3 text-sm text-slate-750";

  const overviewStats = [
    {
      label: "Total Students",
      value: stats?.students ?? "—",
      icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
    },
    {
      label: "Total Teachers",
      value: stats?.teachers ?? "—",
      icon: <Users className="w-5 h-5 text-blue-600" />,
    },
    {
      label: "Total Classes",
      value: stats?.classes ?? "—",
      icon: <School className="w-5 h-5 text-emerald-600" />,
    },
    {
      label: "Total Subjects",
      value: stats?.subjects ?? "—",
      icon: <BookOpen className="w-5 h-5 text-amber-600" />,
    },
  ];

  const quickLinks = [
    {
      name: "Students",
      icon: (
        <GraduationCap className="w-5 h-5 text-indigo-500 group-hover:text-indigo-600" />
      ),
      path: "/students",
    },
    {
      name: "Teachers",
      icon: (
        <Users className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />
      ),
      path: "/teachers",
    },
    {
      name: "Classes",
      icon: (
        <School className="w-5 h-5 text-emerald-500 group-hover:text-emerald-600" />
      ),
      path: "/classes",
    },
    {
      name: "Attendance",
      icon: (
        <CalendarCheck className="w-5 h-5 text-rose-500 group-hover:text-rose-600" />
      ),
      path: "/attendance",
    },
    {
      name: "Exams",
      icon: (
        <FileSpreadsheet className="w-5 h-5 text-cyan-500 group-hover:text-cyan-600" />
      ),
      path: "/exams",
    },
    {
      name: "Fees",
      icon: (
        <DollarSign className="w-5 h-5 text-green-500 group-hover:text-green-600" />
      ),
      path: "/fees",
    },
    {
      name: "Subjects",
      icon: (
        <BookOpen className="w-5 h-5 text-amber-500 group-hover:text-amber-600" />
      ),
      path: "/subjects",
    },
    {
      name: "Timetable",
      icon: (
        <Clock className="w-5 h-5 text-purple-500 group-hover:text-purple-600" />
      ),
      path: "/timetable",
    },
    {
      name: "Notice Board",
      icon: (
        <Megaphone className="w-5 h-5 text-orange-500 group-hover:text-orange-600" />
      ),
      path: "/notices",
    },
  ];

  const visibleOverviewStats = overviewStats.filter((stat) => {
    if (isAdmin) return true;
    if (stat.label === "Total Students") return assignedPages.includes("students");
    if (stat.label === "Total Teachers") return assignedPages.includes("teachers");
    if (stat.label === "Total Classes") return assignedPages.includes("classes");
    if (stat.label === "Total Subjects") return assignedPages.includes("subjects");
    return true;
  });

  const visibleQuickLinks = quickLinks.filter((link) => {
    if (isAdmin) return true;
    const pageKey = link.path.replace("/", "");
    return assignedPages.includes(pageKey);
  });

  const getQuickLinkStyle = (name) => {
    switch (name) {
      case "Students":
        return "hover:bg-indigo-50/50 hover:border-indigo-200/50 text-indigo-600";
      case "Teachers":
        return "hover:bg-blue-50/50 hover:border-blue-200/50 text-blue-600";
      case "Classes":
        return "hover:bg-emerald-50/50 hover:border-emerald-200/50 text-emerald-600";
      case "Attendance":
        return "hover:bg-rose-50/50 hover:border-rose-200/50 text-rose-600";
      case "Exams":
        return "hover:bg-cyan-50/50 hover:border-cyan-200/50 text-cyan-600";
      case "Fees":
        return "hover:bg-green-50/50 hover:border-green-200/50 text-green-600";
      case "Subjects":
        return "hover:bg-amber-50/50 hover:border-amber-200/50 text-amber-600";
      case "Timetable":
        return "hover:bg-purple-50/50 hover:border-purple-200/50 text-purple-600";
      case "Notice Board":
        return "hover:bg-orange-50/50 hover:border-orange-200/50 text-orange-600";
      default:
        return "hover:bg-slate-50 hover:border-slate-200 text-slate-650";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-2.5 px-0">
      {/* Header Greeting */}
      <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5 mb-3 flex flex-col gap-0.5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-indigo-600 bg-indigo-50 uppercase">
            Punjab Public High School
          </span>
          <h1 className="text-lg md:text-xl font-black text-slate-800 mt-1.5 leading-tight">
            {greeting}, {userName || "Admin"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
            <Clock size={12} className="text-indigo-500" />
            <span>{formattedDate}</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-semibold">
              {formattedTime}
            </span>
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Side: Main Content (2/3 width) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {visibleOverviewStats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-md border border-slate-100/80 shadow-sm p-2.5 flex items-center gap-2.5 hover:shadow-md transition duration-200"
              >
                <div className="w-9 h-9 bg-indigo-50 rounded-md flex items-center justify-center shadow-sm shrink-0">
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 font-bold truncate">
                    {stat.label}
                  </p>
                  <p className="text-base font-extrabold text-slate-800 leading-tight mt-0.5">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Analytics Graphs Grid */}
          {((isAdmin || assignedPages.includes("fees")) || (isAdmin || assignedPages.includes("students"))) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(isAdmin || assignedPages.includes("fees")) && (
                <FeeCollectionsChart data={feeChartData} />
              )}
              {(isAdmin || assignedPages.includes("students")) && (
                <StudentEnrollmentChart data={enrollmentChartData} />
              )}
            </div>
          )}

          {/* Recent Fees */}
          {(isAdmin || assignedPages.includes("fees")) && (
            <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">
                  Recent Fee Collections
                </h3>
                <button
                  onClick={() => navigate("/fees")}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                >
                  View All
                </button>
              </div>
              {recentFees.length ? (
                <>
                  <table className="hidden sm:table w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className={thClass}>Student</th>
                        <th className={thClass}>Class</th>
                        <th className={thClass}>Amount</th>
                        <th className={thClass}>Date</th>
                        <th className={thClass}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentFees.map((fee, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors"
                        >
                          <td className={tdClass + " font-semibold text-slate-800"}>
                            {fee.student
                              ? `${fee.student.firstName || ""} ${fee.student.lastName || ""}`.trim()
                              : (fee.studentName || "—")}
                          </td>
                          <td className={tdClass}>
                            {fee.student?.currentClass?.name || fee.className || "—"}
                          </td>
                          <td className={tdClass + " font-semibold text-slate-900"}>
                            ₨ {fee.amount?.toLocaleString() || "—"}
                          </td>
                          <td className={tdClass}>
                            {fee.dueDate || fee.date || fee.createdAt
                              ? new Date(fee.dueDate || fee.date || fee.createdAt).toLocaleDateString("en-PK")
                              : "—"}
                          </td>
                          <td className={tdClass}>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${feeStatusColor(fee.status)}`}
                            >
                              {fee.status || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Mobile view */}
                  <div className="block sm:hidden space-y-2">
                    {recentFees.map((fee, i) => (
                      <div key={i} className="p-2.5 border border-slate-100 rounded-md space-y-1.5 bg-slate-50/30">
                        <div className="flex justify-between items-center">
                          <strong className="text-xs font-bold text-slate-800">
                            {fee.student
                              ? `${fee.student.firstName || ""} ${fee.student.lastName || ""}`.trim()
                              : (fee.studentName || "—")}
                          </strong>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${feeStatusColor(fee.status)}`}>
                            {fee.status || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Class: {fee.student?.currentClass?.name || fee.className || "—"}</span>
                          <span className="font-semibold text-slate-800">₨ {fee.amount?.toLocaleString() || "—"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Date: {fee.dueDate || fee.date || fee.createdAt ? new Date(fee.dueDate || fee.date || fee.createdAt).toLocaleDateString("en-PK") : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  No fee records found
                </p>
              )}
            </div>
          )}

          {/* Upcoming Exams + Notices Side by Side */}
          {((isAdmin || assignedPages.includes("exams")) || (isAdmin || assignedPages.includes("notices"))) && (
            <div className={`grid grid-cols-1 ${((isAdmin || assignedPages.includes("exams")) && (isAdmin || assignedPages.includes("notices"))) ? "md:grid-cols-2" : ""} gap-3`}>
              {/* Upcoming Exams */}
              {(isAdmin || assignedPages.includes("exams")) && (
                <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800">
                      Upcoming Exams
                    </h3>
                    <button
                      onClick={() => navigate("/exams")}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  {exams.length ? (
                    <>
                      <table className="hidden sm:table w-full">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className={thClass}>Exam</th>
                            <th className={thClass}>Subject</th>
                            <th className={thClass}>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exams.map((ex, i) => (
                            <tr
                              key={i}
                              className="border-b border-slate-50 hover:bg-slate-50/50"
                            >
                              <td
                                className={tdClass + " font-semibold text-slate-800"}
                              >
                                {ex.title || ex.name || "—"}
                              </td>
                              <td className={tdClass}>
                                {ex.subject || ex.subjectName || "—"}
                              </td>
                              <td className={tdClass + " font-medium"}>
                                {ex.examDate || ex.date
                                  ? new Date(ex.examDate || ex.date).toLocaleDateString("en-PK")
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Mobile view */}
                      <div className="block sm:hidden space-y-2">
                        {exams.map((ex, i) => (
                          <div key={i} className="p-2.5 border border-slate-100 rounded-md space-y-1 bg-slate-50/30">
                            <div className="flex justify-between items-center">
                              <strong className="text-xs font-bold text-slate-800">{ex.title || ex.name || "—"}</strong>
                              <span className="text-[10px] text-slate-400">
                                {ex.examDate || ex.date ? new Date(ex.examDate || ex.date).toLocaleDateString("en-PK") : "—"}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Subject: {ex.subject || ex.subjectName || "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">
                      No upcoming exams
                    </p>
                  )}
                </div>
              )}

              {/* Notices */}
              {(isAdmin || assignedPages.includes("notices")) && (
                <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Megaphone size={16} className="text-indigo-600" /> Notice
                      Board
                    </h3>
                    <button
                      onClick={() => navigate("/notices")}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  {notices.length ? (
                    <div className="space-y-2.5">
                      {notices.map((n, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-md border border-slate-100/40 ${priorityStyle(n.priority)}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-semibold text-slate-700 line-clamp-1">
                              {n.title}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${priorityBadge(n.priority)}`}
                            >
                              {n.priority || "Normal"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                            <Clock size={11} />{" "}
                            {n.publishDate || n.createdAt
                              ? new Date(n.publishDate || n.createdAt).toLocaleDateString("en-PK")
                              : "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">
                      No notices found
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Sidebar (1/3 width) */}
        <div className="space-y-6">
          {/* Today's Attendance */}
          {(isAdmin || assignedPages.includes("attendance")) && (
            <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5 space-y-2.5">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100/60">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  Today's Attendance Status
                </h3>
                <span className="text-[10px] text-emerald-650 bg-emerald-50 px-2 py-0.5 rounded font-extrabold uppercase">
                  {attendance?.date
                    ? new Date(attendance.date).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                      })
                    : "Daily Summary"}
                </span>
              </div>

              {attendance ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 min-h-[160px]">
                  {/* Left Side: Donut Chart */}
                  <div className="w-[120px] h-[120px] shrink-0 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Present", value: attendance.present, color: "#326080" },
                            { name: "Absent", value: attendance.absent, color: "#805232" },
                            { name: "Leave", value: attendance.leave, color: "#B5D2E6" },
                            { name: "Late", value: attendance.late, color: "#4e7e9f" },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={38}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                          animationDuration={1200}
                        >
                          {[
                            { name: "Present", value: attendance.present, color: "#326080" },
                            { name: "Absent", value: attendance.absent, color: "#805232" },
                            { name: "Leave", value: attendance.leave, color: "#B5D2E6" },
                            { name: "Late", value: attendance.late, color: "#4e7e9f" },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text inside Donut */}
                    <div className="absolute text-center">
                      <span className="block text-base font-black text-slate-800 leading-none">
                        {attPct !== "—" ? `${attPct}%` : "—%"}
                      </span>
                      <span className="text-[7px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">
                        Rate
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Details Grid */}
                  <div className="flex-1 w-full grid grid-cols-2 gap-2">
                    {[
                      { label: "Present", val: attendance.present, color: "text-emerald-700 bg-emerald-50/50 border-emerald-100/50 hover:bg-emerald-50", badge: "bg-emerald-500" },
                      { label: "Absent", val: attendance.absent, color: "text-rose-700 bg-rose-50/50 border-rose-100/50 hover:bg-rose-50", badge: "bg-rose-500" },
                      { label: "Leave", val: attendance.leave, color: "text-amber-700 bg-amber-50/50 border-amber-100/50 hover:bg-amber-50", badge: "bg-amber-500" },
                      { label: "Late", val: attendance.late, color: "text-blue-700 bg-blue-50/50 border-blue-100/50 hover:bg-blue-50", badge: "bg-blue-500" },
                    ].map((a) => (
                      <div key={a.label} className={`p-2 border rounded-md flex flex-col justify-center transition duration-150 ${a.color}`}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.badge}`} />
                          <span className="text-[10px] font-bold truncate opacity-80">{a.label}</span>
                        </div>
                        <span className="text-sm font-black mt-1 leading-none text-slate-850">{a.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  No attendance data for today
                </p>
              )}
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100/60">
              <School size={16} className="text-indigo-600" /> Quick Actions Links
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {visibleQuickLinks.map((link) => {
                const hoverStyle = getQuickLinkStyle(link.name);
                return (
                  <button
                    key={link.name}
                    onClick={() => navigate(link.path)}
                    className={`flex flex-col items-center gap-1.5 p-2 bg-slate-50/30 border border-slate-100/60 rounded-md transition-all duration-150 group text-center cursor-pointer ${hoverStyle}`}
                  >
                    <div className="w-8 h-8 rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      {link.icon}
                    </div>
                    <span className="text-[10px] text-slate-650 font-bold group-hover:text-inherit transition leading-tight">
                      {link.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Custom Animated Recharts Area Chart for Fees ─────────────────────
function FeeCollectionsChart({ data }) {
  const displayData = data && data.length ? data : [
    { name: "No Data", amount: 0 },
  ];

  return (
    <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5 space-y-2.5">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100/60">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-650 rounded-full" />
          Monthly Fee Collections (PKR)
        </h3>
        <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-extrabold uppercase">Real DB Data</span>
      </div>

      <div className="h-[180px] w-full text-xs font-semibold">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFee" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#326080" stopOpacity="0.2" />
                <stop offset="95%" stopColor="#326080" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(v) => `₨${v >= 1000 ? (v / 1000) + "k" : v}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#0f172a", 
                border: "none", 
                borderRadius: "6px",
                color: "#fff",
                fontSize: "10px",
                fontWeight: "bold"
              }}
              formatter={(v) => [`₨ ${v.toLocaleString()}`, "Amount"]}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#326080" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorFee)" 
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Custom Animated Recharts Donut Chart for Enrollment ──────────────
function StudentEnrollmentChart({ data }) {
  const displayData = data && data.length ? data : [
    { name: "No Class", count: 0 }
  ];

  const totalStudents = displayData.reduce((sum, d) => sum + d.count, 0);
  
  const chartData = displayData.map(d => ({
    ...d,
    value: d.count,
    percentage: totalStudents ? ((d.count / totalStudents) * 100).toFixed(1) : 0
  }));

  const COLORS = [
    "#326080", // Deep Marine Blue
    "#805232", // Warm Brown
    "#B5D2E6", // Light Sky Blue
    "#4e7e9f", // Slate Blue
    "#a47858", // Warm Tan
    "#89b8d9", // Sky Blue
    "#5d3920", // Dark Earth
    "#dcecf7", // Ice Blue
  ];

  return (
    <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5 space-y-2.5 flex flex-col justify-between">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100/60">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full" />
          Student Class Enrollment
        </h3>
        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-extrabold uppercase">Real DB Data</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 min-h-[180px]">
        {/* Left Side: Donut Chart */}
        <div className="w-[140px] h-[140px] shrink-0 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
                animationDuration={1200}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text inside Donut */}
          <div className="absolute text-center">
            <span className="block text-lg font-black text-slate-800 leading-none">
              {totalStudents}
            </span>
            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>

        {/* Right Side: Beautiful Infographic Legend */}
        <div className="flex-1 w-full space-y-2 max-h-[160px] overflow-y-auto pr-1">
          {chartData.map((d, index) => (
            <div key={index} className="flex items-center justify-between text-xs py-1 border-b border-slate-50/50 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <span 
                  className="w-1.5 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-bold text-slate-700 truncate">{d.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-400 font-semibold">{d.count} studs</span>
                <span 
                  className="font-black text-[11px]"
                  style={{ color: COLORS[index % COLORS.length] }}
                >
                  {d.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
