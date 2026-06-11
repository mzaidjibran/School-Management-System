import { useState, useEffect } from "react";
import {
  FaEye,
  FaCopy,
  FaPrint,
  FaTrash,
  FaPlus,
  FaSearch,
  FaCalendarAlt,
  FaTable,
  FaLayerGroup,
  FaTimes,
} from "react-icons/fa";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const initialTimetables = [
  {
    id: 1,
    className: "10th",
    section: "A",
    academicYear: "2025-2026",
    createdAt: "2025-01-15",
    timetable: {
      Monday: {
        "08:00-09:00": { subject: "Math", teacher: "Mr. Ahmed", room: "101" },
        "09:00-10:00": {
          subject: "Physics",
          teacher: "Dr. Sana",
          room: "Lab 1",
        },
      },
      Tuesday: {
        "08:00-09:00": {
          subject: "English",
          teacher: "Ms. Fatima",
          room: "102",
        },
      },
      Wednesday: {},
      Thursday: {},
      Friday: {},
      Saturday: {},
    },
  },
  {
    id: 2,
    className: "9th",
    section: "B",
    academicYear: "2025-2026",
    createdAt: "2025-01-20",
    timetable: {
      Monday: {},
      Tuesday: {},
      Wednesday: {},
      Thursday: {},
      Friday: {},
      Saturday: {},
    },
  },
];

const printStyles = `
  @media print {
    body * { visibility: hidden; }
    #print-area, #print-area * { visibility: visible; }
    #print-area { position: absolute; top: 0; left: 0; width: 100%; margin: 0; padding: 20px; }
    .no-print { display: none; }
  }
`;

