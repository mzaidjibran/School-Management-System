import { useState, useEffect } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { getAllFees, getPendingFees } from "../../api/Fee_Api.js";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ---------- Stats Card ----------
const StatsCard = ({ label, value, bgColor, iconColor, icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100">
    <div className="p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
    </div>
  </div>
);

// ---------- Bar Row ----------
const BarRow = ({ label, value, max, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="text-slate-500 text-xs">PKR {Math.round(value / 1000)}k</span>
    </div>
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: max > 0 ? `${(value / max) * 100}%` : "0%" }}
      />
    </div>
  </div>
);

export default function FeeReports() {
  const [allFees, setAllFees] = useState([]);
  const [pendingFees, setPendingFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-01-01`);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [allRes, pendingRes] = await Promise.all([getAllFees(), getPendingFees()]);
        setAllFees(allRes.data || []);
        setPendingFees(pendingRes.data || []);
      } catch (err) {
        setError("Data load karne mein error aayi: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ─── Date filter — sirf export ke liye ───────────────────────────
  const filteredFees = allFees.filter((f) => {
    const feeDate = new Date(f.dueDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateOk = feeDate >= start && feeDate <= end;
    const statusOk = !statusFilter || f.status === statusFilter;
    return dateOk && statusOk;
  });

  // ─── Stats — allFees se (date filter se independent) ─────────────
  const totalCollected = allFees
    .filter((f) => f.status === "paid")
    .reduce((s, f) => s + f.amount, 0);

  const totalPending = allFees
    .filter((f) => f.status === "pending" || f.status === "partial")
    .reduce((s, f) => s + (f.amount - f.paidAmount), 0);

  const totalOverdue = allFees
    .filter((f) => f.status === "overdue")
    .reduce((s, f) => s + (f.amount - f.paidAmount), 0);

  const collectionRate =
    totalCollected + totalPending + totalOverdue > 0
      ? ((totalCollected / (totalCollected + totalPending + totalOverdue)) * 100).toFixed(1)
      : "0.0";

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthCollection = allFees
    .filter((f) => f.month === currentMonth && f.status === "paid")
    .reduce((s, f) => s + f.amount, 0);

  // ─── Charts — allFees se ─────────────────────────────────────────
  const monthlyData = MONTHS_SHORT.map((m, i) => ({
    month: m,
    amount: allFees
      .filter((f) => f.month === i + 1 && f.status === "paid")
      .reduce((s, f) => s + f.amount, 0),
  }));
  const maxMonthly = Math.max(...monthlyData.map((m) => m.amount), 1);

  const feeTypeData = ["tuition", "admission", "exam", "library", "transport", "other"]
    .map((type) => ({
      type,
      amount: allFees
        .filter((f) => f.feeType === type && f.status === "paid")
        .reduce((s, f) => s + f.amount, 0),
    }))
    .filter((d) => d.amount > 0);
  const maxFeeType = Math.max(...feeTypeData.map((d) => d.amount), 1);

  // ─── Overdue students ─────────────────────────────────────────────
  const overdueStudents = pendingFees
    .filter((f) => f.status === "overdue")
    .map((f) => ({
      name: f.student ? `${f.student.firstName} ${f.student.lastName}` : "—",
      rollNo: f.student?.rollNumber || "—",
      amount: f.amount - f.paidAmount,
      daysOverdue: f.dueDate
        ? Math.floor((new Date() - new Date(f.dueDate)) / (1000 * 60 * 60 * 24))
        : 0,
    }));

  // ─── Exports (filteredFees use karo) ─────────────────────────────
  const exportCSV = () => {
    const headers = ["Student", "Roll No", "Fee Type", "Month", "Year", "Amount", "Paid", "Status"];
    const rows = filteredFees.map((f) => [
      f.student ? `${f.student.firstName} ${f.student.lastName}` : "—",
      f.student?.rollNumber || "—",
      f.feeType,
      f.month ? MONTHS_FULL[f.month - 1] : "—",
      f.year,
      f.amount,
      f.paidAmount,
      f.status,
    ]);
    saveAs(
      new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], { type: "text/csv" }),
      "fee_report.csv"
    );
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredFees.map((f) => ({
        Student: f.student ? `${f.student.firstName} ${f.student.lastName}` : "—",
        "Roll No": f.student?.rollNumber || "—",
        "Fee Type": f.feeType,
        Month: f.month ? MONTHS_FULL[f.month - 1] : "—",
        Year: f.year,
        Amount: f.amount,
        Paid: f.paidAmount,
        Status: f.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fee Report");
    XLSX.writeFile(wb, "fee_report.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Fee Report", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Student", "Roll No", "Fee Type", "Month", "Amount", "Paid", "Status"]],
      body: filteredFees.map((f) => [
        f.student ? `${f.student.firstName} ${f.student.lastName}` : "—",
        f.student?.rollNumber || "—",
        f.feeType,
        f.month ? MONTHS_FULL[f.month - 1] : "—",
        f.amount,
        f.paidAmount,
        f.status,
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("fee_report.pdf");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-400 text-sm">Loading reports...</p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-400 mb-1">Dashboard / Fee Reports</p>
        <h1 className="text-2xl font-bold text-slate-800">Fee Reports</h1>
        <p className="text-sm text-slate-500">Analytics and collection insights</p>
      </div>

      {error && (
        <p className="text-rose-500 text-sm bg-rose-50 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          label="Total Collected"
          value={`PKR ${totalCollected.toLocaleString()}`}
          bgColor="bg-emerald-100" iconColor="text-emerald-600"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          label="Total Pending"
          value={`PKR ${totalPending.toLocaleString()}`}
          bgColor="bg-amber-100" iconColor="text-amber-600"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          label="Total Overdue"
          value={`PKR ${totalOverdue.toLocaleString()}`}
          bgColor="bg-red-100" iconColor="text-red-500"
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
        <StatsCard
          label="Collection Rate"
          value={`${collectionRate}%`}
          bgColor="bg-indigo-100" iconColor="text-indigo-600"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
        <StatsCard
          label="Current Month"
          value={`PKR ${currentMonthCollection.toLocaleString()}`}
          bgColor="bg-blue-100" iconColor="text-blue-600"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </div>

      {/* Filters + Exports */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="date" value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date" value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            {["paid", "pending", "partial", "overdue"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="flex gap-2 ml-auto">
            <button onClick={exportCSV} title="CSV" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
              <FaFileCsv className="text-slate-600 w-4 h-4" />
            </button>
            <button onClick={exportExcel} title="Excel" className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">
              <FaFileExcel className="text-emerald-600 w-4 h-4" />
            </button>
            <button onClick={exportPDF} title="PDF" className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg transition">
              <FaFilePdf className="text-rose-600 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Monthly Collection Trend</p>
          <div className="space-y-3">
            {monthlyData.map((m) => (
              <BarRow key={m.month} label={m.month} value={m.amount} max={maxMonthly} color="bg-indigo-500" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Fee Type Wise Collection</p>
          {feeTypeData.length === 0 ? (
            <p className="text-slate-400 text-sm">Koi paid fee record nahi mila.</p>
          ) : (
            <div className="space-y-3">
              {feeTypeData.map((d) => (
                <BarRow
                  key={d.type}
                  label={d.type.charAt(0).toUpperCase() + d.type.slice(1)}
                  value={d.amount}
                  max={maxFeeType}
                  color="bg-emerald-500"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overdue Students */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <p className="text-sm font-semibold text-rose-600 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-rose-500 rounded-full inline-block"></span>
          Students With Overdue Dues
        </p>
        {overdueStudents.length === 0 ? (
          <p className="text-slate-400 text-sm">Koi overdue student nahi.</p>
        ) : (
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Name", "Roll No", "Amount Due", "Days Overdue"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdueStudents.map((s, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-700">{s.name}</td>
                    <td className="px-4 py-3">
                      <code className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs">{s.rollNo}</code>
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-600">PKR {s.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">{s.daysOverdue} days</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}