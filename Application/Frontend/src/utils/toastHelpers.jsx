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
        } w-[280px] bg-white shadow-xl rounded-xl border border-slate-100/80 p-3.5 flex flex-col gap-3 z-[9999]`}
      >
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Are you sure?</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">{message}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 border border-slate-200 text-[10px] font-bold text-slate-500 rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg shadow-sm transition cursor-pointer ${confirmClass}`}
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
