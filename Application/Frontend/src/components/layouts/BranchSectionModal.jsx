import { useState, useEffect } from "react";
import { getAllBranches, createBranch, deleteBranch } from "../../Api/Branch_Api";
import { confirmToast } from "../../utils/toastHelpers.jsx";
import { School, Layers, CheckCircle2, Loader2, Plus, ArrowLeft, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function BranchSectionModal({ isOpen, onClose }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSection, setSelectedSection] = useState("girls");

  // Add Branch States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCode, setNewBranchCode] = useState("");
  const [creatingBranch, setCreatingBranch] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getAllBranches();
        const list = res.data || [];
        setBranches(list);
        if (list.length > 0) {
          // Pre-select active branch or first branch
          const current = localStorage.getItem("activeBranch");
          if (list.some((b) => b._id === current)) {
            setSelectedBranch(current);
          } else {
            setSelectedBranch(list[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load branches");
      } finally {
        setLoading(false);
      }
    };
    fetch();

    const currSec = localStorage.getItem("activeSection");
    if (currSec === "girls" || currSec === "boys") {
      setSelectedSection(currSec);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBranch) {
      toast.error("Please select a branch");
      return;
    }

    setSubmitting(true);
    const branchDoc = branches.find((b) => b._id === selectedBranch);

    localStorage.setItem("activeBranch", selectedBranch);
    localStorage.setItem("activeBranchName", branchDoc ? branchDoc.name : "Active Branch");
    localStorage.setItem("activeSection", selectedSection);

    // Notify application to refresh data
    window.dispatchEvent(new Event("branch-changed"));
    setSubmitting(false);
    onClose();
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchCode.trim()) {
      toast.error("Please enter branch name and code");
      return;
    }
    setCreatingBranch(true);
    try {
      const res = await createBranch({
        name: newBranchName.trim(),
        code: newBranchCode.trim().toUpperCase(),
      });
      if (res.success && res.data) {
        toast.success(`Branch "${res.data.name}" created successfully!`);
        setBranches((prev) => [...prev, res.data]);
        setSelectedBranch(res.data._id);
        setShowAddForm(false);
        setNewBranchName("");
        setNewBranchCode("");
      } else {
        toast.error(res.message || "Failed to create branch");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create branch");
    } finally {
      setCreatingBranch(false);
    }
  };

  const handleDeleteBranch = (id, name) => {
    confirmToast(
      `Are you sure you want to delete branch "${name}"?`,
      async () => {
        try {
          await deleteBranch(id);
          toast.success(`Branch "${name}" deleted successfully!`);
          
          setBranches((prev) => {
            const updated = prev.filter((b) => b._id !== id);
            
            // If the deleted branch was selected, auto-select another one
            if (selectedBranch === id) {
              if (updated.length > 0) {
                setSelectedBranch(updated[0]._id);
              } else {
                setSelectedBranch("");
              }
            }
            return updated;
          });

          // If the deleted branch was the active branch in localStorage, clear it
          if (localStorage.getItem("activeBranch") === id) {
            localStorage.removeItem("activeBranch");
            localStorage.removeItem("activeBranchName");
          }
        } catch (err) {
          toast.error(err.message || "Failed to delete branch");
        }
      },
      { confirmText: "Delete", confirmClass: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 text-white" }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9000] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-4 sm:p-6 relative animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shrink-0">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
              {showAddForm ? "Add New Campus" : "Select Branch & Section"}
            </h2>
            <p className="text-xs text-slate-400">
              {showAddForm ? "Create a new school campus branch" : "Choose campus & gender division"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 flex-1">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="text-sm font-medium text-slate-500">Loading branch configuration...</span>
          </div>
        ) : showAddForm ? (
          /* Add Branch Form */
          <form onSubmit={handleCreateBranch} className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g. Model Town Campus"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Branch Code *
                </label>
                <input
                  type="text"
                  required
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value)}
                  placeholder="e.g. MTC03"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition font-medium text-slate-700 uppercase"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={creatingBranch}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/10 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {creatingBranch ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save Branch
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Main Select Branch/Section Form */
          <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-between overflow-hidden">
            
            {/* Branch Selector List */}
            <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center shrink-0">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  School Branch
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 focus:outline-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Campus
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[170px] min-h-[100px] border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                {branches.map((b) => (
                  <div
                    key={b._id}
                    onClick={() => setSelectedBranch(b._id)}
                    className={`p-3 rounded-xl border text-sm font-semibold transition flex items-center justify-between cursor-pointer ${
                      selectedBranch === b._id
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm shadow-indigo-100/50"
                        : "border-slate-200/80 hover:bg-slate-50 text-slate-700 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${selectedBranch === b._id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                        <School className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="font-bold text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]">{b.name}</span>
                        <span className="text-[9px] text-slate-400 font-medium">Code: {b.code}</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBranch(b._id, b.name);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Branch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {branches.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">
                    No branches configured. Please add a branch.
                  </div>
                )}
              </div>
            </div>

            {/* Section Selector */}
            <div className="space-y-2 shrink-0">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Gender Division Section
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["girls", "boys"].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSection(sec)}
                    className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl border text-xs sm:text-sm font-semibold capitalize transition flex items-center justify-center gap-1.5 sm:gap-2 ${
                      selectedSection === sec
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm shadow-indigo-100"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600 bg-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {sec === "girls" ? "Girls" : "Boys"}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedBranch}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/10 transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Applying configuration...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm and Proceed
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
