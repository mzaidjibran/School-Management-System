import { useState } from "react";
import { FaSearch, FaMoneyBillWave, FaPrint, FaSave } from "react-icons/fa";

// ---------- Floating Input ----------
const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  required,
  error,
}) => {
  const isDate = type === "date";
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        style={isDate && !value ? { color: "transparent" } : {}}
        onFocus={(e) => {
          if (isDate) e.target.style.color = "inherit";
        }}
        onBlur={(e) => {
          if (isDate && !value) e.target.style.color = "transparent";
        }}
        className={`peer w-full px-4 pt-5 pb-2 border rounded-xl bg-white text-slate-800 outline-none transition-all text-sm
          ${error ? "border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"}
          focus:ring-2`}
      />
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-200 text-slate-400
        ${value ? "top-1.5 text-[10px] text-indigo-600" : "top-3.5 text-sm"}
        peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-indigo-600`}
      >
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// ---------- Floating Select ----------
const Select = ({ label, name, options = [], value, onChange, required }) => (
  <div className="relative">
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="peer w-full px-4 pt-5 pb-2 border border-slate-200 rounded-xl bg-white text-slate-800 outline-none transition-all appearance-none text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    >
      <option value=""></option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
    <label
      className={`absolute left-4 pointer-events-none transition-all duration-200 text-slate-400
      ${value ? "top-1.5 text-[10px] text-indigo-600" : "top-3.5 text-sm"}
      peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-indigo-600`}
    >
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    <svg
      className="absolute right-3 top-4 w-4 h-4 text-slate-400 pointer-events-none"
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

const dummyStudents = [
  {
    id: 1,
    rollNo: "2024-001",
    name: "Ali Raza",
    class: "10th",
    section: "A",
    photo: "https://ui-avatars.com/api/?background=6366f1&color=fff&name=Ali",
    currentMonthFee: 5000,
    previousDues: 0,
    fine: 0,
    discount: 0,
  },
  {
    id: 2,
    rollNo: "2024-002",
    name: "Sana Khan",
    class: "10th",
    section: "A",
    photo: "https://ui-avatars.com/api/?background=8b5cf6&color=fff&name=Sana",
    currentMonthFee: 5000,
    previousDues: 2000,
    fine: 500,
    discount: 0,
  },
  {
    id: 3,
    rollNo: "2024-003",
    name: "Imran Ali",
    class: "10th",
    section: "B",
    photo: "https://ui-avatars.com/api/?background=ec4899&color=fff&name=Imran",
    currentMonthFee: 5000,
    previousDues: 0,
    fine: 0,
    discount: 1000,
  },
];

// ---------- Receipt Modal ----------
const ReceiptModal = ({ receiptData, onClose }) => {
  if (!receiptData) return null;
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      `<html><head><title>Receipt</title><style>body{font-family:Arial,sans-serif;padding:40px;}</style></head><body>${document.getElementById("receipt-content").innerHTML}</body></html>`,
    );
    printWindow.document.close();
    printWindow.print();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">
            Payment Receipt
          </h3>
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
        <div className="overflow-y-auto flex-1 p-6" id="receipt-content">
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
          <div className="grid grid-cols-2 gap-2 mb-5 text-sm">
            {[
              ["Receipt No", receiptData.receiptNo],
              ["Date", receiptData.date],
              ["Student", receiptData.studentName],
              ["Roll No", receiptData.rollNo],
              ["Class", receiptData.class],
              ["Payment Method", receiptData.paymentMethod],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-slate-400">{k}: </span>
                <strong className="text-slate-700">{v}</strong>
              </div>
            ))}
          </div>
          <div className="border border-slate-100 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm">
              <tbody>
                {[
                  [
                    "Total Payable",
                    receiptData.totalPayable.toLocaleString(),
                    "text-slate-700",
                  ],
                  [
                    "Amount Received",
                    receiptData.amountReceived.toLocaleString(),
                    "text-emerald-600",
                  ],
                  [
                    "Remaining Balance",
                    receiptData.remainingBalance.toLocaleString(),
                    "text-rose-600",
                  ],
                ].map(([k, v, c]) => (
                  <tr key={k} className="border-b border-slate-50">
                    <td className="px-4 py-2.5 text-slate-600 font-medium">
                      {k}
                    </td>
                    <td className={`px-4 py-2.5 text-right font-semibold ${c}`}>
                      PKR {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-slate-400 border-t border-slate-100 pt-3">
            Thank you for your payment!
          </p>
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

// ---------- Main ----------
export default function CollectFee() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("roll");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    amountReceived: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Cash",
    discount: "",
    fine: "",
    remarks: "",
  });
  const [receipt, setReceipt] = useState(null);

  const handleSearch = () => {
    const student = dummyStudents.find((s) =>
      searchType === "roll"
        ? s.rollNo === searchQuery.trim()
        : s.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (student) {
      setSelectedStudent(student);
      setNotFound(false);
      setForm((prev) => ({
        ...prev,
        amountReceived:
          student.currentMonthFee +
          student.previousDues +
          student.fine -
          student.discount,
      }));
    } else {
      setSelectedStudent(null);
      setNotFound(true);
    }
  };

  const totalPayable = selectedStudent
    ? selectedStudent.currentMonthFee +
      selectedStudent.previousDues +
      (parseInt(form.fine) || 0) -
      (parseInt(form.discount) || 0)
    : 0;
  const amountReceived = parseInt(form.amountReceived) || 0;
  const remaining = totalPayable - amountReceived;

  const generateReceipt = () => {
    setReceipt({
      receiptNo: `RCP-${Date.now()}`,
      date: form.paymentDate,
      studentName: selectedStudent.name,
      rollNo: selectedStudent.rollNo,
      class: `${selectedStudent.class} - ${selectedStudent.section}`,
      paymentMethod: form.paymentMethod,
      totalPayable,
      amountReceived,
      remainingBalance: remaining,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-400 mb-1">Dashboard / Collect Fee</p>
        <h1 className="text-2xl font-bold text-slate-800">Collect Fee</h1>
        <p className="text-sm text-slate-500">
          Quick fee collection with receipt generation
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Find Student
        </p>
        <div className="flex gap-3 flex-wrap">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="roll">Roll Number</option>
            <option value="name">Student Name</option>
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder={
                searchType === "roll"
                  ? "Enter Roll Number..."
                  : "Enter Student Name..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-2"
          >
            <FaSearch className="w-3.5 h-3.5" /> Search
          </button>
        </div>
        {notFound && (
          <p className="text-rose-500 text-sm mt-3">
            No student found. Please check the{" "}
            {searchType === "roll" ? "roll number" : "name"}.
          </p>
        )}
      </div>

      {/* Student + Form */}
      {selectedStudent && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Student Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Student Details
            </p>
            <div className="flex items-center gap-4 mb-5">
              <img
                src={selectedStudent.photo}
                alt={selectedStudent.name}
                className="w-14 h-14 rounded-full ring-2 ring-slate-200"
              />
              <div>
                <h3 className="font-bold text-slate-800">
                  {selectedStudent.name}
                </h3>
                <p className="text-sm text-slate-500">
                  Roll No: {selectedStudent.rollNo}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedStudent.class} — Section {selectedStudent.section}
                </p>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                [
                  "Current Month Fee",
                  `PKR ${selectedStudent.currentMonthFee.toLocaleString()}`,
                  "text-slate-700",
                ],
                [
                  "Previous Dues",
                  `PKR ${selectedStudent.previousDues.toLocaleString()}`,
                  "text-rose-600",
                ],
                ["Fine", `PKR ${parseInt(form.fine) || 0}`, "text-amber-600"],
                [
                  "Discount",
                  `- PKR ${parseInt(form.discount) || 0}`,
                  "text-emerald-600",
                ],
              ].map(([k, v, c]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-500">{k}</span>
                  <span className={`font-medium ${c}`}>{v}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-slate-800 border-t border-slate-100 pt-2.5">
                <span>Total Payable</span>
                <span>PKR {totalPayable.toLocaleString()}</span>
              </div>
              {amountReceived > 0 && (
                <div
                  className={`flex justify-between font-semibold pt-1 ${remaining > 0 ? "text-rose-600" : "text-emerald-600"}`}
                >
                  <span>{remaining > 0 ? "Remaining Balance" : "Change"}</span>
                  <span>PKR {Math.abs(remaining).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Payment Details
            </p>
            <div className="space-y-4">
              <Input
                label="Amount Received (PKR)"
                type="number"
                name="amountReceived"
                value={form.amountReceived}
                onChange={(e) =>
                  setForm({ ...form, amountReceived: e.target.value })
                }
                required
              />
              <Input
                label="Payment Date"
                type="date"
                name="paymentDate"
                value={form.paymentDate}
                onChange={(e) =>
                  setForm({ ...form, paymentDate: e.target.value })
                }
                required
              />
              <Select
                label="Payment Method"
                name="paymentMethod"
                options={[
                  "Cash",
                  "Bank Transfer",
                  "Easypaisa",
                  "JazzCash",
                  "Cheque",
                ]}
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm({ ...form, paymentMethod: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Discount (PKR)"
                  type="number"
                  name="discount"
                  value={form.discount}
                  onChange={(e) =>
                    setForm({ ...form, discount: e.target.value })
                  }
                />
                <Input
                  label="Fine (PKR)"
                  type="number"
                  name="fine"
                  value={form.fine}
                  onChange={(e) => setForm({ ...form, fine: e.target.value })}
                />
              </div>
              <div className="relative">
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={(e) =>
                    setForm({ ...form, remarks: e.target.value })
                  }
                  rows={2}
                  placeholder="Remarks (optional)..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={generateReceipt}
                  className="px-5 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center gap-2"
                >
                  <FaMoneyBillWave className="w-3.5 h-3.5" /> Collect Fee
                </button>
                <button
                  onClick={generateReceipt}
                  className="px-5 py-2.5 text-sm border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl transition flex items-center gap-2"
                >
                  <FaSave className="w-3.5 h-3.5" /> Save & Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {receipt && (
        <ReceiptModal receiptData={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
}
