import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import toast from "react-hot-toast";
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
  const { userName } = useAuth();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  // ── Real data states ──────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [recentFees, setRecentFees] = useState([]);
  const [exams, setExams] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

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
            .filter((e) => new Date(e.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 2),
        );

        setNotices((noticeData?.data ?? []).slice(0, 3));
        setRecentFees((feeData?.data ?? []).slice(0, 4));

        if (attData?.data) {
          setAttendance({
            present: attData.data.present,
            absent: attData.data.absent,
            leave: attData.data.leave,
            late: attData.data.late,
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
    <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Greeting */}
      <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6 mb-6 flex flex-col gap-1">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-indigo-600 bg-indigo-50 uppercase">
            Punjab Public High School
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 mt-2 leading-tight">
            {greeting}, {userName || "Admin"}
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium flex items-center gap-2">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Main Content (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-4 flex items-center gap-3.5 hover:shadow-md transition duration-200"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 font-medium truncate">
                    {stat.label}
                  </p>
                  <p className="text-lg font-extrabold text-slate-800 leading-tight mt-0.5">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Fees */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5">
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
                          {fee.studentId?.name || fee.studentName || "—"}
                        </td>
                        <td className={tdClass}>
                          {fee.classId?.name || fee.className || "—"}
                        </td>
                        <td className={tdClass + " font-semibold text-slate-900"}>
                          ₨ {fee.amount?.toLocaleString() || "—"}
                        </td>
                        <td className={tdClass}>
                          {fee.date
                            ? new Date(fee.date).toLocaleDateString("en-PK")
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
                    <div key={i} className="p-2.5 border border-slate-100 rounded-xl space-y-1.5 bg-slate-50/30">
                      <div className="flex justify-between items-center">
                        <strong className="text-xs font-bold text-slate-800">{fee.studentId?.name || fee.studentName || "—"}</strong>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${feeStatusColor(fee.status)}`}>
                          {fee.status || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Class: {fee.classId?.name || fee.className || "—"}</span>
                        <span className="font-semibold text-slate-800">₨ {fee.amount?.toLocaleString() || "—"}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Date: {fee.date ? new Date(fee.date).toLocaleDateString("en-PK") : "—"}
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

          {/* Upcoming Exams + Notices Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Exams */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5">
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
                            {ex.subject?.name || ex.subjectName || "—"}
                          </td>
                          <td className={tdClass + " font-medium"}>
                            {ex.date
                              ? new Date(ex.date).toLocaleDateString("en-PK")
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Mobile view */}
                  <div className="block sm:hidden space-y-2">
                    {exams.map((ex, i) => (
                      <div key={i} className="p-2.5 border border-slate-100 rounded-xl space-y-1 bg-slate-50/30">
                        <div className="flex justify-between items-center">
                          <strong className="text-xs font-bold text-slate-800">{ex.title || ex.name || "—"}</strong>
                          <span className="text-[10px] text-slate-400">
                            {ex.date ? new Date(ex.date).toLocaleDateString("en-PK") : "—"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Subject: {ex.subject?.name || ex.subjectName || "—"}
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

            {/* Notices */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5">
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
                      className={`p-3 rounded-xl border border-slate-100/40 ${priorityStyle(n.priority)}`}
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
                        {n.date
                          ? new Date(n.date).toLocaleDateString("en-PK")
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
          </div>
        </div>

        {/* Right Side: Sidebar (1/3 width) */}
        <div className="space-y-6">
          {/* Today's Attendance */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Today's Attendance
            </h3>
            {attendance ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      label: "Present",
                      val: attendance.present,
                      color:
                        "text-emerald-700 bg-emerald-50 border-emerald-100",
                    },
                    {
                      label: "Absent",
                      val: attendance.absent,
                      color: "text-rose-700 bg-rose-50 border-rose-100",
                    },
                    {
                      label: "Leave",
                      val: attendance.leave,
                      color: "text-amber-700 bg-amber-50 border-amber-100",
                    },
                    {
                      label: "Late",
                      val: attendance.late,
                      color: "text-blue-700 bg-blue-50 border-blue-100",
                    },
                  ].map((a) => (
                    <div
                      key={a.label}
                      className={`text-center p-3 rounded-xl border ${a.color}`}
                    >
                      <p className="text-xl font-extrabold">{a.val}</p>
                      <p className="text-xs font-semibold opacity-90 mt-0.5">
                        {a.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">
                    Attendance Rate:
                  </span>
                  <span className="text-sm font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {attPct}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                No attendance data for today
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Quick Links
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {quickLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className="flex flex-col items-center gap-1.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 transition group text-center cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    {link.icon}
                  </div>
                  <span className="text-[11px] text-slate-600 group-hover:text-indigo-600 font-bold leading-tight">
                    {link.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
