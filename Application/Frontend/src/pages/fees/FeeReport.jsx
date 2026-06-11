import { useState, useEffect } from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

// ---------- Dummy Data ----------
const generateReportsData = () => {
  const months = [
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
  ];
  const classes = ["9th", "10th", "11th", "12th"];
  const paymentMethods = [
    "Cash",
    "Bank Transfer",
    "Easypaisa",
    "JazzCash",
    "Cheque",
  ];
  return {
    monthlyCollection: months.map((m) => ({
      month: m,
      amount: 500000 + Math.random() * 300000,
    })),
    classWiseCollection: classes.map((c) => ({
      class: c,
      amount: 800000 + Math.random() * 400000,
    })),
    paymentDistribution: paymentMethods.map((m) => ({
      method: m,
      percentage: 10 + Math.random() * 30,
    })),
    pendingStudents: [
      {
        name: "Ali Raza",
        rollNo: "2024-001",
        class: "10th",
        amount: 5000,
        daysOverdue: 15,
      },
      {
        name: "Sana Khan",
        rollNo: "2024-002",
        class: "10th",
        amount: 7500,
        daysOverdue: 25,
      },
    ],
    overdueStudents: [
      {
        name: "Imran Ali",
        rollNo: "2024-003",
        class: "10th",
        amount: 10000,
        daysOverdue: 45,
      },
    ],
  };
};

// ---------- Stats Card ----------
const StatsCard = ({ label, value, bgColor, iconColor, icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100">
    <div className="p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
      <div
        className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}
      >
        <svg
          className={`w-5 h-5 ${iconColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={icon}
          />
        </svg>
      </div>
    </div>
  </div>
);

// ---------- Bar Chart Row ----------
const BarRow = ({ label, value, max, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="text-slate-500 text-xs">
        {Math.round(value / 1000)}k
      </span>
    </div>
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
);

export default function FeeReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-03-31");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setData(generateReportsData());
      setLoading(false);
    }, 500);
  }, []);

  const totalCollected = 2850000;
  const totalPending = 450000;
  const totalOverdue = 120000;
  const collectionRate = (
    (totalCollected / (totalCollected + totalPending)) *
    100
  ).toFixed(1);
  const currentMonthCollection = 620000;

  const exportCSV = () => alert("Export CSV");
  const exportExcel = () => alert("Export Excel");
  const exportPDF = () => alert("Export PDF");

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
        <p className="text-sm text-slate-500">
          Analytics and collection insights
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          label="Total Collected"
          value={`PKR ${totalCollected.toLocaleString()}`}
          bgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          label="Total Pending"
          value={`PKR ${totalPending.toLocaleString()}`}
          bgColor="bg-amber-100"
          iconColor="text-amber-600"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          label="Total Overdue"
          value={`PKR ${totalOverdue.toLocaleString()}`}
          bgColor="bg-red-100"
          iconColor="text-red-500"
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
        <StatsCard
          label="Collection Rate"
          value={`${collectionRate}%`}
          bgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
        <StatsCard
          label="Current Month"
          value={`PKR ${currentMonthCollection.toLocaleString()}`}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </div>

      {/* Filters + Exports */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Classes</option>
            {["9th", "10th", "11th", "12th"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            {["Paid", "Pending", "Overdue"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={exportCSV}
              title="CSV"
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <FaFileCsv className="text-slate-600 w-4 h-4" />
            </button>
            <button
              onClick={exportExcel}
              title="Excel"
              className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
            >
              <FaFileExcel className="text-emerald-600 w-4 h-4" />
            </button>
            <button
              onClick={exportPDF}
              title="PDF"
              className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
            >
              <FaFilePdf className="text-rose-600 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">
            Monthly Collection Trend
          </p>
          <div className="space-y-3">
            {data.monthlyCollection.map((m) => (
              <BarRow
                key={m.month}
                label={m.month}
                value={m.amount}
                max={900000}
                color="bg-indigo-500"
              />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">
            Class Wise Collection
          </p>
          <div className="space-y-3">
            {data.classWiseCollection.map((c) => (
              <BarRow
                key={c.class}
                label={`Class ${c.class}`}
                value={c.amount}
                max={1200000}
                color="bg-emerald-500"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Payment Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">
            Payment Method Distribution
          </p>
          <div className="space-y-3">
            {data.paymentDistribution.map((p) => (
              <div key={p.method}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">{p.method}</span>
                  <span className="text-slate-500 text-xs">
                    {Math.round(p.percentage)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Students */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <p className="text-sm font-semibold text-rose-600 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full inline-block"></span>
            Students With Overdue Dues
          </p>
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Name", "Roll No", "Amount", "Days Overdue"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.overdueStudents.map((s) => (
                  <tr
                    key={s.rollNo}
                    className="border-b border-slate-50 hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {s.name}
                    </td>
                    <td className="px-4 py-3">
                      <code className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs">
                        {s.rollNo}
                      </code>
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-600">
                      PKR {s.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {s.daysOverdue} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
