export default function Input({ label, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <input
        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}
