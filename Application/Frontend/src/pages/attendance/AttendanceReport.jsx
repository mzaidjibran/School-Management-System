import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

// ---------- Data ----------
const generateStudentReports = () => {
  const students = [
    {
      id: 1,
      name: "Ali Raza",
      rollNo: "2024-001",
      class: "10th",
      section: "A",
    },
    {
      id: 2,
      name: "Sana Khan",
      rollNo: "2024-002",
      class: "10th",
      section: "A",
    },
    {
      id: 3,
      name: "Imran Ali",
      rollNo: "2024-003",
      class: "10th",
      section: "B",
    },
    {
      id: 4,
      name: "Fatima Ahmed",
      rollNo: "2024-004",
      class: "9th",
      section: "A",
    },
    {
      id: 5,
      name: "Usman Chaudhry",
      rollNo: "2024-005",
      class: "9th",
      section: "B",
    },
    {
      id: 6,
      name: "Ayesha Siddiqui",
      rollNo: "2024-006",
      class: "11th",
      section: "A",
    },
  ];
  return students.map((s) => {
    const present = Math.floor(Math.random() * 180) + 20;
    const totalDays = 200;
    const absent = totalDays - present - Math.floor(Math.random() * 15);
    const leave = Math.floor(Math.random() * 10);
    const late = Math.floor(Math.random() * 8);
    const percent = ((present / totalDays) * 100).toFixed(1);
    return {
      ...s,
      present,
      absent,
      leave,
      late,
      totalDays,
      percent: parseFloat(percent),
    };
  });
};

const generateMonthlySummary = () =>
  [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].map((m) => ({
    month: m,
    present: Math.floor(Math.random() * 180) + 20,
    absent: Math.floor(Math.random() * 20),
    leave: Math.floor(Math.random() * 8),
    late: Math.floor(Math.random() * 6),
  }));

const generateClassWiseSummary = () =>
  ["9th", "10th", "11th", "12th"].map((c) => ({
    class: c,
    totalStudents: Math.floor(Math.random() * 40) + 20,
    avgAttendance: Math.floor(Math.random() * 20) + 75,
  }));

// ---------- Helpers ----------
const avatarColors = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
];

const getBarColor = (pct) => {
  if (pct >= 90) return "linear-gradient(90deg,#10b981,#34d399)";
  if (pct >= 75) return "linear-gradient(90deg,#f59e0b,#fbbf24)";
  return "linear-gradient(90deg,#ef4444,#f87171)";
};

const getPctBadge = (pct) => {
  if (pct >= 90) return { bg: "#d1fae5", color: "#065f46" };
  if (pct >= 75) return { bg: "#fef3c7", color: "#92400e" };
  return { bg: "#fee2e2", color: "#991b1b" };
};

