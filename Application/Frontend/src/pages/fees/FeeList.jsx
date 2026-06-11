import { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaEye,
  FaMoneyBillWave,
  FaPrint,
  FaEdit,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

// ---------- Dummy Data ----------
const generateFeeRecords = () => {
  const students = [
    {
      id: 1,
      rollNo: "2024-001",
      name: "Ali Raza",
      class: "10th",
      section: "A",
      photo: "https://ui-avatars.com/api/?background=6366f1&color=fff&name=Ali",
    },
    {
      id: 2,
      rollNo: "2024-002",
      name: "Sana Khan",
      class: "10th",
      section: "A",
      photo:
        "https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=Sana",
    },
    {
      id: 3,
      rollNo: "2024-003",
      name: "Imran Ali",
      class: "10th",
      section: "B",
      photo:
        "https://ui-avatars.com/api/?background=ec4899&color=fff&name=Imran",
    },
    {
      id: 4,
      rollNo: "2024-004",
      name: "Fatima Ahmed",
      class: "9th",
      section: "A",
      photo:
        "https://ui-avatars.com/api/?background=f59e0b&color=fff&name=Fatima",
    },
    {
      id: 5,
      rollNo: "2024-005",
      name: "Usman Chaudhry",
      class: "9th",
      section: "B",
      photo:
        "https://ui-avatars.com/api/?background=10b981&color=fff&name=Usman",
    },
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const statuses = ["Paid", "Partially Paid", "Unpaid", "Overdue"];
  const records = [];
  for (let i = 0; i < 30; i++) {
    const student = students[i % students.length];
    const totalFee = 5000 + Math.floor(Math.random() * 3000);
    const paidAmount = [totalFee, totalFee * 0.5, 0, totalFee * 0.3][i % 4];
    const status = statuses[i % 4];
    records.push({
      id: i + 1,
      studentId: student.id,
      rollNo: student.rollNo,
      studentName: student.name,
      class: student.class,
      section: student.section,
      month: months[i % 12],
      dueDate: new Date(2025, (i % 12) + 1, 15).toISOString().split("T")[0],
      totalFee,
      paidAmount,
      remainingAmount: totalFee - paidAmount,
      status,
      feeBreakdown: {
        tuition: 3000,
        admission: 500,
        transport: 1000,
        exam: 300,
        misc: 200,
      },
    });
  }
  return records;
};

// ---------- Status Badge ----------
const StatusBadge = ({ status }) => {
  const styles = {
    Paid: "bg-emerald-100 text-emerald-700",
    "Partially Paid": "bg-amber-100 text-amber-700",
    Unpaid: "bg-rose-100 text-rose-700",
    Overdue: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
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

// ---------- Floating Input ----------
const Input = ({ label, type = "text", name, value, onChange, disabled }) => {
  const isDate = type === "date";
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder=" "
        style={isDate && !value ? { color: "transparent" } : {}}
        onFocus={(e) => {
          if (isDate) e.target.style.color = "inherit";
        }}
        onBlur={(e) => {
          if (isDate && !value) e.target.style.color = "transparent";
        }}
        className="peer w-full px-3 pt-5 pb-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 outline-none transition-all text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
      />
      <label
        className={`absolute left-3 pointer-events-none transition-all duration-150
        ${value ? "top-1 text-[10px] text-indigo-500" : "top-3.5 text-sm text-slate-400"}
        peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-indigo-500`}
      >
        {label}
      </label>
    </div>
  );
};

// ---------- Floating Select (disabled = plain text) ----------
const SelectField = ({
  label,
  name,
  options = [],
  value,
  onChange,
  disabled,
}) => {
  if (disabled)
    return (
      <div className="relative">
        <div className="w-full px-3 pt-5 pb-1.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700 min-h-[44px]">
          {value || "—"}
        </div>
        <label className="absolute left-3 top-1 text-[10px] text-indigo-500 pointer-events-none">
          {label}
        </label>
      </div>
    );
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="peer w-full px-3 pt-5 pb-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 outline-none transition-all appearance-none text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      >
        <option value=""></option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <label
        className={`absolute left-3 pointer-events-none transition-all duration-150
        ${value ? "top-1 text-[10px] text-indigo-500" : "top-3.5 text-sm text-slate-400"}
        peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-indigo-500`}
      >
        {label}
      </label>
      <svg
        className="absolute right-2.5 top-4 w-3.5 h-3.5 text-slate-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
};

// ---------- View / Edit Modal ----------
const FeeRecordModal = ({ record, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const isView = mode === "view";

  useEffect(() => {
    if (record) setFormData({ ...record });
  }, [record]);

  if (!record || !formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]:
        name === "paidAmount" || name === "totalFee"
          ? parseFloat(value) || 0
          : value,
    };
    updated.remainingAmount = updated.totalFee - updated.paidAmount;
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    onSave(formData);
    onClose();
  };

  const InfoRow = ({ label, value, valueClass = "text-slate-700" }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">
            {isView ? "Fee Record Details" : "Edit Fee Record"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {isView ? (
            <div className="space-y-5">
              {/* Student Info */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Student
                </p>
                <div className="bg-slate-50 rounded-xl p-4">
                  <InfoRow label="Name" value={formData.studentName} />
                  <InfoRow label="Roll No" value={formData.rollNo} />
                  <InfoRow
                    label="Class"
                    value={`${formData.class} - ${formData.section}`}
                  />
                </div>
              </div>
              {/* Fee Details */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Fee Details
                </p>
                <div className="bg-slate-50 rounded-xl p-4">
                  <InfoRow label="Month" value={formData.month} />
                  <InfoRow label="Due Date" value={formData.dueDate} />
                  <InfoRow
                    label="Total Fee"
                    value={`PKR ${formData.totalFee.toLocaleString()}`}
                  />
                  <InfoRow
                    label="Paid Amount"
                    value={`PKR ${formData.paidAmount.toLocaleString()}`}
                    valueClass="text-emerald-600"
                  />
                  <InfoRow
                    label="Remaining"
                    value={`PKR ${formData.remainingAmount.toLocaleString()}`}
                    valueClass="text-rose-600"
                  />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-slate-400">Status</span>
                    <StatusBadge status={formData.status} />
                  </div>
                </div>
              </div>
              {/* Fee Breakdown */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Fee Breakdown
                </p>
                <div className="bg-slate-50 rounded-xl p-4">
                  {Object.entries(formData.feeBreakdown).map(([k, v]) => (
                    <InfoRow
                      key={k}
                      label={`${k.charAt(0).toUpperCase() + k.slice(1)} Fee`}
                      value={`PKR ${v.toLocaleString()}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              id="fee-edit-form"
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Student Name"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  disabled
                />
                <Input
                  label="Roll No"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleChange}
                  disabled
                />
                <Input
                  label="Class"
                  name="class"
                  value={`${formData.class} - ${formData.section}`}
                  disabled
                />
                <Input
                  label="Month"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  disabled
                />
                <Input
                  label="Due Date"
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
                <SelectField
                  label="Status"
                  name="status"
                  options={["Paid", "Partially Paid", "Unpaid", "Overdue"]}
                  value={formData.status}
                  onChange={handleChange}
                />
                <Input
                  label="Total Fee (PKR)"
                  type="number"
                  name="totalFee"
                  value={formData.totalFee}
                  onChange={handleChange}
                />
                <Input
                  label="Paid Amount (PKR)"
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                />
              </div>
              <div className="bg-slate-50 rounded-xl px-4 py-3 flex justify-between text-sm">
                <span className="text-slate-500">Remaining Amount</span>
                <span className="font-semibold text-rose-600">
                  PKR{" "}
                  {(formData.totalFee - formData.paidAmount).toLocaleString()}
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2.5">
          {isView ? (
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Close
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="fee-edit-form"
                disabled={isSaving}
                className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-60 flex items-center gap-1.5"
              >
                {isSaving && (
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                )}
                {isSaving ? "Saving..." : "Update Record"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Fee Slip Modal ----------
const FeeSlipModal = ({ record, onClose }) => {
  const printRef = useRef();
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      `<html><head><title>Fee Slip</title><style>body{font-family:Arial,sans-serif;padding:40px;}</style></head><body>${printRef.current.innerHTML}</body></html>`,
    );
    printWindow.document.close();
    printWindow.print();
  };
  if (!record) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Fee Slip</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6" ref={printRef}>
          <div className="text-center border-b border-slate-100 pb-4 mb-4">
            <div className="w-14 h-14 mx-auto bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2">
              P
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Punjab Public High School
            </h2>
            <p className="text-xs text-slate-400">
              123 Main Boulevard, Lahore | Ph: +92 42 1234567
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            {[
              ["Student Name", record.studentName],
              ["Roll Number", record.rollNo],
              ["Class", `${record.class} - ${record.section}`],
              ["Month", record.month],
              ["Due Date", record.dueDate],
              ["Status", record.status],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-slate-400">{k}: </span>
                <strong className="text-slate-700">{v}</strong>
              </div>
            ))}
          </div>
          <div className="border border-slate-100 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 border-b border-slate-100">
                    Fee Head
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 border-b border-slate-100">
                    Amount (PKR)
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(record.feeBreakdown).map(([key, val]) => (
                  <tr key={key} className="border-b border-slate-50">
                    <td className="px-4 py-2 text-slate-600 capitalize">
                      {key} Fee
                    </td>
                    <td className="px-4 py-2 text-right text-slate-600">
                      {val.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-slate-100 font-semibold">
                  <td className="px-4 py-2.5 text-slate-800">Total Fee</td>
                  <td className="px-4 py-2.5 text-right text-slate-800">
                    {record.totalFee.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b border-slate-50">
                  <td className="px-4 py-2 text-slate-600">Paid Amount</td>
                  <td className="px-4 py-2 text-right text-emerald-600 font-medium">
                    {record.paidAmount.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-600">Remaining</td>
                  <td className="px-4 py-2 text-right text-rose-600 font-medium">
                    {record.remainingAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-xs text-slate-400 text-center border-t border-slate-100 pt-3">
            Generated on: {new Date().toLocaleDateString()}
          </div>
          <div className="flex justify-between mt-3 text-xs text-slate-500">
            <span>Authorized Signature: __________________</span>
            <span>School Stamp</span>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-1.5"
          >
            <FaPrint className="w-3 h-3" /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Main Component ----------
export default function FeeRecords() {
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rollSearch, setRollSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const data = generateFeeRecords();
      setRecords(data);
      setFiltered(data);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let result = records;
    if (search)
      result = result.filter((r) =>
        r.studentName.toLowerCase().includes(search.toLowerCase()),
      );
    if (rollSearch)
      result = result.filter((r) => r.rollNo.includes(rollSearch));
    if (classFilter) result = result.filter((r) => r.class === classFilter);
    if (sectionFilter)
      result = result.filter((r) => r.section === sectionFilter);
    if (monthFilter) result = result.filter((r) => r.month === monthFilter);
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    setFiltered(result);
  }, [
    search,
    rollSearch,
    classFilter,
    sectionFilter,
    monthFilter,
    statusFilter,
    records,
  ]);

  const totalStudents = [...new Set(records.map((r) => r.studentId))].length;
  const totalGenerated = filtered.reduce((s, r) => s + r.totalFee, 0);
  const totalCollected = filtered.reduce((s, r) => s + r.paidAmount, 0);
  const totalPending = filtered.reduce((s, r) => s + r.remainingAmount, 0);
  const totalOverdue = filtered
    .filter((r) => r.status === "Overdue")
    .reduce((s, r) => s + r.remainingAmount, 0);

  const handleSaveRecord = (updated) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };
  const uniqueSections = [...new Set(records.map((r) => r.section))];
  const uniqueMonths = [...new Set(records.map((r) => r.month))];

  const exportCSV = () => {
    const headers = [
      "Roll No",
      "Student",
      "Class",
      "Section",
      "Month",
      "Due Date",
      "Total",
      "Paid",
      "Remaining",
      "Status",
    ];
    const rows = filtered.map((r) => [
      r.rollNo,
      r.studentName,
      r.class,
      r.section,
      r.month,
      r.dueDate,
      r.totalFee,
      r.paidAmount,
      r.remainingAmount,
      r.status,
    ]);
    saveAs(
      new Blob([[headers, ...rows].map((r) => r.join(",")).join("\n")], {
        type: "text/csv",
      }),
      "fee_records.csv",
    );
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((r) => ({
        "Roll No": r.rollNo,
        Student: r.studentName,
        Class: r.class,
        Section: r.section,
        Month: r.month,
        "Due Date": r.dueDate,
        Total: r.totalFee,
        Paid: r.paidAmount,
        Remaining: r.remainingAmount,
        Status: r.status,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fee Records");
    XLSX.writeFile(wb, "fee_records.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Fee Records", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Roll No",
          "Student",
          "Class",
          "Month",
          "Total",
          "Paid",
          "Remaining",
          "Status",
        ],
      ],
      body: filtered.map((r) => [
        r.rollNo,
        r.studentName,
        r.class,
        r.month,
        r.totalFee,
        r.paidAmount,
        r.remainingAmount,
        r.status,
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("fee_records.pdf");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-400 mb-1">Dashboard / Fee Records</p>
        <h1 className="text-2xl font-bold text-slate-800">Fee Records</h1>
        <p className="text-sm text-slate-500">
          View complete fee history and status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          label="Total Students"
          value={totalStudents}
          bgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
        <StatsCard
          label="Fee Generated"
          value={`PKR ${totalGenerated.toLocaleString()}`}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
          icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
        <StatsCard
          label="Fee Collected"
          value={`PKR ${totalCollected.toLocaleString()}`}
          bgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          label="Pending Fee"
          value={`PKR ${totalPending.toLocaleString()}`}
          bgColor="bg-amber-100"
          iconColor="text-amber-600"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatsCard
          label="Overdue Fee"
          value={`PKR ${totalOverdue.toLocaleString()}`}
          bgColor="bg-red-100"
          iconColor="text-red-500"
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </div>

      {/* Filters + Exports */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative min-w-[160px] flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <input
            type="text"
            placeholder="Roll number..."
            value={rollSearch}
            onChange={(e) => setRollSearch(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 min-w-[130px]"
          />
          {[
            {
              val: classFilter,
              set: setClassFilter,
              opts: [...new Set(records.map((r) => r.class))],
              placeholder: "All Classes",
            },
            {
              val: sectionFilter,
              set: setSectionFilter,
              opts: uniqueSections,
              placeholder: "All Sections",
            },
            {
              val: monthFilter,
              set: setMonthFilter,
              opts: uniqueMonths,
              placeholder: "All Months",
            },
            {
              val: statusFilter,
              set: setStatusFilter,
              opts: ["Paid", "Partially Paid", "Unpaid", "Overdue"],
              placeholder: "All Status",
            },
          ].map(({ val, set, opts, placeholder }) => (
            <select
              key={placeholder}
              value={val}
              onChange={(e) => set(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{placeholder}</option>
              {opts.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ))}
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="font-semibold text-slate-800 text-sm">
            Fee Records
          </span>
          <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">
            {filtered.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {[
                  "Roll No",
                  "Student",
                  "Class",
                  "Month",
                  "Due Date",
                  "Total (PKR)",
                  "Paid (PKR)",
                  "Remaining (PKR)",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
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
                    colSpan={10}
                    className="px-5 py-12 text-center text-slate-400 text-sm"
                  >
                    Loading fee records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-12 text-center text-slate-400 text-sm"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3.5">
                      <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                        {r.rollNo}
                      </code>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {r.studentName}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">
                        {r.class} - {r.section}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{r.month}</td>
                    <td className="px-4 py-3.5 text-slate-600">{r.dueDate}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      {r.totalFee.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-emerald-600">
                      {r.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-rose-600">
                      {r.remainingAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewRecord(r)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="View"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Collect Fee"
                        >
                          <FaMoneyBillWave className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="Print Slip"
                        >
                          <FaPrint className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditRecord(r)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-between text-xs text-slate-400">
            <span>
              Showing {filtered.length} of {records.length} records
            </span>
          </div>
        )}
      </div>

      <FeeSlipModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
      <FeeRecordModal
        record={viewRecord}
        mode="view"
        onClose={() => setViewRecord(null)}
        onSave={() => {}}
      />
      <FeeRecordModal
        record={editRecord}
        mode="edit"
        onClose={() => setEditRecord(null)}
        onSave={handleSaveRecord}
      />
    </div>
  );
}
