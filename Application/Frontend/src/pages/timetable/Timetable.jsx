import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { confirmToast } from "../../utils/toastHelpers.jsx";
import {
  FaEye, FaCopy, FaPrint, FaTrash, FaPlus,
  FaSearch, FaCalendarAlt, FaTable, FaLayerGroup, FaTimes,
  FaEdit, FaChalkboardTeacher,
} from "react-icons/fa";
import { getClassTimetable, deleteTimetable, createOrUpdateTimetable } from "../../api/TimeTable_Api.js";
import { getAllClasses } from "../../Api/Class_Api.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const printStyles = `
  @media print {
    body * { visibility: hidden; }
    #print-area, #print-area * { visibility: visible; }
    #print-area { position: absolute; top: 0; left: 0; width: 100%; margin: 0; padding: 20px; }
    .no-print { display: none; }
  }
`;

const backendToGrid = (timetableArr = []) => {
  const grid = {};
  DAYS.forEach((d) => (grid[d] = {}));
  timetableArr.forEach(({ day, periods = [] }) => {
    periods.forEach((p) => {
      const slot = `${p.startTime}-${p.endTime}`;
      grid[day][slot] = {
        subject: p.subject || "",
        teacher: p.teacher?.name || p.teacher || "",
        room: p.room || "",
      };
    });
  });
  return grid;
};

// ─── View Modal ───────────────────────────────────────────────────────────────
const ViewModal = ({ tt, onClose }) => {
  if (!tt) return null;
  const grid = backendToGrid(tt.timetableData || []);
  const allSlots = [...new Set(DAYS.flatMap((day) => Object.keys(grid[day] || {})))].sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Timetable — {tt.className}{tt.section && tt.section !== "—" ? ` / ${tt.section}` : ""}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Academic Year: {tt.academicYear}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <FaTimes />
          </button>
        </div>

        <div className="overflow-auto p-4 flex-1">
          {allSlots.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No slots assigned yet.</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-2 px-3 text-left font-semibold text-slate-600 w-28 whitespace-nowrap">Time Slot</th>
                      {DAYS.map((day) => (
                        <th key={day} className="py-2 px-2 text-left font-semibold text-slate-600 min-w-[90px]">{day.slice(0, 3)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allSlots.map((slot, si) => (
                      <tr key={slot} className={`border-b border-slate-100 ${si % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                        <td className="py-2 px-3 font-semibold text-indigo-600 bg-indigo-50/60 whitespace-nowrap">{slot}</td>
                        {DAYS.map((day) => {
                          const cell = grid[day]?.[slot];
                          return (
                            <td key={day} className={`py-2 px-2 align-top ${cell?.subject ? "bg-indigo-50/30" : ""}`}>
                              {cell?.subject ? (
                                <div>
                                  <div className="font-semibold text-slate-800">{cell.subject}</div>
                                  {cell.teacher && <div className="text-slate-500 mt-0.5 text-[10px]">{cell.teacher}</div>}
                                  {cell.room && <div className="text-slate-400 text-[10px]">🚪 {cell.room}</div>}
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: cards per slot */}
              <div className="block sm:hidden space-y-3">
                {allSlots.map((slot) => (
                  <div key={slot} className="border border-slate-100 rounded-md overflow-hidden">
                    <div className="bg-indigo-50 px-3 py-1.5">
                      <span className="text-xs font-bold text-indigo-700">{slot}</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {DAYS.map((day) => {
                        const cell = grid[day]?.[slot];
                        if (!cell?.subject) return null;
                        return (
                          <div key={day} className="px-3 py-2 flex justify-between items-start">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase w-10 shrink-0 mt-0.5">{day.slice(0, 3)}</span>
                            <div className="flex-1 ml-2">
                              <p className="text-xs font-semibold text-slate-800">{cell.subject}</p>
                              {cell.teacher && <p className="text-[10px] text-slate-500">{cell.teacher}</p>}
                              {cell.room && <p className="text-[10px] text-slate-400">Room: {cell.room}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-3 flex justify-end shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TimetableList() {
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchClass, setSearchClass] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [viewTimetable, setViewTimetable] = useState(null);
  const [printTimetable, setPrintTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const classJson = await getAllClasses();
      const classList = classJson.data || [];
      setClasses(classList);

      const results = await Promise.all(
        classList.map(async (cls) => {
          try {
            const res = await getClassTimetable(cls._id);
            return {
              _id: cls._id,
              className: cls.name,
              section: cls.section || "—",
              academicYear: res.timetable?.[0]?.session || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
              createdAt: res.timetable?.[0]?.createdAt ? new Date(res.timetable[0].createdAt).toLocaleDateString() : "—",
              timetableData: res.timetable || [],
            };
          } catch {
            return { _id: cls._id, className: cls.name, section: cls.section || "—", academicYear: "—", createdAt: "—", timetableData: [] };
          }
        })
      );

      setTimetables(results);
      setFiltered(results);
    } catch (err) {
      toast.error("Data load karne mein error: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    window.addEventListener("branch-changed", fetchAll);
    return () => window.removeEventListener("branch-changed", fetchAll);
  }, [fetchAll]);

  // Filters
  useEffect(() => {
    let result = timetables;
    if (searchClass) result = result.filter((t) => t.className.toLowerCase().includes(searchClass.toLowerCase()));
    if (classFilter) result = result.filter((t) => t._id === classFilter);
    setFiltered(result);
  }, [searchClass, classFilter, timetables]);

  const handleDuplicate = async (tt) => {
    if (!tt.timetableData.length) { toast.error("Is class ka koi timetable nahi hai duplicate karne ke liye."); return; }
    try {
      await Promise.all(tt.timetableData.map((entry) => createOrUpdateTimetable({ class: tt._id, day: entry.day, session: entry.session, periods: entry.periods })));
      toast.success("Timetable duplicated!");
      fetchAll();
    } catch (err) {
      toast.error("Duplicate error: " + err.message);
    }
  };

  const handleDelete = (tt) => {
    confirmToast("Is class ka sara timetable delete karen?", async () => {
      try {
        await Promise.all(tt.timetableData.map((entry) => deleteTimetable(entry._id)));
        toast.success("Timetable deleted.");
        fetchAll();
      } catch (err) {
        toast.error("Delete error: " + err.message);
      }
    }, { confirmText: "Delete", confirmClass: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 text-white" });
  };

  const handlePrint = (tt) => {
    setPrintTimetable(tt);
    setTimeout(() => { window.print(); setPrintTimetable(null); }, 200);
  };

  const activeTimetables = timetables.filter((t) => t.timetableData.length > 0).length;
  const totalClasses = [...new Set(timetables.map((t) => t.className))].length;

  const statCards = [
    { label: "Active Timetables", value: activeTimetables, icon: <FaTable />, bg: "bg-indigo-50", text: "text-indigo-700", ic: "text-indigo-600" },
    { label: "Total Classes", value: totalClasses, icon: <FaLayerGroup />, bg: "bg-emerald-50", text: "text-emerald-700", ic: "text-emerald-600" },
    { label: "Academic Year", value: timetables.find((t) => t.academicYear !== "—")?.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, icon: <FaCalendarAlt />, bg: "bg-blue-50", text: "text-blue-700", ic: "text-blue-600" },
  ];

  return (
    <div className="space-y-3">
      <style>{printStyles}</style>

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Dashboard / Timetable</p>
          <h1 className="text-xl font-bold text-slate-800">Timetable Management</h1>
          <p className="text-sm text-slate-500">Manage all class timetables</p>
        </div>
        <button onClick={() => navigate("/timetable/create")}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors no-print">
          <FaPlus className="text-xs" /> Create Timetable
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-md shadow-sm border border-slate-100 p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500">{c.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${c.text}`}>{c.value}</p>
            </div>
            <div className={`w-10 h-10 ${c.bg} rounded-md flex items-center justify-center text-lg ${c.ic}`}>{c.icon}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-md shadow-sm border border-slate-100 px-4 py-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative">
            <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input type="text" placeholder="Search class name…" value={searchClass} onChange={(e) => setSearchClass(e.target.value)}
              className="h-9 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full pl-7 pr-2.5" />
          </div>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
            className="h-9 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 px-2.5">
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name}{c.section ? ` - ${c.section}` : ""}</option>)}
          </select>
          <button onClick={() => { setSearchClass(""); setClassFilter(""); }}
            className="h-9 text-xs border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 px-3 transition-colors">
            Clear Filters
          </button>
        </div>
      </div>

      {/* ── Table (desktop) + Cards (mobile) ── */}
      <div className="bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-700">Timetable Records</span>
          <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-0.5 rounded-full">{filtered.length} classes</span>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading timetables...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <FaCalendarAlt className="text-slate-400 text-xl" />
            </div>
            <p className="text-sm text-slate-500 font-medium">No timetables found</p>
            <p className="text-xs text-slate-400 mt-1">Create a timetable to get started</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["#", "Class", "Section", "Academic Year", "Created At", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tt, idx) => (
                    <tr key={tt._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 text-xs">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{tt.className}</td>
                      <td className="py-3 px-4 text-slate-600">{tt.section}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{tt.academicYear}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{tt.createdAt}</td>
                      <td className="py-3 px-4">
                        {tt.timetableData.length > 0 ? (
                          <span className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 rounded-full font-medium">Active</span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full font-medium">Not Set</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewTimetable(tt)} title="View" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><FaEye className="text-sm" /></button>
                          <button onClick={() => navigate(`/timetable/${tt._id}`)} title="Edit" className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-md transition-colors"><FaEdit className="text-sm" /></button>
                          <button onClick={() => handleDuplicate(tt)} title="Duplicate" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"><FaCopy className="text-sm" /></button>
                          <button onClick={() => handlePrint(tt)} title="Print" className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"><FaPrint className="text-sm" /></button>
                          <button onClick={() => handleDelete(tt)} title="Delete" disabled={tt.timetableData.length === 0}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-30"><FaTrash className="text-sm" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="block sm:hidden p-4 space-y-3">
              {filtered.map((tt, idx) => {
                const colors = ["bg-indigo-100 text-indigo-700", "bg-purple-100 text-purple-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700"];
                const periodCount = tt.timetableData.reduce((sum, d) => sum + (d.periods?.length || 0), 0);
                return (
                  <div key={tt._id} className="border border-slate-100 rounded-md shadow-sm bg-white p-4">
                    {/* Top */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-sm ${colors[idx % colors.length]}`}>
                          {tt.className?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{tt.className}</p>
                          <p className="text-xs text-slate-400">Section: {tt.section}</p>
                        </div>
                      </div>
                      {tt.timetableData.length > 0 ? (
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 rounded-full font-medium">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded-full font-medium">Not Set</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-md p-2.5 text-xs mb-3">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Academic Year</p>
                        <p className="text-slate-700 font-medium">{tt.academicYear}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Periods</p>
                        <p className="text-slate-700 font-medium">{periodCount} periods</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">Created</p>
                        <p className="text-slate-700 font-medium">{tt.createdAt}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button onClick={() => setViewTimetable(tt)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition"><FaEye /> View</button>
                      <button onClick={() => navigate(`/timetable/${tt._id}`)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-md transition"><FaEdit /> Edit</button>
                      <button onClick={() => handleDuplicate(tt)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition"><FaCopy /> Copy</button>
                      <button onClick={() => handlePrint(tt)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition"><FaPrint /> Print</button>
                      <button onClick={() => handleDelete(tt)} disabled={tt.timetableData.length === 0}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition disabled:opacity-30"><FaTrash /> Del</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* View Modal */}
      <ViewModal tt={viewTimetable} onClose={() => setViewTimetable(null)} />

      {/* Print Area */}
      {printTimetable && (() => {
        const grid = backendToGrid(printTimetable.timetableData || []);
        const slots = [...new Set(DAYS.flatMap((day) => Object.keys(grid[day] || {})))].sort();
        return (
          <div id="print-area" className="fixed top-0 left-0 w-full bg-white p-8" style={{ zIndex: -1 }}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center border-b pb-4">
                <div className="w-12 h-12 mx-auto bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">S</div>
                <h2 className="text-lg font-bold mt-2">School Management System</h2>
                <p className="text-xs text-slate-500">Timetable</p>
              </div>
              <div className="grid grid-cols-2 gap-2 my-4 text-sm">
                <div><strong>Class:</strong> {printTimetable.className}</div>
                <div><strong>Section:</strong> {printTimetable.section}</div>
                <div><strong>Academic Year:</strong> {printTimetable.academicYear}</div>
                <div><strong>Generated:</strong> {new Date().toLocaleDateString()}</div>
              </div>
              <table className="w-full border-collapse border text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border p-2">Time</th>
                    {DAYS.map((d) => <th key={d} className="border p-2">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot}>
                      <td className="border p-2 font-semibold text-indigo-700 bg-indigo-50">{slot}</td>
                      {DAYS.map((day) => (
                        <td key={day} className="border p-2">
                          <div className="font-medium">{grid[day]?.[slot]?.subject || "—"}</div>
                          {grid[day]?.[slot]?.subject && (
                            <div className="text-slate-400">{grid[day]?.[slot]?.teacher} / {grid[day]?.[slot]?.room}</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}