import { useState, useEffect, useRef } from "react";
import {
  FaSearch, FaEye, FaMoneyBillWave, FaPrint, FaEdit,
  FaFileCsv, FaFileExcel, FaFilePdf,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { getAllFees, updateFee, payFee } from "../../api/Fee_Api.js";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Status from backend (pending/partial/paid/overdue) ko display label mein convert karo
const statusLabel = (s) => {
  if (s === "paid") return "Paid";
  if (s === "partial") return "Partially Paid";
  if (s === "overdue") return "Overdue";
  return "Unpaid";
};

// ---------- Status Badge ----------
const StatusBadge = ({ status }) => {
  const styles = {
    paid: "bg-emerald-100 text-emerald-700",
    partial: "bg-amber-100 text-amber-700",
    pending: "bg-rose-100 text-rose-700",
    overdue: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {statusLabel(status)}
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
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
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
        type={type} name={name} value={value} onChange={onChange} disabled={disabled} placeholder=" "
        style={isDate && !value ? { color: "transparent" } : {}}
        onFocus={(e) => { if (isDate) e.target.style.color = "inherit"; }}
        onBlur={(e) => { if (isDate && !value) e.target.style.color = "transparent"; }}
        className="peer w-full px-3 pt-5 pb-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 outline-none transition-all text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
      />
      <label className={`absolute left-3 pointer-events-none transition-all duration-150
        ${value ? "top-1 text-[10px] text-indigo-500" : "top-3.5 text-sm text-slate-400"}
        peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-indigo-500`}>
        {label}
      </label>
    </div>
  );
};

const SelectField = ({ label, name, options = [], value, onChange, disabled }) => {
  if (disabled) return (
    <div className="relative">
      <div className="w-full px-3 pt-5 pb-1.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700 min-h-[44px]">{value || "—"}</div>
      <label className="absolute left-3 top-1 text-[10px] text-indigo-500 pointer-events-none">{label}</label>
    </div>
  );
  return (
    <div className="relative">
      <select name={name} value={value} onChange={onChange}
        className="peer w-full px-3 pt-5 pb-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 outline-none transition-all appearance-none text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
        <option value=""></option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <label className={`absolute left-3 pointer-events-none transition-all duration-150
        ${value ? "top-1 text-[10px] text-indigo-500" : "top-3.5 text-sm text-slate-400"}
        peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-indigo-500`}>{label}</label>
      <svg className="absolute right-2.5 top-4 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
};

// ---------- View / Edit Modal ----------
const FeeRecordModal = ({ record, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const isView = mode === "view";

  useEffect(() => {
    if (record) setFormData({ ...record });
  }, [record]);

  if (!record || !formData) return null;

  const studentName = record.student
    ? `${record.student.firstName} ${record.student.lastName}`
    : "—";
  const rollNo = record.student?.rollNumber || "—";

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...formData,
      [name]: name === "paidAmount" || name === "amount" ? parseFloat(value) || 0 : value,
    };
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const res = await updateFee(formData._id, {
        status: formData.status,
        dueDate: formData.dueDate,
        amount: formData.amount,
        paidAmount: formData.paidAmount,
        remarks: formData.remarks,
      });
      onSave(res.data);
      onClose();
    } catch (err) {
      setError(err.message || "Update karne mein error aayi.");
    } finally {
      setIsSaving(false);
    }
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">{isView ? "Fee Record Details" : "Edit Fee Record"}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {isView ? (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Student</p>
                <div className="bg-slate-50 rounded-xl p-4">
                  <InfoRow label="Name" value={studentName} />
                  <InfoRow label="Roll No" value={rollNo} />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Fee Details</p>
                <div className="bg-slate-50 rounded-xl p-4">
                  <InfoRow label="Fee Type" value={formData.feeType} />
                  <InfoRow label="Month/Year" value={`${formData.month ? MONTHS[formData.month - 1] : "—"} / ${formData.year}`} />
                  <InfoRow label="Due Date" value={formData.dueDate?.split("T")[0] || "—"} />
                  <InfoRow label="Total Fee" value={`PKR ${formData.amount?.toLocaleString()}`} />
                  <InfoRow label="Paid Amount" value={`PKR ${formData.paidAmount?.toLocaleString()}`} valueClass="text-emerald-600" />
                  <InfoRow label="Remaining" value={`PKR ${(formData.amount - formData.paidAmount).toLocaleString()}`} valueClass="text-rose-600" />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-slate-400">Status</span>
                    <StatusBadge status={formData.status} />
                  </div>
                  {formData.receiptNumber && <InfoRow label="Receipt No" value={formData.receiptNumber} />}
                  {formData.remarks && <InfoRow label="Remarks" value={formData.remarks} />}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="fee-edit-form" className="space-y-4">
              {error && <p className="text-rose-500 text-xs bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <Input label="Student Name" value={studentName} disabled />
                <Input label="Roll No" value={rollNo} disabled />
                <Input label="Fee Type" value={formData.feeType} disabled />
                <Input label="Month/Year" value={`${formData.month ? MONTHS[formData.month - 1] : "—"} / ${formData.year}`} disabled />
                <Input label="Due Date" type="date" name="dueDate" value={formData.dueDate?.split("T")[0] || ""} onChange={handleChange} />
                <SelectField label="Status" name="status" options={["pending", "partial", "paid", "overdue"]} value={formData.status} onChange={handleChange} />
                <Input label="Total Fee (PKR)" type="number" name="amount" value={formData.amount} onChange={handleChange} />
                <Input label="Paid Amount (PKR)" type="number" name="paidAmount" value={formData.paidAmount} onChange={handleChange} />
              </div>
              <div className="bg-slate-50 rounded-xl px-4 py-3 flex justify-between text-sm">
                <span className="text-slate-500">Remaining Amount</span>
                <span className="font-semibold text-rose-600">PKR {(formData.amount - formData.paidAmount).toLocaleString()}</span>
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2.5">
          {isView ? (
            <button onClick={onClose} className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">Close</button>
          ) : (
            <>
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" form="fee-edit-form" disabled={isSaving}
                className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-60 flex items-center gap-1.5">
                {isSaving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
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
  if (!record) return null;

  const studentName = record.student ? `${record.student.firstName} ${record.student.lastName}` : "—";
  const rollNo = record.student?.rollNumber || "—";
  const remaining = record.amount - record.paidAmount;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<html><head><title>Fee Slip</title><style>body{font-family:Arial,sans-serif;padding:40px;}</style></head><body>${printRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Fee Slip</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6" ref={printRef}>
          <div className="text-center border-b border-slate-100 pb-4 mb-4">
            <div className="w-14 h-14 mx-auto bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2">P</div>
            <h2 className="text-lg font-bold text-slate-800">Punjab Public High School</h2>
            <p className="text-xs text-slate-400">123 Main Boulevard, Lahore | Ph: +92 42 1234567</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            {[
              ["Student Name", studentName],
              ["Roll Number", rollNo],
              ["Fee Type", record.feeType],
              ["Month", record.month ? MONTHS[record.month - 1] : "—"],
              ["Year", record.year],
              ["Due Date", record.dueDate?.split("T")[0] || "—"],
              ["Status", statusLabel(record.status)],
              ["Receipt No", record.receiptNumber || "—"],
            ].map(([k, v]) => (
              <div key={k}><span className="text-slate-400">{k}: </span><strong className="text-slate-700">{v}</strong></div>
            ))}
          </div>
          <div className="border border-slate-100 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Fee Head</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-50">
                  <td className="px-4 py-2 text-slate-600 capitalize">{record.feeType} Fee</td>
                  <td className="px-4 py-2 text-right text-slate-600">{record.amount?.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-slate-100 font-semibold">
                  <td className="px-4 py-2.5 text-slate-800">Total Fee</td>
                  <td className="px-4 py-2.5 text-right text-slate-800">{record.amount?.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-slate-50">
                  <td className="px-4 py-2 text-slate-600">Paid Amount</td>
                  <td className="px-4 py-2 text-right text-emerald-600 font-medium">{record.paidAmount?.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-slate-600">Remaining</td>
                  <td className="px-4 py-2 text-right text-rose-600 font-medium">{remaining?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-xs text-slate-400 text-center border-t border-slate-100 pt-3">Generated on: {new Date().toLocaleDateString()}</div>
          <div className="flex justify-between mt-3 text-xs text-slate-500">
            <span>Authorized Signature: __________________</span>
            <span>School Stamp</span>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2.5">
          <button onClick={onClose} className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition">Close</button>
          <button onClick={handlePrint} className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center gap-1.5">
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
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [rollSearch, setRollSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);

  const fetchFees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllFees();
      setRecords(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      setError("Fees load karne mein error aayi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFees(); }, []);

  useEffect(() => {
    let result = records;
    if (search) result = result.filter((r) => {
      const name = r.student ? `${r.student.firstName} ${r.student.lastName}` : "";
      return name.toLowerCase().includes(search.toLowerCase());
    });
    if (rollSearch) result = result.filter((r) => r.student?.rollNumber?.includes(rollSearch));
    if (monthFilter) result = result.filter((r) => r.month === Number(monthFilter));
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    setFiltered(result);
  }, [search, rollSearch, monthFilter, statusFilter, records]);

  // Stats
  const totalStudents = [...new Set(records.map((r) => r.student?._id))].filter(Boolean).length;
  const totalGenerated = filtered.reduce((s, r) => s + (r.amount || 0), 0);
  const totalCollected = filtered.reduce((s, r) => s + (r.paidAmount || 0), 0);
  const totalPending = filtered.reduce((s, r) => s + (r.amount - r.paidAmount || 0), 0);
  const totalOverdue = filtered.filter((r) => r.status === "overdue").reduce((s, r) => s + (r.amount - r.paidAmount), 0);

  const handleSaveRecord = (updated) => {
    setRecords((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  };

  const exportCSV = () => {
    const headers = ["Roll No", "Student", "Fee Type", "Month", "Year", "Due Date", "Total", "Paid", "Remaining", "Status"];
    const rows = filtered.map((r) => [
      r.student?.rollNumber || "—",
      r.student ? `${r.student.firstName} ${r.student.lastName}` : "—",
      r.feeType,
      r.month ? MONTHS[r.month - 1] : "—",
      r.year,
      r.dueDate?.split("T")[0] || "—",
      r.amount,
      r.paidAmount,
      r.amount - r.paidAmount,
      statusLabel(r.status),
    ]);
    saveAs(new Blob([[headers, ...rows].map((row) => row.join(",")).join("\n")], { type: "text/csv" }), "fee_records.csv");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map((r) => ({
      "Roll No": r.student?.rollNumber || "—",
      "Student": r.student ? `${r.student.firstName} ${r.student.lastName}` : "—",
      "Fee Type": r.feeType,
      "Month": r.month ? MONTHS[r.month - 1] : "—",
      "Year": r.year,
      "Due Date": r.dueDate?.split("T")[0] || "—",
      "Total": r.amount,
      "Paid": r.paidAmount,
      "Remaining": r.amount - r.paidAmount,
      "Status": statusLabel(r.status),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fee Records");
    XLSX.writeFile(wb, "fee_records.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Fee Records", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Roll No", "Student", "Fee Type", "Month", "Total", "Paid", "Remaining", "Status"]],
      body: filtered.map((r) => [
        r.student?.rollNumber || "—",
        r.student ? `${r.student.firstName} ${r.student.lastName}` : "—",
        r.feeType,
        r.month ? MONTHS[r.month - 1] : "—",
        r.amount,
        r.paidAmount,
        r.amount - r.paidAmount,
        statusLabel(r.status),
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save("fee_records.pdf");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-slate-400 mb-1">Dashboard / Fee Records</p>
        <h1 className="text-2xl font-bold text-slate-800">Fee Records</h1>
        <p className="text-sm text-slate-500">View complete fee history and status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard label="Total Students" value={totalStudents} bgColor="bg-indigo-100" iconColor="text-indigo-600" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        <StatsCard label="Fee Generated" value={`PKR ${totalGenerated.toLocaleString()}`} bgColor="bg-blue-100" iconColor="text-blue-600" icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <StatsCard label="Fee Collected" value={`PKR ${totalCollected.toLocaleString()}`} bgColor="bg-emerald-100" iconColor="text-emerald-600" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatsCard label="Pending Fee" value={`PKR ${totalPending.toLocaleString()}`} bgColor="bg-amber-100" iconColor="text-amber-600" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatsCard label="Overdue Fee" value={`PKR ${totalOverdue.toLocaleString()}`} bgColor="bg-red-100" iconColor="text-red-500" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative min-w-[160px] flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input type="text" placeholder="Search student..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <input type="text" placeholder="Roll number..." value={rollSearch} onChange={(e) => setRollSearch(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 min-w-[130px]" />
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Months</option>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Status</option>
            {["paid", "partial", "pending", "overdue"].map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
          <div className="flex gap-2 ml-auto">
            <button onClick={exportCSV} title="CSV" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"><FaFileCsv className="text-slate-600 w-4 h-4" /></button>
            <button onClick={exportExcel} title="Excel" className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"><FaFileExcel className="text-emerald-600 w-4 h-4" /></button>
            <button onClick={exportPDF} title="PDF" className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg transition"><FaFilePdf className="text-rose-600 w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="font-semibold text-slate-800 text-sm">Fee Records</span>
          <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">{filtered.length} records</span>
        </div>
        {error && <p className="text-rose-500 text-sm px-5 py-3 bg-rose-50">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Roll No", "Student", "Fee Type", "Month/Year", "Due Date", "Total (PKR)", "Paid (PKR)", "Remaining (PKR)", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-5 py-12 text-center text-slate-400 text-sm">Loading fee records...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-5 py-12 text-center text-slate-400 text-sm">No records found</td></tr>
              ) : (
                filtered.map((r) => {
                  const name = r.student ? `${r.student.firstName} ${r.student.lastName}` : "—";
                  const remaining = r.amount - r.paidAmount;
                  return (
                    <tr key={r._id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5">
                        <code className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{r.student?.rollNumber || "—"}</code>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">{name}</td>
                      <td className="px-4 py-3.5 capitalize text-slate-600">{r.feeType}</td>
                      <td className="px-4 py-3.5 text-slate-600">{r.month ? MONTHS[r.month - 1] : "—"} / {r.year}</td>
                      <td className="px-4 py-3.5 text-slate-600">{r.dueDate?.split("T")[0] || "—"}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">{r.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3.5 font-medium text-emerald-600">{r.paidAmount?.toLocaleString()}</td>
                      <td className="px-4 py-3.5 font-medium text-rose-600">{remaining?.toLocaleString()}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setViewRecord(r)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="View"><FaEye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setSelectedRecord(r)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Print Slip"><FaPrint className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditRecord(r)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit"><FaEdit className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-between text-xs text-slate-400">
            <span>Showing {filtered.length} of {records.length} records</span>
          </div>
        )}
      </div>

      <FeeSlipModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      <FeeRecordModal record={viewRecord} mode="view" onClose={() => setViewRecord(null)} onSave={() => {}} />
      <FeeRecordModal record={editRecord} mode="edit" onClose={() => setEditRecord(null)} onSave={handleSaveRecord} />
    </div>
  );
}