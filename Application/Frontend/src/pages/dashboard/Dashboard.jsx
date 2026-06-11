import { useState, useEffect } from "react";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

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

  const overviewStats = [
    {
      label: "Total Students",
      value: "1,250",
      icon: "👩‍🎓",
      change: "+8%",
      positive: true,
    },
    {
      label: "Total Teachers",
      value: "85",
      icon: "👨‍🏫",
      change: "+3%",
      positive: true,
    },
    {
      label: "Total Classes",
      value: "32",
      icon: "📚",
      change: "0%",
      positive: null,
    },
    {
      label: "Total Subjects",
      value: "48",
      icon: "📖",
      change: "+5%",
      positive: true,
    },
    {
      label: "Fee Collected",
      value: "₨ 12.5M",
      icon: "💰",
      change: "+12%",
      positive: true,
    },
    {
      label: "Pending Fees",
      value: "₨ 2.8M",
      icon: "⏳",
      change: "-5%",
      positive: false,
    },
    {
      label: "Today's Attendance",
      value: "92%",
      icon: "📊",
      change: "+2%",
      positive: true,
    },
    {
      label: "Upcoming Exams",
      value: "6",
      icon: "📝",
      change: "+2",
      positive: null,
    },
  ];

  const studentAnalytics = { boys: 680, girls: 570, total: 1250 };
  const attendanceOverview = { present: 1045, absent: 85, leave: 65, late: 55 };

  const recentFees = [
    {
      student: "Ali Raza",
      class: "10th",
      amount: "₨ 5,000",
      date: "2025-03-15",
      status: "Paid",
    },
    {
      student: "Sana Khan",
      class: "9th",
      amount: "₨ 4,500",
      date: "2025-03-14",
      status: "Pending",
    },
    {
      student: "Imran Ali",
      class: "10th",
      amount: "₨ 5,000",
      date: "2025-03-14",
      status: "Paid",
    },
    {
      student: "Fatima Ahmed",
      class: "11th",
      amount: "₨ 6,000",
      date: "2025-03-13",
      status: "Overdue",
    },
  ];

  const recentAdmissions = [
    { name: "Hamza Ali", class: "9th", date: "2025-03-10", status: "Active" },
    { name: "Zara Tariq", class: "6th", date: "2025-03-09", status: "Active" },
  ];

  const upcomingExams = [
    {
      exam: "Mid Term",
      class: "10th",
      date: "2025-03-20",
      subject: "Mathematics",
    },
    {
      exam: "Final Term",
      class: "12th",
      date: "2025-04-05",
      subject: "Physics",
    },
  ];

  const todayTimetable = [
    {
      period: "Current",
      class: "10th-A",
      subject: "Mathematics",
      teacher: "Mr. Ahmed",
      room: "101",
      time: "08:00-09:00",
    },
    {
      period: "Next",
      class: "10th-A",
      subject: "Physics",
      teacher: "Dr. Sana",
      room: "Lab 1",
      time: "09:00-10:00",
    },
  ];

  const notices = [
    { title: "School Reopening", priority: "Urgent", date: "2025-03-18" },
    {
      title: "Fee Submission Deadline",
      priority: "Important",
      date: "2025-03-25",
    },
    { title: "Parent-Teacher Meeting", priority: "Normal", date: "2025-03-30" },
  ];

  const quickLinks = [
    { name: "Students", icon: "👩‍🎓", path: "/students" },
    { name: "Teachers", icon: "👨‍🏫", path: "/teachers" },
    { name: "Classes", icon: "📚", path: "/classes" },
    { name: "Attendance", icon: "📊", path: "/attendance" },
    { name: "Exams", icon: "📝", path: "/exams" },
    { name: "Fees", icon: "💰", path: "/fees" },
    { name: "Subjects", icon: "📖", path: "/subjects" },
    { name: "Timetable", icon: "⏰", path: "/timetable" },
    { name: "Notice Board", icon: "📢", path: "/notices" },
  ];

  const activities = [
    {
      action: "New student Ali Raza added",
      time: "10:30 AM",
      date: "Mar 18",
      icon: "➕",
    },
    {
      action: "Fee collected from Sana Khan",
      time: "09:15 AM",
      date: "Mar 18",
      icon: "💰",
    },
    {
      action: "Attendance marked for Class 10th",
      time: "08:45 AM",
      date: "Mar 18",
      icon: "📊",
    },
    {
      action: "Mid Term exam created",
      time: "Yesterday",
      date: "Mar 17",
      icon: "📝",
    },
    {
      action: "Notice published: Holiday",
      time: "Yesterday",
      date: "Mar 17",
      icon: "📢",
    },
  ];

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

  const total =
    attendanceOverview.present +
    attendanceOverview.absent +
    attendanceOverview.leave +
    attendanceOverview.late;
  const attPct = ((attendanceOverview.present / total) * 100).toFixed(1);

  const thClass =
    "text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide";
  const tdClass = "py-2 px-3 text-sm text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {greeting}, Admin 👋
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {formattedDate} &nbsp;|&nbsp; {formattedTime} &nbsp;|&nbsp;
              Session: 2025–2026
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium transition">
              + Add Student
            </button>
            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium transition">
              + Add Teacher
            </button>
            <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-medium transition">
              💰 Collect Fee
            </button>
            <button className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-xs font-medium transition">
              📢 Create Notice
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {overviewStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3"
            >
              <span className="text-2xl">{stat.icon}</span>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 truncate">{stat.label}</p>
                <p className="text-lg font-bold text-slate-800 leading-tight">
                  {stat.value}
                </p>
                <p
                  className={`text-xs font-medium ${stat.positive === true ? "text-emerald-600" : stat.positive === false ? "text-rose-500" : "text-slate-400"}`}
                >
                  {stat.change} this month
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Student Analytics + Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Student Analytics */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Student Analytics
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: "Boys",
                  count: studentAnalytics.boys,
                  color: "bg-blue-500",
                },
                {
                  label: "Girls",
                  count: studentAnalytics.girls,
                  color: "bg-pink-500",
                },
              ].map((g) => (
                <div key={g.label}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{g.label}</span>
                    <span>
                      {g.count} (
                      {((g.count / studentAnalytics.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`${g.color} h-1.5 rounded-full`}
                      style={{
                        width: `${(g.count / studentAnalytics.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-medium text-slate-700">
                <span>Total</span>
                <span>{studentAnalytics.total}</span>
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Today's Attendance
            </h3>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                {
                  label: "Present",
                  val: attendanceOverview.present,
                  color: "text-emerald-600 bg-emerald-50",
                },
                {
                  label: "Absent",
                  val: attendanceOverview.absent,
                  color: "text-rose-600 bg-rose-50",
                },
                {
                  label: "Leave",
                  val: attendanceOverview.leave,
                  color: "text-amber-600 bg-amber-50",
                },
                {
                  label: "Late",
                  val: attendanceOverview.late,
                  color: "text-blue-600 bg-blue-50",
                },
              ].map((a) => (
                <div
                  key={a.label}
                  className={`text-center p-2 rounded-lg ${a.color}`}
                >
                  <p className="text-lg font-bold">{a.val}</p>
                  <p className="text-xs">{a.label}</p>
                </div>
              ))}
            </div>
            <div className="text-center text-xs text-slate-500">
              Attendance Rate:{" "}
              <span className="text-base font-bold text-indigo-600">
                {attPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Fee Overview + Recent Collections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Fee Overview
            </h3>
            <div className="space-y-2.5">
              {[
                {
                  label: "This Month",
                  val: "₨ 8.2M",
                  color: "text-emerald-600",
                },
                { label: "Pending", val: "₨ 2.8M", color: "text-amber-600" },
                { label: "Overdue", val: "₨ 1.2M", color: "text-rose-600" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex justify-between items-center"
                >
                  <span className="text-xs text-slate-500">{f.label}</span>
                  <span className={`text-sm font-bold ${f.color}`}>
                    {f.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-4 overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Recent Fee Collections
            </h3>
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
                  <tr
                    key={i}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className={tdClass + " font-medium"}>{fee.student}</td>
                    <td className={tdClass}>{fee.class}</td>
                    <td className={tdClass}>{fee.amount}</td>
                    <td className={tdClass}>{fee.date}</td>
                    <td className={tdClass}>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${feeStatusColor(fee.status)}`}
                      >
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 4: Admissions + Exams + Timetable */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Recent Admissions
            </h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className={thClass}>Student</th>
                  <th className={thClass}>Class</th>
                  <th className={thClass}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAdmissions.map((ad, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className={tdClass + " font-medium"}>{ad.name}</td>
                    <td className={tdClass}>{ad.class}</td>
                    <td className={tdClass}>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                        {ad.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Upcoming Exams
            </h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className={thClass}>Exam</th>
                  <th className={thClass}>Class</th>
                  <th className={thClass}>Date</th>
                </tr>
              </thead>
              <tbody>
                {upcomingExams.map((ex, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className={tdClass + " font-medium"}>{ex.exam}</td>
                    <td className={tdClass}>{ex.class}</td>
                    <td className={tdClass}>{ex.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Today's Timetable — 10th-A
            </h3>
            <div className="space-y-2">
              {todayTimetable.map((tt) => (
                <div
                  key={tt.period}
                  className={`p-3 rounded-lg ${tt.period === "Current" ? "bg-indigo-50 border border-indigo-100" : "bg-slate-50"}`}
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-semibold text-slate-700">
                      {tt.period} · {tt.subject}
                    </span>
                    <span className="text-xs text-slate-400">{tt.time}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {tt.teacher} &nbsp;·&nbsp; Room {tt.room}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 5: Notices + Quick Links + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              📢 Notice Board
            </h3>
            <div className="space-y-2">
              {notices.map((n, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg ${priorityStyle(n.priority)}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-medium text-slate-700">
                      {n.title}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${priorityBadge(n.priority)}`}
                    >
                      {n.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">📅 {n.date}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Quick Links
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-lg hover:bg-indigo-50 transition group text-center"
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="text-xs text-slate-600 group-hover:text-indigo-600 font-medium leading-tight">
                    {link.name}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 overflow-y-auto max-h-80">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              🕒 Activity Timeline
            </h3>
            <div className="relative pl-4 border-l-2 border-indigo-100 space-y-3">
              {activities.map((act, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[1.35rem] w-3 h-3 bg-indigo-500 rounded-full border-2 border-white" />
                  <p className="text-xs font-medium text-slate-700">
                    {act.action}
                  </p>
                  <p className="text-xs text-slate-400">
                    {act.date} · {act.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
