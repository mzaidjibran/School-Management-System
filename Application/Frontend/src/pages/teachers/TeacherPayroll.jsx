import { useState, useEffect } from "react";
import { CreditCard, Search, Wallet, CheckCircle, Clock, FileText, Loader2, AlertCircle, Save, Calendar, ArrowRight } from "lucide-react";
import { getAllTeachers } from "../../api/Teacher_Api.js";
import { getHeaders } from "../../api/Api_Helper.js";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function TeacherPayroll() {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  
  // Interactive inputs for unpaid teachers
  const [rates, setRates] = useState({});
  const [bases, setBases] = useState({});
  const [units, setUnits] = useState({});
  const [allowances, setAllowances] = useState({});
  const [deductions, setDeductions] = useState({});
  const [savingSettings, setSavingSettings] = useState({});

  // Paid records loaded from database history
  const [paidRecords, setPaidRecords] = useState({});
  const [paying, setPaying] = useState({});

  // Set default cycle to current month (e.g. "2026-07")
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${yyyy}-${mm}`);
  }, []);

  // Format month for query & display (e.g., "2026-07" -> "July 2026")
  const getFormattedMonthName = (yyyyMm) => {
    if (!yyyyMm) return "";
    const [year, month] = yyyyMm.split("-");
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  const currentMonthName = getFormattedMonthName(selectedMonth);

  // Fetch staff list & payroll history
  const loadPayrollCycle = async () => {
    if (!selectedMonth) return;
    setLoading(true);
    try {
      // 1. Fetch active teachers
      const teachersRes = await getAllTeachers();
      const list = (teachersRes.data || []).filter(t => t.status === "active" || t.status === "Active" || !t.status);
      setTeachers(list);

      // 2. Fetch paid history records from Mongoose
      const historyRes = await fetch(`${API_BASE}/api/payroll/history?month=${currentMonthName}`, {
        method: "GET",
        headers: getHeaders(),
      });
      const historyData = await historyRes.json();
      const records = historyData.data || [];

      // Create history records map
      const paidMap = {};
      records.forEach(r => {
        if (r.teacher) {
          paidMap[r.teacher._id] = r;
        }
      });
      setPaidRecords(paidMap);

      // Initialize inputs with teacher base defaults or paid history
      const initialRates = {};
      const initialBases = {};
      const initialUnits = {};
      const initialAllowances = {};
      const initialDeductions = {};

      list.forEach(t => {
        const paidRec = paidMap[t._id];
        if (paidRec) {
          // Locked to paid details
          initialRates[t._id] = paidRec.rate;
          initialBases[t._id] = paidRec.salaryBasis;
          initialUnits[t._id] = paidRec.units;
          initialAllowances[t._id] = paidRec.allowance;
          initialDeductions[t._id] = paidRec.deduction;
        } else {
          // Defaults from teacher profile
          initialRates[t._id] = t.salary || 0;
          initialBases[t._id] = t.salaryBasis || "monthly";
          // Default units based on basis
          if (t.salaryBasis === "daily") {
            initialUnits[t._id] = 22; // default work days
          } else if (t.salaryBasis === "weekly") {
            initialUnits[t._id] = 4; // default weeks
          } else {
            initialUnits[t._id] = 1; // default month
          }
          initialAllowances[t._id] = 0;
          initialDeductions[t._id] = 0;
        }
      });

      setRates(initialRates);
      setBases(initialBases);
      setUnits(initialUnits);
      setAllowances(initialAllowances);
      setDeductions(initialDeductions);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load payroll cycle: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrollCycle();
  }, [selectedMonth]);

  // Handle rate/basis change
  const handleRateChange = (teacherId, val) => {
    setRates(prev => ({ ...prev, [teacherId]: parseFloat(val) || 0 }));
  };

  const handleBasisChange = (teacherId, basis) => {
    setBases(prev => ({ ...prev, [teacherId]: basis }));
    // Update default units automatically when basis is changed
    setUnits(prev => {
      let defaultUnits = 1;
      if (basis === "daily") defaultUnits = 22;
      else if (basis === "weekly") defaultUnits = 4;
      return { ...prev, [teacherId]: defaultUnits };
    });
  };

  const handleUnitsChange = (teacherId, val) => {
    setUnits(prev => ({ ...prev, [teacherId]: parseFloat(val) || 0 }));
  };

  const handleAllowanceChange = (teacherId, val) => {
    setAllowances(prev => ({ ...prev, [teacherId]: parseFloat(val) || 0 }));
  };

  const handleDeductionChange = (teacherId, val) => {
    setDeductions(prev => ({ ...prev, [teacherId]: parseFloat(val) || 0 }));
  };

  // Save base salary configurations permanently to Teacher database document
  const handleSaveBaseSettings = async (teacherId) => {
    setSavingSettings(prev => ({ ...prev, [teacherId]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/payroll/teacher-salary`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          teacherId,
          salary: rates[teacherId] || 0,
          salaryBasis: bases[teacherId] || "monthly",
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update teacher settings");
      toast.success("Base salary settings saved to teacher profile!");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to save settings");
    } finally {
      setSavingSettings(prev => ({ ...prev, [teacherId]: false }));
    }
  };

  // Submit payment to Mongoose database
  const handlePaySalary = async (teacherId, teacherName, netPay) => {
    setPaying(prev => ({ ...prev, [teacherId]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/payroll/pay`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          teacherId,
          month: currentMonthName,
          salaryBasis: bases[teacherId] || "monthly",
          rate: rates[teacherId] || 0,
          units: units[teacherId] || 1,
          allowance: allowances[teacherId] || 0,
          deduction: deductions[teacherId] || 0,
          netSalary: netPay,
          status: "paid"
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to process payment");
      toast.success(`Successfully paid salary of PKR ${netPay.toLocaleString()} to ${teacherName}!`);
      loadPayrollCycle(); // refresh table & state
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to record payment");
    } finally {
      setPaying(prev => ({ ...prev, [teacherId]: false }));
    }
  };

  // Pay Slip Print Generator
  const handleGenerateSlip = (teacher, record) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Pay Slip - ${teacher.fullName || teacher.name}</title>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
            .slip-card { border: 2.5px solid #326080; padding: 35px; border-radius: 12px; max-width: 650px; margin: auto; background: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px dashed #B5D2E6; padding-bottom: 20px; margin-bottom: 25px; }
            .header h1 { margin: 0; color: #326080; font-size: 26px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 5px 0 0 0; font-size: 14px; color: #64748b; font-weight: 500; }
            .details-row { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 13.5px; }
            .details-col { width: 48%; }
            .details-title { font-weight: 800; color: #326080; text-transform: uppercase; font-size: 11px; margin-bottom: 8px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; }
            .details-val { margin-bottom: 5px; color: #475569; }
            .details-val span { font-weight: 600; color: #0F172A; }
            .table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            .table th, .table td { border: 1px solid #E2E8F0; padding: 12px; text-align: left; }
            .table th { background: #FFF1E7; color: #326080; font-weight: 700; text-transform: uppercase; font-size: 11px; }
            .table td { color: #334155; }
            .total-row { font-weight: bold; background: #FFF1E7; font-size: 14px; }
            .footer { text-align: center; margin-top: 35px; font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="slip-card">
            <div class="header">
              <h1>Punjab Public High School</h1>
              <p>Salary Pay Slip — ${record.month}</p>
            </div>
            <div class="details-row">
              <div class="details-col">
                <div class="details-title">Employee Information</div>
                <div class="details-val">Name: <span>${teacher.fullName || teacher.name}</span></div>
                <div class="details-val">Employee ID: <span>${teacher.employeeId}</span></div>
                <div class="details-val">Subject/Designation: <span>${teacher.subject || "Teacher"}</span></div>
              </div>
              <div class="details-col" style="text-align: right;">
                <div class="details-title" style="text-align: right;">Payment Transaction Details</div>
                <div class="details-val">Status: <span style="color: #15803d; font-weight: 800;">PAID</span></div>
                <div class="details-val">Payment Date: <span>${new Date(record.paymentDate).toLocaleDateString()}</span></div>
                <div class="details-val">Salary Cycle: <span>${record.month}</span></div>
              </div>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Earning & Deduction Details</th>
                  <th style="text-align: right; width: 140px;">Rate (PKR)</th>
                  <th style="text-align: right; width: 100px;">Units/Qty</th>
                  <th style="text-align: right; width: 150px;">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Base Salary (${record.salaryBasis} basis)</td>
                  <td style="text-align: right;">${record.rate.toLocaleString()}</td>
                  <td style="text-align: right;">${record.units}</td>
                  <td style="text-align: right;">PKR ${(record.rate * record.units).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Allowance Additions</td>
                  <td style="text-align: right; color: #15803d;">+ ${record.allowance.toLocaleString()}</td>
                  <td style="text-align: right;">—</td>
                  <td style="text-align: right; color: #15803d;">+ PKR ${record.allowance.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Salary Deductions</td>
                  <td style="text-align: right; color: #b91c1c;">- ${record.deduction.toLocaleString()}</td>
                  <td style="text-align: right;">—</td>
                  <td style="text-align: right; color: #b91c1c;">- PKR ${record.deduction.toLocaleString()}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3">Net Transferred Salary</td>
                  <td style="text-align: right; color: #326080; font-size: 15px; font-weight: 800;">PKR ${record.netSalary.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <div class="footer">
              <p>This is a secure computer-generated payroll record. No physical signature is required.</p>
              <p>Developed by Nullstack Solutions — Lahore, Pakistan</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Search filter
  const filteredTeachers = teachers.filter(t => {
    const name = (t.fullName || t.name || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || (t.employeeId || "").toLowerCase().includes(query);
  });

  // Calculate aggregates dynamically
  let totalGrossSalary = 0;
  let paidCount = 0;

  teachers.forEach(t => {
    const paid = paidRecords[t._id];
    if (paid) {
      totalGrossSalary += paid.netSalary;
      paidCount++;
    } else {
      const base = rates[t._id] || 0;
      const u = units[t._id] || 1;
      const allow = allowances[t._id] || 0;
      const ded = deductions[t._id] || 0;
      totalGrossSalary += (base * u) + allow - ded;
    }
  });

  const unpaidCount = teachers.length - paidCount;

  return (
    <div className="space-y-4">
      {/* Aggregates Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Total Salary Budget */}
        <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Estimated Budget ({currentMonthName})</p>
            <p className="text-base font-bold text-slate-800 leading-tight mt-0.5">PKR {totalGrossSalary.toLocaleString()}</p>
          </div>
        </div>

        {/* Total Paid Staff */}
        <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckCircle size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Paid Staff</p>
            <p className="text-base font-bold text-indigo-700 leading-tight mt-0.5">{paidCount} Paid</p>
          </div>
        </div>

        {/* Unpaid Staff */}
        <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Pending Payments</p>
            <p className="text-base font-bold text-amber-700 leading-tight mt-0.5">{unpaidCount} Pending</p>
          </div>
        </div>

        {/* Cycle Date */}
        <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-650 flex items-center justify-center shrink-0">
            <Calendar size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Average Net Payable</p>
            <p className="text-base font-bold text-slate-800 leading-tight mt-0.5">
              PKR {teachers.length > 0 ? Math.round(totalGrossSalary / teachers.length).toLocaleString() : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Cycle Selector and Search */}
      <div className="bg-white rounded-md border border-slate-100/80 shadow-sm p-3.5">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search staff by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md outline-none text-xs text-slate-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-3.5 bg-slate-50/50 px-3.5 py-2 border border-slate-100/80 rounded-md">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Select Payroll Cycle:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-indigo-700 bg-transparent outline-none cursor-pointer focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-md border border-slate-100/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
            <span>Loading teachers payroll cycle...</span>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <AlertCircle size={24} />
            <span>No staff records found for this cycle</span>
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-500 font-bold uppercase">
                    <th className="px-3.5 py-2.5">Staff Details</th>
                    <th className="px-3.5 py-2.5">Salary Basis</th>
                    <th className="px-3.5 py-2.5">Rate (PKR)</th>
                    <th className="px-3.5 py-2.5 w-[90px]">Units</th>
                    <th className="px-3.5 py-2.5 w-[110px]">Allowances</th>
                    <th className="px-3.5 py-2.5 w-[110px]">Deductions</th>
                    <th className="px-3.5 py-2.5">Net Payable</th>
                    <th className="px-3.5 py-2.5">Payment Cycle</th>
                    <th className="px-3.5 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredTeachers.map((teacher) => {
                    const paidRecord = paidRecords[teacher._id];
                    const isPaid = !!paidRecord;

                    const rate = rates[teacher._id] || 0;
                    const basis = bases[teacher._id] || "monthly";
                    const unitVal = units[teacher._id] || 1;
                    const allowance = allowances[teacher._id] || 0;
                    const deduction = deductions[teacher._id] || 0;

                    // Calculation: Rate * Units + Allowance - Deduction
                    const grossBase = rate * unitVal;
                    const netPay = grossBase + allowance - deduction;

                    return (
                      <tr key={teacher._id} className="hover:bg-slate-50/40 transition">
                        {/* Details */}
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-650 shrink-0">
                              {teacher.fullName ? teacher.fullName.charAt(0).toUpperCase() : teacher.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">{teacher.fullName || teacher.name}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Emp ID: {teacher.employeeId}</p>
                            </div>
                          </div>
                        </td>

                        {/* Salary Basis */}
                        <td className="px-3.5 py-3">
                          <select
                            disabled={isPaid}
                            value={basis}
                            onChange={(e) => handleBasisChange(teacher._id, e.target.value)}
                            className="px-2 py-1 border border-slate-200 rounded outline-none text-xs text-slate-650 bg-white font-medium focus:border-indigo-500 disabled:opacity-65"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                            <option value="daily">Daily</option>
                          </select>
                        </td>

                        {/* Salary Rate input + profile save */}
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              disabled={isPaid}
                              value={rate || ""}
                              onChange={(e) => handleRateChange(teacher._id, e.target.value)}
                              className="w-20 px-2 py-1 border border-slate-200 rounded outline-none text-xs font-semibold text-slate-700 bg-white focus:border-indigo-500 disabled:opacity-65"
                            />
                            {!isPaid && (
                              <button
                                type="button"
                                onClick={() => handleSaveBaseSettings(teacher._id)}
                                disabled={savingSettings[teacher._id]}
                                title="Save settings to profile"
                                className="p-1 rounded text-indigo-600 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 shrink-0 flex items-center justify-center cursor-pointer"
                              >
                                {savingSettings[teacher._id] ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Save size={12} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Units */}
                        <td className="px-3.5 py-3">
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            disabled={isPaid}
                            value={unitVal || ""}
                            onChange={(e) => handleUnitsChange(teacher._id, e.target.value)}
                            className="w-14 px-2 py-1 border border-slate-200 rounded outline-none text-xs text-slate-650 bg-white focus:border-indigo-500 disabled:opacity-65"
                          />
                        </td>

                        {/* Allowance */}
                        <td className="px-3.5 py-3">
                          <input
                            type="number"
                            min="0"
                            disabled={isPaid}
                            value={allowance || ""}
                            onChange={(e) => handleAllowanceChange(teacher._id, e.target.value)}
                            placeholder="0"
                            className="w-20 px-2 py-1 border border-slate-200 rounded outline-none text-xs text-slate-650 bg-white focus:border-indigo-500 disabled:opacity-65"
                          />
                        </td>

                        {/* Deduction */}
                        <td className="px-3.5 py-3">
                          <input
                            type="number"
                            min="0"
                            disabled={isPaid}
                            value={deduction || ""}
                            onChange={(e) => handleDeductionChange(teacher._id, e.target.value)}
                            placeholder="0"
                            className="w-20 px-2 py-1 border border-slate-200 rounded outline-none text-xs text-slate-650 bg-white focus:border-indigo-500 disabled:opacity-65"
                          />
                        </td>

                        {/* Net Payable */}
                        <td className="px-3.5 py-3 font-bold text-slate-800 whitespace-nowrap">
                          PKR {netPay.toLocaleString()}
                        </td>

                        {/* Status Check */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          {isPaid ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="px-2 py-0.5 w-fit bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-bold text-[9px] uppercase leading-tight">
                                Paid
                              </span>
                              <span className="text-[8px] text-slate-400">
                                {new Date(paidRecord.paymentDate).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md font-bold text-[9px] uppercase leading-tight">
                              Unpaid
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            {isPaid ? (
                              <button
                                type="button"
                                onClick={() => handleGenerateSlip(teacher, paidRecord)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#805232] text-white hover:bg-[#6c4327] hover:shadow-md rounded-md font-bold text-[10px] transition cursor-pointer"
                              >
                                <FileText size={12} />
                                Pay Slip
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handlePaySalary(teacher._id, teacher.fullName || teacher.name, netPay)}
                                disabled={paying[teacher._id]}
                                className="flex items-center gap-1 px-3 py-1.5 bg-[#326080] text-white hover:bg-[#284f6b] hover:shadow-md rounded-md font-bold text-[10px] transition disabled:opacity-50 cursor-pointer"
                              >
                                {paying[teacher._id] ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <ArrowRight size={12} />
                                )}
                                Pay Salary
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View Cards */}
            <div className="block lg:hidden space-y-3.5 p-3">
              {filteredTeachers.map((teacher) => {
                const paidRecord = paidRecords[teacher._id];
                const isPaid = !!paidRecord;

                const rate = rates[teacher._id] || 0;
                const basis = bases[teacher._id] || "monthly";
                const unitVal = units[teacher._id] || 1;
                const allowance = allowances[teacher._id] || 0;
                const deduction = deductions[teacher._id] || 0;

                const grossBase = rate * unitVal;
                const netPay = grossBase + allowance - deduction;

                return (
                  <div
                    key={teacher._id}
                    className="bg-white border border-slate-100 rounded-md p-3.5 space-y-3.5 shadow-sm hover:shadow transition duration-200"
                  >
                    {/* Teacher Details */}
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100/60 pb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-650 shrink-0">
                          {teacher.fullName ? teacher.fullName.charAt(0).toUpperCase() : teacher.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-xs truncate">{teacher.fullName || teacher.name}</p>
                          <p className="text-[9px] text-slate-400">ID: {teacher.employeeId} • {teacher.subject || "Teacher"}</p>
                        </div>
                      </div>
                      <div>
                        {isPaid ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-bold text-[9px] uppercase">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md font-bold text-[9px] uppercase">
                            Unpaid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Inputs and details grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* Basis */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Salary Basis</span>
                        <select
                          disabled={isPaid}
                          value={basis}
                          onChange={(e) => handleBasisChange(teacher._id, e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none text-xs text-slate-650 bg-white font-medium focus:border-indigo-500 disabled:opacity-65"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="weekly">Weekly</option>
                          <option value="daily">Daily</option>
                        </select>
                      </div>

                      {/* Rate */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rate (PKR)</span>
                        <div className="flex gap-1 items-center">
                          <input
                            type="number"
                            min="0"
                            disabled={isPaid}
                            value={rate || ""}
                            onChange={(e) => handleRateChange(teacher._id, e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded outline-none text-xs font-semibold text-slate-700 bg-white focus:border-indigo-500 disabled:opacity-65"
                          />
                          {!isPaid && (
                            <button
                              type="button"
                              onClick={() => handleSaveBaseSettings(teacher._id)}
                              disabled={savingSettings[teacher._id]}
                              className="p-1.5 rounded text-indigo-600 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 shrink-0 flex items-center justify-center cursor-pointer"
                            >
                              {savingSettings[teacher._id] ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Save size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Units */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Working Units</span>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          disabled={isPaid}
                          value={unitVal || ""}
                          onChange={(e) => handleUnitsChange(teacher._id, e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded outline-none text-xs text-slate-650 bg-white focus:border-indigo-500 disabled:opacity-65"
                        />
                      </div>

                      {/* Gross Base display */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Gross Base</span>
                        <span className="block text-xs font-bold text-slate-700 py-1">PKR {grossBase.toLocaleString()}</span>
                      </div>

                      {/* Allowance */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Allowances (PKR)</span>
                        <input
                          type="number"
                          min="0"
                          disabled={isPaid}
                          value={allowance || ""}
                          onChange={(e) => handleAllowanceChange(teacher._id, e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-slate-200 rounded outline-none text-xs text-slate-650 bg-white focus:border-indigo-500 disabled:opacity-65"
                        />
                      </div>

                      {/* Deduction */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Deductions (PKR)</span>
                        <input
                          type="number"
                          min="0"
                          disabled={isPaid}
                          value={deduction || ""}
                          onChange={(e) => handleDeductionChange(teacher._id, e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-1 border border-slate-200 rounded outline-none text-xs text-slate-650 bg-white focus:border-indigo-500 disabled:opacity-65"
                        />
                      </div>
                    </div>

                    {/* Total & Action Footer */}
                    <div className="flex items-center justify-between border-t border-slate-100/60 pt-3 mt-1">
                      <div className="min-w-0">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">Net Payable</span>
                        <span className="text-xs font-bold text-slate-800 mt-1 block">PKR {netPay.toLocaleString()}</span>
                      </div>

                      <div className="shrink-0">
                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => handleGenerateSlip(teacher, paidRecord)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#805232] text-white hover:bg-[#6c4327] hover:shadow-md rounded-md font-bold text-[10px] transition cursor-pointer"
                          >
                            <FileText size={11} />
                            Pay Slip
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePaySalary(teacher._id, teacher.fullName || teacher.name, netPay)}
                            disabled={paying[teacher._id]}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#326080] text-white hover:bg-[#284f6b] hover:shadow-md rounded-md font-bold text-[10px] transition disabled:opacity-50 cursor-pointer"
                          >
                            <ArrowRight size={11} />
                            Pay Salary
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
