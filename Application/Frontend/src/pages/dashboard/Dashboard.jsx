import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";

// ── API base ──────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:3000";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export default function Dashboard() {
  const navigate   = useNavigate();
  const { userName } = useAuth();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting,    setGreeting]    = useState("");

  // ── Real data states ──────────────────────────────────────────
  const [stats,       setStats]       = useState(null);
  const [attendance,  setAttendance]  = useState(null);
  const [recentFees,  setRecentFees]  = useState([]);
  const [exams,       setExams]       = useState([]);
  const [notices,     setNotices]     = useState([]);
  const [loading,     setLoading]     = useState(true);

  // ── Clock ─────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12)      setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else                setGreeting("Good Evening");
  }, [currentTime]);

  // ── Fetch all dashboard data ──────────────────────────────────
  useEffect(() => {
  async function fetchAll() {
    try {
      const [studRes, teachRes, classRes, subRes, examRes, noticeRes, feeRes, attRes] =
        await Promise.allSettled([
          fetch(`${API}/api/students`,   { headers: authHeaders() }),
          fetch(`${API}/api/teachers`,   { headers: authHeaders() }),
          fetch(`${API}/api/classes`,    { headers: authHeaders() }),
          fetch(`${API}/api/subjects`,   { headers: authHeaders() }),
          fetch(`${API}/api/exams`,      { headers: authHeaders() }),
          fetch(`${API}/api/notices`,    { headers: authHeaders() }),
          fetch(`${API}/api/fee`,        { headers: authHeaders() }),
          fetch(`${API}/api/attendance/today-summary`, { headers: authHeaders() }),
        ]);

      const toJson = async (res) => {
        if (res.status === "fulfilled" && res.value.ok) return res.value.json();
        return null;
      };

      const [studData, teachData, classData, subData, examData, noticeData, feeData, attData] =
        await Promise.all([
          toJson(studRes), toJson(teachRes), toJson(classRes), toJson(subRes),
          toJson(examRes), toJson(noticeRes), toJson(feeRes),  toJson(attRes), // ✅ attRes fix
        ]);

      setStats({
        students: studData?.total ?? studData?.data?.length ?? 0,
        teachers: teachData?.total ?? teachData?.data?.length ?? 0,
        classes:  classData?.total ?? classData?.data?.length ?? 0,
        subjects: subData?.total   ?? subData?.data?.length   ?? 0,
      });

      const allExams = examData?.data ?? [];
      const today    = new Date();
      setExams(
        allExams
          .filter((e) => new Date(e.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 2)
      );

      setNotices((noticeData?.data ?? []).slice(0, 3));
      setRecentFees((feeData?.data ?? []).slice(0, 4));

      const attList = attData?.data ?? [];
      if (attData?.data) {
  setAttendance({
    present: attData.data.present,
    absent:  attData.data.absent,
    leave:   attData.data.leave,
    late:    attData.data.late,
  });
}

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }
  fetchAll();
}, []);

  // ── Helpers ───────────────────────────────────────────────────
  const formattedDate = currentTime.toLocaleDateString("en-PK", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString("en-PK", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const attTotal = attendance
    ? attendance.present + attendance.absent + attendance.leave + attendance.late
    : 0;
  const attPct = attTotal
    ? ((attendance.present / attTotal) * 100).toFixed(1)
    : "—";

  const feeStatusColor = (s) =>
    s === "Paid"    ? "bg-emerald-50 text-emerald-700" :
    s === "Pending" ? "bg-amber-50 text-amber-700"     :
                      "bg-rose-50 text-rose-700";

  const priorityStyle = (p) =>
    p === "Urgent"    ? "border-l-4 border-rose-400 bg-rose-50"   :
    p === "Important" ? "border-l-4 border-amber-400 bg-amber-50" :
                        "border-l-4 border-slate-300 bg-slate-50";

  const priorityBadge = (p) =>
    p === "Urgent"    ? "bg-rose-100 text-rose-700"   :
    p === "Important" ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700";

  const thClass = "text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide";
  const tdClass = "py-2 px-3 text-sm text-slate-700";

  const overviewStats = [
    { label: "Total Students", value: stats?.students ?? "—", icon: "👩‍🎓" },
    { label: "Total Teachers", value: stats?.teachers ?? "—", icon: "👨‍🏫" },
    { label: "Total Classes",  value: stats?.classes  ?? "—", icon: "📚" },
    { label: "Total Subjects", value: stats?.subjects ?? "—", icon: "📖" },
  ];

  const quickLinks = [
    { name: "Students",     icon: "👩‍🎓", path: "/students" },
    { name: "Teachers",     icon: "👨‍🏫", path: "/teachers" },
    { name: "Classes",      icon: "📚",  path: "/classes" },
    { name: "Attendance",   icon: "📊",  path: "/attendance" },
    { name: "Exams",        icon: "📝",  path: "/exams" },
    { name: "Fees",         icon: "💰",  path: "/fees" },
    { name: "Subjects",     icon: "📖",  path: "/subjects" },
    { name: "Timetable",    icon: "⏰",  path: "/timetable" },
    { name: "Notice Board", icon: "📢",  path: "/notices" },
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {greeting}, {userName || "Admin"} 👋
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {formattedDate} &nbsp;|&nbsp; {formattedTime}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/students/add")}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium transition"
            >
              + Add Student
            </button>
            <button
              onClick={() => navigate("/teachers/add")}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium transition"
            >
              + Add Teacher
            </button>
            <button
              onClick={() => navigate("/fees/collection")}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium transition"
            >
              💰 Collect Fee
            </button>
            <button
              onClick={() => navigate("/notices/create")}
              className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-xs font-medium transition"
            >
              📢 Create Notice
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {overviewStats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 truncate">{stat.label}</p>
                <p className="text-lg font-bold text-slate-800 leading-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Today's Attendance</h3>
          {attendance ? (
            <>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: "Present", val: attendance.present, color: "text-emerald-600 bg-emerald-50" },
                  { label: "Absent",  val: attendance.absent,  color: "text-rose-600 bg-rose-50" },
                  { label: "Leave",   val: attendance.leave,   color: "text-amber-600 bg-amber-50" },
                  { label: "Late",    val: attendance.late,    color: "text-blue-600 bg-blue-50" },
                ].map((a) => (
                  <div key={a.label} className={`text-center p-2 rounded-lg ${a.color}`}>
                    <p className="text-lg font-bold">{a.val}</p>
                    <p className="text-xs">{a.label}</p>
                  </div>
                ))}
              </div>
              <div className="text-center text-xs text-slate-500">
                Attendance Rate: <span className="text-base font-bold text-indigo-600">{attPct}%</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No attendance data for today</p>
          )}
        </div>

        {/* Recent Fees */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4 overflow-x-auto">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Recent Fee Collections</h3>
          {recentFees.length ? (
            <table className="w-full">
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
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className={tdClass + " font-medium"}>
                      {fee.studentId?.name || fee.studentName || "—"}
                    </td>
                    <td className={tdClass}>{fee.classId?.name || fee.className || "—"}</td>
                    <td className={tdClass}>₨ {fee.amount?.toLocaleString() || "—"}</td>
                    <td className={tdClass}>{fee.date ? new Date(fee.date).toLocaleDateString("en-PK") : "—"}</td>
                    <td className={tdClass}>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${feeStatusColor(fee.status)}`}>
                        {fee.status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No fee records found</p>
          )}
        </div>

        {/* Upcoming Exams + Notices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          {/* Upcoming Exams */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Upcoming Exams</h3>
            {exams.length ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className={thClass}>Exam</th>
                    <th className={thClass}>Subject</th>
                    <th className={thClass}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((ex, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className={tdClass + " font-medium"}>{ex.title || ex.name || "—"}</td>
                      <td className={tdClass}>{ex.subject?.name || ex.subjectName || "—"}</td>
                      <td className={tdClass}>{ex.date ? new Date(ex.date).toLocaleDateString("en-PK") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No upcoming exams</p>
            )}
          </div>

          {/* Notices */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">📢 Notice Board</h3>
            {notices.length ? (
              <div className="space-y-2">
                {notices.map((n, i) => (
                  <div key={i} className={`p-3 rounded-lg ${priorityStyle(n.priority)}`}>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-medium text-slate-700">{n.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${priorityBadge(n.priority)}`}>
                        {n.priority || "Normal"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      📅 {n.date ? new Date(n.date).toLocaleDateString("en-PK") : "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No notices found</p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Links</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {quickLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-lg hover:bg-indigo-50 transition group text-center"
              >
                <span className="text-xl">{link.icon}</span>
                <span className="text-xs text-slate-600 group-hover:text-indigo-600 font-medium leading-tight">
                  {link.name}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}