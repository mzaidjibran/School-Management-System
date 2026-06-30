import toast from "react-hot-toast";

/**
 * Premium Confirm Toast using react-hot-toast.
 * Renders a centered dialog card with a fixed width.
 * 
 * @param {string} message - Description of the confirmation action
 * @param {Function} onConfirm - Callback run when the user clicks 'Confirm'
 * @param {Object} options - Options override (e.g., confirmText, confirmClass)
 */
export const confirmToast = (message, onConfirm, options = {}) => {
  const confirmText = options.confirmText || "Confirm";
  const confirmClass = options.confirmClass || "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10 text-white";

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-scaleIn" : "animate-fadeOut"
        } max-w-xs w-80 bg-white shadow-2xl rounded-2xl border border-slate-100/80 p-4 flex flex-col gap-3.5 z-[9999]`}
      >
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Are you sure?</p>
          <p className="text-sm font-semibold text-slate-700 mt-1">{message}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="px-3.5 py-1.5 border border-slate-200 text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-sm transition cursor-pointer ${confirmClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: "top-center",
    }
  );
};