// ---------- Component ----------
export default function AttendanceReport() {
  const [studentData, setStudentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [monthlyData] = useState(generateMonthlySummary());
  const [classWiseData] = useState(generateClassWiseSummary());
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-03-31");

  useEffect(() => {
    setTimeout(() => {
      const data = generateStudentReports();
      setStudentData(data);
      setFilteredData(data);
      setLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    let r = studentData;
    if (classFilter) r = r.filter((s) => s.class === classFilter);
    if (sectionFilter) r = r.filter((s) => s.section === sectionFilter);
    if (studentFilter)
      r = r.filter(
        (s) =>
          s.name.toLowerCase().includes(studentFilter.toLowerCase()) ||
          s.rollNo.includes(studentFilter),
      );
    setFilteredData(r);
  }, [classFilter, sectionFilter, studentFilter, studentData]);

  const totalPresent = filteredData.reduce((a, s) => a + s.present, 0);
  const totalAbsent = filteredData.reduce((a, s) => a + s.absent, 0);
  const totalLeave = filteredData.reduce((a, s) => a + s.leave, 0);
  const totalLate = filteredData.reduce((a, s) => a + s.late, 0);
  const totalPossible = filteredData.reduce((a, s) => a + s.totalDays, 0);
  const overallPct = totalPossible
    ? ((totalPresent / totalPossible) * 100).toFixed(1)
    : 0;

  const topPerformers = filteredData
    .filter((s) => s.percent >= 90)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);
  const lowAttendance = filteredData
    .filter((s) => s.percent < 75)
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 5);

  const exportCSV = () => {
    const headers = [
      "Roll No",
      "Student Name",
      "Class",
      "Section",
      "Present",
      "Absent",
      "Leave",
      "Late",
      "Attendance %",
    ];
    const rows = filteredData.map((s) => [
      s.rollNo,
      s.name,
      s.class,
      s.section,
      s.present,
      s.absent,
      s.leave,
      s.late,
      s.percent,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "attendance_report.csv";
    a.click();
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredData.map((s) => ({
        "Roll No": s.rollNo,
        "Student Name": s.name,
        Class: s.class,
        Section: s.section,
        Present: s.present,
        Absent: s.absent,
        Leave: s.leave,
        Late: s.late,
        "Attendance %": s.percent,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance_report.xlsx");
  };
  const exportPDF = () => window.print();

  const uniqueClasses = [...new Set(studentData.map((s) => s.class))];
  const uniqueSections = [...new Set(studentData.map((s) => s.section))];

  const inputStyle = {
    height: 36,
    padding: "0 12px",
    fontSize: 13,
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    background: "#fff",
    outline: "none",
    width: "100%",
    color: "#374151",
    appearance: "none",
  };

  const statCards = [
    {
      label: "Overall Attendance",
      value: `${overallPct}%`,
      icon: "📈",
      bg: "linear-gradient(135deg,#6366f1,#8b5cf6)",
      sub: "all students",
    },
    {
      label: "Present Days",
      value: totalPresent,
      icon: "✅",
      bg: "linear-gradient(135deg,#10b981,#34d399)",
      sub: "total days",
    },
    {
      label: "Absent Days",
      value: totalAbsent,
      icon: "❌",
      bg: "linear-gradient(135deg,#ef4444,#f87171)",
      sub: "total days",
    },
    {
      label: "Leave Days",
      value: totalLeave,
      icon: "🏖️",
      bg: "linear-gradient(135deg,#f59e0b,#fbbf24)",
      sub: "approved",
    },
    {
      label: "Late Arrivals",
      value: totalLate,
      icon: "⏰",
      bg: "linear-gradient(135deg,#3b82f6,#60a5fa)",
      sub: "total entries",
    },
  ];

  const exportBtns = [
    {
      label: "CSV",
      icon: "📄",
      color: "#059669",
      bg: "#ecfdf5",
      border: "#6ee7b7",
      action: exportCSV,
    },
    {
      label: "Excel",
      icon: "📊",
      color: "#16a34a",
      bg: "#dcfce7",
      border: "#86efac",
      action: exportExcel,
    },
    {
      label: "PDF",
      icon: "📑",
      color: "#dc2626",
      bg: "#fef2f2",
      border: "#fca5a5",
      action: exportPDF,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "32px 20px" }}>
        {/* ── Header Banner ── */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#312e81 100%)",
            borderRadius: 20,
            padding: "28px 32px",
            marginBottom: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative blobs */}
          <div
            style={{
              position: "absolute",
              top: -40,
              right: 80,
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.25)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -30,
              right: 20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(139,92,246,0.2)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Dashboard / Reports
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#fff",
                margin: 0,
              }}
            >
              Attendance Reports
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                marginTop: 4,
              }}
            >
              Analytics and insights on student attendance
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, position: "relative" }}>
            {exportBtns.map(({ label, icon, color, bg, border, action }) => (
              <button
                key={label}
                onClick={action}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 16px",
                  background: bg,
                  border: `1.5px solid ${border}`,
                  borderRadius: 10,
                  color,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {statCards.map(({ label, value, icon, bg, sub }) => (
            <div
              key={label}
              style={{
                background: bg,
                borderRadius: 16,
                padding: "20px 22px",
                color: "#fff",
                boxShadow: "0 6px 24px rgba(0,0,0,0.13)",
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
                {value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  opacity: 0.9,
                  marginTop: 4,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>
                {sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "18px 24px",
            marginBottom: 20,
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Filter Records
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
              gap: 10,
            }}
          >
            <input
              type="text"
              placeholder="🔍  Search name or roll no…"
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              style={{ ...inputStyle, background: "#f8fafc" }}
            />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="">All Classes</option>
              {uniqueClasses.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="">All Sections</option>
              {uniqueSections.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* ── Main Table ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "linear-gradient(90deg,#fafbff,#f5f3ff)",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
              Student Attendance
            </span>
            <span
              style={{
                background: "#ede9fe",
                color: "#7c3aed",
                fontSize: 12,
                fontWeight: 600,
                padding: "3px 12px",
                borderRadius: 99,
              }}
            >
              {filteredData.length} students
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "Roll No",
                    "Student",
                    "Class",
                    "Sec",
                    "Present",
                    "Absent",
                    "Leave",
                    "Late",
                    "Attendance",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: 11,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #e2e8f0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: 48,
                        textAlign: "center",
                        color: "#94a3b8",
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                      Loading records…
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: 48,
                        textAlign: "center",
                        color: "#94a3b8",
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>No
                      records found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((s, i) => {
                    const badge = getPctBadge(s.percent);
                    return (
                      <tr
                        key={s.id}
                        style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f5f3ff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            i % 2 === 0 ? "#fff" : "#fafbfc")
                        }
                      >
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <code
                            style={{
                              background: "#f1f5f9",
                              padding: "2px 8px",
                              borderRadius: 6,
                              fontSize: 11,
                              color: "#64748b",
                            }}
                          >
                            {s.rollNo}
                          </code>
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 10,
                                flexShrink: 0,
                                background:
                                  avatarColors[s.id % avatarColors.length],
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <div
                                style={{ fontWeight: 600, color: "#1e293b" }}
                              >
                                {s.name}
                              </div>
                              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                                Section {s.section}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <span
                            style={{
                              background: "#ede9fe",
                              color: "#6d28d9",
                              padding: "3px 10px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {s.class}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f1f5f9",
                            color: "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          {s.section}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <span
                            style={{
                              color: "#059669",
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {s.present}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <span
                            style={{
                              color: "#dc2626",
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {s.absent}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <span
                            style={{
                              color: "#d97706",
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {s.leave}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <span
                            style={{
                              color: "#2563eb",
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {s.late}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                width: 56,
                                height: 6,
                                background: "#e2e8f0",
                                borderRadius: 99,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${s.percent}%`,
                                  height: "100%",
                                  background: getBarColor(s.percent),
                                  borderRadius: 99,
                                }}
                              />
                            </div>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 700,
                                background: badge.bg,
                                color: badge.color,
                              }}
                            >
                              {s.percent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredData.length > 0 && (
            <div
              style={{
                padding: "12px 24px",
                borderTop: "1px solid #f1f5f9",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "#94a3b8",
              }}
            >
              <span>
                Showing {filteredData.length} of {studentData.length} students
              </span>
              <span>
                {startDate} — {endDate}
              </span>
            </div>
          )}
        </div>

        {/* ── Analytics Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {/* Monthly Summary */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                background: "linear-gradient(90deg,#fafbff,#f0fdf4)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>
                📅 Monthly Summary
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {[
                      { h: "Month", color: "#64748b" },
                      { h: "Present", color: "#059669" },
                      { h: "Absent", color: "#dc2626" },
                      { h: "Leave", color: "#d97706" },
                      { h: "Late", color: "#2563eb" },
                    ].map(({ h, color }) => (
                      <th
                        key={h}
                        style={{
                          padding: "9px 14px",
                          textAlign: h === "Month" ? "left" : "center",
                          color,
                          fontWeight: 600,
                          borderBottom: "1px solid #e2e8f0",
                          fontSize: 11,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m, i) => (
                    <tr
                      key={m.month}
                      style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f5f3ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          i % 2 === 0 ? "#fff" : "#fafbfc")
                      }
                    >
                      <td
                        style={{
                          padding: "8px 14px",
                          fontWeight: 600,
                          color: "#374151",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {m.month}
                      </td>
                      <td
                        style={{
                          padding: "8px 14px",
                          textAlign: "center",
                          color: "#059669",
                          fontWeight: 600,
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {m.present}
                      </td>
                      <td
                        style={{
                          padding: "8px 14px",
                          textAlign: "center",
                          color: "#dc2626",
                          fontWeight: 600,
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {m.absent}
                      </td>
                      <td
                        style={{
                          padding: "8px 14px",
                          textAlign: "center",
                          color: "#d97706",
                          fontWeight: 600,
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {m.leave}
                      </td>
                      <td
                        style={{
                          padding: "8px 14px",
                          textAlign: "center",
                          color: "#2563eb",
                          fontWeight: 600,
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {m.late}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Class Wise */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                background: "linear-gradient(90deg,#fafbff,#faf5ff)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>
                🏫 Class-wise Attendance
              </span>
            </div>
            <div style={{ padding: "20px" }}>
              {classWiseData.map((c, i) => {
                const colors = [
                  "linear-gradient(90deg,#6366f1,#818cf8)",
                  "linear-gradient(90deg,#8b5cf6,#a78bfa)",
                  "linear-gradient(90deg,#ec4899,#f472b6)",
                  "linear-gradient(90deg,#f59e0b,#fbbf24)",
                ];
                return (
                  <div
                    key={c.class}
                    style={{
                      marginBottom: i < classWiseData.length - 1 ? 20 : 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: colors[i % colors.length],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {c.class.replace("th", "")}
                        </div>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#374151",
                          }}
                        >
                          Class {c.class}
                        </span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          {c.totalStudents} students
                        </span>
                      </div>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#6366f1",
                        }}
                      >
                        {c.avgAttendance}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: "#e2e8f0",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${c.avgAttendance}%`,
                          height: "100%",
                          background: colors[i % colors.length],
                          borderRadius: 99,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Top & Low ── */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        >
          {/* Top Performers */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                background: "linear-gradient(90deg,#f0fdf4,#dcfce7)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14, color: "#065f46" }}>
                🏆 Top Performers ≥ 90%
              </span>
            </div>
            <div style={{ padding: "8px 0" }}>
              {topPerformers.length ? (
                topPerformers.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 20px",
                      borderBottom:
                        i < topPerformers.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f0fdf4")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: avatarColors[s.id % avatarColors.length],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#1e293b",
                          }}
                        >
                          {s.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          {s.class} — {s.rollNo}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        background: "#d1fae5",
                        color: "#065f46",
                        padding: "4px 12px",
                        borderRadius: 99,
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {s.percent}%
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: "32px 20px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  No students in top range
                </div>
              )}
            </div>
          </div>

          {/* Low Attendance */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                background: "linear-gradient(90deg,#fff1f2,#fee2e2)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14, color: "#991b1b" }}>
                ⚠️ Low Attendance &lt; 75%
              </span>
            </div>
            <div style={{ padding: "8px 0" }}>
              {lowAttendance.length ? (
                lowAttendance.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 20px",
                      borderBottom:
                        i < lowAttendance.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fff1f2")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: "#fee2e2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ef4444",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#1e293b",
                          }}
                        >
                          {s.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          {s.class} — {s.rollNo}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        padding: "4px 12px",
                        borderRadius: 99,
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {s.percent}%
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: "32px 20px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  ✓ All students have good attendance
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