// ---------- View Modal ----------
const ViewModal = ({ tt, onClose }) => {
  if (!tt) return null;

  // collect all unique slots across all days
  const allSlots = [
    ...new Set(DAYS.flatMap((day) => Object.keys(tt.timetable[day] || {}))),
  ].sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Timetable — Class {tt.className} / Section {tt.section}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Academic Year: {tt.academicYear}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-auto p-4">
          {allSlots.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No slots assigned yet.
            </div>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-2 px-3 text-left font-semibold text-slate-600 w-28 whitespace-nowrap">
                    Time Slot
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="py-2 px-2 text-left font-semibold text-slate-600 min-w-[100px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSlots.map((slot, si) => (
                  <tr
                    key={slot}
                    className={`border-b border-slate-100 ${si % 2 === 0 ? "" : "bg-slate-50/50"}`}
                  >
                    <td className="py-2 px-3 font-semibold text-indigo-600 bg-indigo-50/60 whitespace-nowrap">
                      {slot}
                    </td>
                    {DAYS.map((day) => {
                      const cell = tt.timetable[day]?.[slot];
                      return (
                        <td
                          key={day}
                          className={`py-2 px-2 align-top ${cell?.subject ? "bg-indigo-50/30" : ""}`}
                        >
                          {cell?.subject ? (
                            <div>
                              <div className="font-semibold text-slate-800">
                                {cell.subject}
                              </div>
                              <div className="text-slate-500 mt-0.5">
                                {cell.teacher}
                              </div>
                              <div className="text-slate-400">{cell.room}</div>
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
          )}
        </div>

        <div className="border-t px-6 py-3 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Main ----------
export default function TimetableList() {
  const [timetables, setTimetables] = useState(initialTimetables);
  const [filtered, setFiltered] = useState(initialTimetables);
  const [searchClass, setSearchClass] = useState("");
  const [searchSection, setSearchSection] = useState("");
  const [viewTimetable, setViewTimetable] = useState(null);
  const [printTimetable, setPrintTimetable] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let result = timetables;
    if (searchClass)
      result = result.filter((t) =>
        t.className.toLowerCase().includes(searchClass.toLowerCase()),
      );
    if (searchSection)
      result = result.filter((t) =>
        t.section.toLowerCase().includes(searchSection.toLowerCase()),
      );
    setFiltered(result);
  }, [searchClass, searchSection, timetables]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleDuplicate = (id) => {
    const original = timetables.find((t) => t.id === id);
    const newId = Math.max(...timetables.map((t) => t.id)) + 1;
    setTimetables([
      ...timetables,
      {
        ...original,
        id: newId,
        className: `${original.className} (Copy)`,
        createdAt: new Date().toISOString().split("T")[0],
      },
    ]);
    showToast("Timetable duplicated!");
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this timetable?")) {
      setTimetables(timetables.filter((t) => t.id !== id));
      showToast("Timetable deleted.");
    }
  };

  const handlePrint = (tt) => {
    setPrintTimetable(tt);
    setTimeout(() => {
      window.print();
      setPrintTimetable(null);
    }, 200);
  };

  const uniqueClasses = [...new Set(timetables.map((t) => t.className))];
  const uniqueSections = [...new Set(timetables.map((t) => t.section))];
  const inputCls =
    "h-8 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full";

  const statCards = [
    {
      label: "Total Timetables",
      value: timetables.length,
      icon: <FaTable className="text-indigo-600" />,
      bg: "bg-indigo-50",
      text: "text-indigo-700",
    },
    {
      label: "Active Classes",
      value: [...new Set(timetables.map((t) => t.className))].length,
      icon: <FaLayerGroup className="text-emerald-600" />,
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      label: "Academic Year",
      value: timetables[0]?.academicYear ?? "—",
      icon: <FaCalendarAlt className="text-blue-600" />,
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <style>{printStyles}</style>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-5 text-sm text-slate-500">
          <span className="hover:text-indigo-600 cursor-pointer">
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 font-medium">
            Timetable Management
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Timetable Management
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Manage all class timetables
            </p>
          </div>
          <a
            href="/timetable/create"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors no-print"
          >
            <FaPlus className="text-xs" /> Create Timetable
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {statCards.map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-xl font-bold mt-0.5 ${c.text}`}>
                  {c.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center text-lg`}
              >
                {c.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 mb-5 no-print">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search class…"
                value={searchClass}
                onChange={(e) => setSearchClass(e.target.value)}
                className={`${inputCls} pl-7 pr-2.5`}
                list="classes"
              />
              <datalist id="classes">
                {uniqueClasses.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search section…"
                value={searchSection}
                onChange={(e) => setSearchSection(e.target.value)}
                className={`${inputCls} pl-7 pr-2.5`}
                list="sections"
              />
              <datalist id="sections">
                {uniqueSections.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    "#",
                    "Class",
                    "Section",
                    "Academic Year",
                    "Created At",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs font-semibold text-slate-600 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-12 text-center text-sm text-slate-400"
                    >
                      No timetables found
                    </td>
                  </tr>
                ) : (
                  filtered.map((tt, idx) => (
                    <tr
                      key={tt.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {tt.className}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {tt.section}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {tt.academicYear}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {tt.createdAt}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewTimetable(tt)}
                            title="View"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(tt.id)}
                            title="Duplicate"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <FaCopy className="text-sm" />
                          </button>
                          <button
                            onClick={() => handlePrint(tt)}
                            title="Print"
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <FaPrint className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(tt.id)}
                            title="Delete"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <ViewModal tt={viewTimetable} onClose={() => setViewTimetable(null)} />

      {/* Print Area */}
      {printTimetable && (
        <div
          id="print-area"
          className="fixed top-0 left-0 w-full bg-white p-8"
          style={{ zIndex: -1 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center border-b pb-4">
              <div className="w-12 h-12 mx-auto bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                P
              </div>
              <h2 className="text-lg font-bold mt-2">
                Punjab Public High School
              </h2>
              <p className="text-xs text-slate-500">Lahore, Pakistan</p>
            </div>
            <div className="grid grid-cols-2 gap-2 my-4 text-sm">
              <div>
                <strong>Class:</strong> {printTimetable.className}
              </div>
              <div>
                <strong>Section:</strong> {printTimetable.section}
              </div>
              <div>
                <strong>Academic Year:</strong> {printTimetable.academicYear}
              </div>
              <div>
                <strong>Generated:</strong> {new Date().toLocaleDateString()}
              </div>
            </div>
            <table className="w-full border-collapse border text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border p-2">Time</th>
                  {DAYS.map((d) => (
                    <th key={d} className="border p-2">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ...new Set(
                    DAYS.flatMap((day) =>
                      Object.keys(printTimetable.timetable[day] || {}),
                    ),
                  ),
                ]
                  .sort()
                  .map((slot) => (
                    <tr key={slot}>
                      <td className="border p-2 font-semibold text-indigo-700 bg-indigo-50">
                        {slot}
                      </td>
                      {DAYS.map((day) => (
                        <td key={day} className="border p-2">
                          <div className="font-medium">
                            {printTimetable.timetable[day]?.[slot]?.subject ||
                              "—"}
                          </div>
                          {printTimetable.timetable[day]?.[slot]?.subject && (
                            <div className="text-slate-400">
                              {printTimetable.timetable[day]?.[slot]?.teacher} /{" "}
                              {printTimetable.timetable[day]?.[slot]?.room}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white text-sm px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
