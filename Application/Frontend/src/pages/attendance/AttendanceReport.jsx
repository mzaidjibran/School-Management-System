import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getAllStudents } from "../../api/Student_Api.js";
import { getAttendanceByStudent } from "../../api/Attendence_Api.js";
import { getAllClasses } from "../../api/Class_Api.js";

// ---------- Helpers ----------
const avatarColors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
const getBarColor  = (pct) =>
  pct >= 90 ? "linear-gradient(90deg,#10b981,#34d399)"
  : pct >= 75 ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
  : "linear-gradient(90deg,#ef4444,#f87171)";
const getPctBadge  = (pct) =>
  pct >= 90 ? { bg: "#d1fae5", color: "#065f46" }
  : pct >= 75 ? { bg: "#fef3c7", color: "#92400e" }
  : { bg: "#fee2e2", color: "#991b1b" };

const inputStyle = {
  height: 36, padding: "0 12px", fontSize: 13,
  border: "1px solid #e2e8f0", borderRadius: 10,
  background: "#fff", outline: "none", width: "100%",
  color: "#374151", appearance: "none",
};

export default function AttendanceReport() {
  const [classes, setClasses]           = useState([]);
  const [students, setStudents]         = useState([]);
  const [reportData, setReportData]     = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading]           = useState(false);

  const [classFilter, setClassFilter]     = useState("");
  const [studentFilter, setStudentFilter] = useState("");

  // Current month default
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year,  setYear]  = useState(String(now.getFullYear()));

  // ── Load classes ───────────────────────────────────────────────
  useEffect(() => {
    getAllClasses()
      .then((r) => setClasses(r.data || []))
      .catch(console.error);
  }, []);

  // ── Load students jab class filter change ho ──────────────────
  useEffect(() => {
    const params = classFilter ? { currentClass: classFilter } : {};
    getAllStudents(params)
      .then((r) => setStudents(r.data || []))
      .catch(console.error);
  }, [classFilter]);

  // ── Build report: har student ki attendance summary ───────────
  useEffect(() => {
    if (students.length === 0) {
      setReportData([]);
      setFilteredData([]);
      return;
    }
    setLoading(true);

    const fetchAll = async () => {
      const results = await Promise.allSettled(
        students.map((s) =>
          getAttendanceByStudent(s._id, parseInt(month), parseInt(year))
        )
      );

      const data = students.map((s, i) => {
        const res = results[i];
        if (res.status === "rejected") {
          return { ...s, present: 0, absent: 0, leave: 0, late: 0, total: 0, percent: 0 };
        }
        const summary = res.value.summary || {};
        const total   = summary.total || 0;
        const present = summary.present || 0;
        const percent = total ? parseFloat(((present / total) * 100).toFixed(1)) : 0;
        return {
          ...s,
          present,
          absent:  summary.absent || 0,
          leave:   summary.leave  || 0,
          late:    summary.late   || 0,
          total,
          percent,
        };
      });

      setReportData(data);
      setFilteredData(data);
      setLoading(false);
    };

    fetchAll();
  }, [students, month, year]);

  // ── Client-side name filter ────────────────────────────────────
  useEffect(() => {
    if (!studentFilter) {
      setFilteredData(reportData);
      return;
    }
    setFilteredData(
      reportData.filter((s) => {
        const name = `${s.firstName} ${s.lastName}`.toLowerCase();
        return name.includes(studentFilter.toLowerCase()) ||
          (s.rollNumber || "").includes(studentFilter);
      })
    );
  }, [studentFilter, reportData]);

  // ── Totals ─────────────────────────────────────────────────────
  const totalPresent  = filteredData.reduce((a, s) => a + s.present, 0);
  const totalAbsent   = filteredData.reduce((a, s) => a + s.absent,  0);
  const totalLeave    = filteredData.reduce((a, s) => a + s.leave,   0);
  const totalLate     = filteredData.reduce((a, s) => a + s.late,    0);
  const totalPossible = filteredData.reduce((a, s) => a + s.total,   0);
  const overallPct    = totalPossible
    ? ((totalPresent / totalPossible) * 100).toFixed(1)
    : 0;

  const topPerformers = [...filteredData].filter((s) => s.percent >= 90).sort((a, b) => b.percent - a.percent).slice(0, 5);
  const lowAttendance = [...filteredData].filter((s) => s.percent < 75 && s.total > 0).sort((a, b) => a.percent - b.percent).slice(0, 5);

  // ── Exports ────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Roll No","Name","Present","Absent","Leave","Late","Total","Attendance %"];
    const rows    = filteredData.map((s) => [s.rollNumber,`${s.firstName} ${s.lastName}`,s.present,s.absent,s.leave,s.late,s.total,s.percent]);
    const a       = document.createElement("a");
    a.href        = URL.createObjectURL(new Blob([[headers,...rows].map((r) => r.join(",")).join("\n")],{type:"text/csv"}));
    a.download    = "attendance_report.csv";
    a.click();
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map((s) => ({
      "Roll No": s.rollNumber, Name: `${s.firstName} ${s.lastName}`,
      Present: s.present, Absent: s.absent, Leave: s.leave, Late: s.late,
      Total: s.total, "Attendance %": s.percent,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "attendance_report.xlsx");
  };

  const statCards = [
    { label: "Overall",  value: `${overallPct}%`, icon: "📈", bg: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
    { label: "Present",  value: totalPresent,      icon: "✅", bg: "linear-gradient(135deg,#10b981,#34d399)" },
    { label: "Absent",   value: totalAbsent,       icon: "❌", bg: "linear-gradient(135deg,#ef4444,#f87171)" },
    { label: "Leave",    value: totalLeave,        icon: "🏖️", bg: "linear-gradient(135deg,#f59e0b,#fbbf24)" },
    { label: "Late",     value: totalLate,         icon: "⏰", bg: "linear-gradient(135deg,#3b82f6,#60a5fa)" },
  ];

  const months = ["01","02","03","04","05","06","07","08","09","10","11","12"];
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years = ["2024","2025","2026","2027"];

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth:1140, margin:"0 auto", padding:"32px 20px" }}>

        {/* Header Banner */}
        <div style={{ background:"linear-gradient(135deg,#0f172a,#1e1b4b,#312e81)", borderRadius:20, padding:"28px 32px", marginBottom:28, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-40, right:80, width:160, height:160, borderRadius:"50%", background:"rgba(99,102,241,0.25)", pointerEvents:"none" }} />
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.55)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Dashboard / Reports</div>
            <h1 style={{ fontSize:26, fontWeight:800, color:"#fff", margin:0 }}>Attendance Reports</h1>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginTop:4 }}>Monthly analytics and insights on student attendance</p>
          </div>
          <div style={{ display:"flex", gap:10, position:"relative" }}>
            {[
              { label:"CSV",   color:"#059669", bg:"#ecfdf5", border:"#6ee7b7", action:exportCSV   },
              { label:"Excel", color:"#16a34a", bg:"#dcfce7", border:"#86efac", action:exportExcel },
            ].map(({ label, color, bg, border, action }) => (
              <button key={label} onClick={action} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", background:bg, border:`1.5px solid ${border}`, borderRadius:10, color, fontWeight:600, fontSize:13, cursor:"pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:24 }}>
          {statCards.map(({ label, value, icon, bg }) => (
            <div key={label} style={{ background:bg, borderRadius:16, padding:"20px 22px", color:"#fff", boxShadow:"0 6px 24px rgba(0,0,0,0.13)" }}>
              <div style={{ fontSize:26, marginBottom:8 }}>{icon}</div>
              <div style={{ fontSize:30, fontWeight:800, lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:13, fontWeight:600, opacity:0.9, marginTop:4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background:"#fff", borderRadius:16, padding:"18px 24px", marginBottom:20, boxShadow:"0 1px 8px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>Filter Records</div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:10 }}>
            <input type="text" placeholder="🔍  Search name or roll no…" value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)} style={{ ...inputStyle, background:"#f8fafc" }} />
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={inputStyle}>
              <option value="">All Classes</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.section}</option>)}
            </select>
            <select value={month} onChange={(e) => setMonth(e.target.value)} style={inputStyle}>
              {months.map((m, i) => <option key={m} value={m}>{monthNames[i]}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} style={inputStyle}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Main Table */}
        <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", boxShadow:"0 1px 8px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0", marginBottom:24 }}>
          <div style={{ padding:"16px 24px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center", background:"linear-gradient(90deg,#fafbff,#f5f3ff)" }}>
            <span style={{ fontWeight:700, fontSize:15, color:"#1e293b" }}>Student Attendance</span>
            <span style={{ background:"#ede9fe", color:"#7c3aed", fontSize:12, fontWeight:600, padding:"3px 12px", borderRadius:99 }}>
              {filteredData.length} students
            </span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:"#f8fafc" }}>
                  {["Roll No","Student","Present","Absent","Leave","Late","Attendance"].map((h) => (
                    <th key={h} style={{ padding:"11px 16px", textAlign:"left", color:"#64748b", fontWeight:600, fontSize:11, letterSpacing:"0.05em", textTransform:"uppercase", borderBottom:"1px solid #e2e8f0", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding:48, textAlign:"center", color:"#94a3b8" }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>⏳</div>Loading records…
                  </td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding:48, textAlign:"center", color:"#94a3b8" }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>🔍</div>No records found
                  </td></tr>
                ) : (
                  filteredData.map((s, i) => {
                    const badge = getPctBadge(s.percent);
                    return (
                      <tr key={s._id} style={{ background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfc")}
                      >
                        <td style={{ padding:"12px 16px", borderBottom:"1px solid #f1f5f9" }}>
                          <code style={{ background:"#f1f5f9", padding:"2px 8px", borderRadius:6, fontSize:11, color:"#64748b" }}>{s.rollNumber || "—"}</code>
                        </td>
                        <td style={{ padding:"12px 16px", borderBottom:"1px solid #f1f5f9" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, background:avatarColors[i % avatarColors.length], display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:13 }}>
                              {s.firstName?.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight:600, color:"#1e293b" }}>{s.firstName} {s.lastName}</div>
                              <div style={{ fontSize:11, color:"#94a3b8" }}>Total: {s.total} days</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"12px 16px", borderBottom:"1px solid #f1f5f9", color:"#059669", fontWeight:700, fontSize:14 }}>{s.present}</td>
                        <td style={{ padding:"12px 16px", borderBottom:"1px solid #f1f5f9", color:"#dc2626", fontWeight:700, fontSize:14 }}>{s.absent}</td>
                        <td style={{ padding:"12px 16px", borderBottom:"1px solid #f1f5f9", color:"#d97706", fontWeight:700, fontSize:14 }}>{s.leave}</td>
                        <td style={{ padding:"12px 16px", borderBottom:"1px solid #f1f5f9", color:"#2563eb", fontWeight:700, fontSize:14 }}>{s.late}</td>
                        <td style={{ padding:"12px 16px", borderBottom:"1px solid #f1f5f9" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:56, height:6, background:"#e2e8f0", borderRadius:99, overflow:"hidden" }}>
                              <div style={{ width:`${s.percent}%`, height:"100%", background:getBarColor(s.percent), borderRadius:99 }} />
                            </div>
                            <span style={{ padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:badge.bg, color:badge.color }}>
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
        </div>

        {/* Top & Low */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          {/* Top Performers */}
          <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", boxShadow:"0 1px 8px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid #f1f5f9", background:"linear-gradient(90deg,#f0fdf4,#dcfce7)" }}>
              <span style={{ fontWeight:700, fontSize:14, color:"#065f46" }}>🏆 Top Performers ≥ 90%</span>
            </div>
            <div style={{ padding:"8px 0" }}>
              {topPerformers.length ? topPerformers.map((s, i) => (
                <div key={s._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 20px", borderBottom: i < topPerformers.length - 1 ? "1px solid #f1f5f9" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:avatarColors[i % avatarColors.length], display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:12 }}>
                      {s.firstName?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13, color:"#1e293b" }}>{s.firstName} {s.lastName}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>{s.rollNumber}</div>
                    </div>
                  </div>
                  <span style={{ background:"#d1fae5", color:"#065f46", padding:"4px 12px", borderRadius:99, fontWeight:700, fontSize:13 }}>{s.percent}%</span>
                </div>
              )) : (
                <div style={{ padding:"32px 20px", textAlign:"center", color:"#94a3b8", fontSize:13 }}>No students in top range</div>
              )}
            </div>
          </div>

          {/* Low Attendance */}
          <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", boxShadow:"0 1px 8px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0" }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid #f1f5f9", background:"linear-gradient(90deg,#fff1f2,#fee2e2)" }}>
              <span style={{ fontWeight:700, fontSize:14, color:"#991b1b" }}>⚠️ Low Attendance &lt; 75%</span>
            </div>
            <div style={{ padding:"8px 0" }}>
              {lowAttendance.length ? lowAttendance.map((s, i) => (
                <div key={s._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 20px", borderBottom: i < lowAttendance.length - 1 ? "1px solid #f1f5f9" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", color:"#ef4444", fontWeight:700, fontSize:12 }}>
                      {s.firstName?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13, color:"#1e293b" }}>{s.firstName} {s.lastName}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>{s.rollNumber}</div>
                    </div>
                  </div>
                  <span style={{ background:"#fee2e2", color:"#991b1b", padding:"4px 12px", borderRadius:99, fontWeight:700, fontSize:13 }}>{s.percent}%</span>
                </div>
              )) : (
                <div style={{ padding:"32px 20px", textAlign:"center", color:"#94a3b8", fontSize:13 }}>✓ All students have good attendance</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}