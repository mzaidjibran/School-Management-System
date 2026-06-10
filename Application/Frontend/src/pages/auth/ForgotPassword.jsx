export default function ForgotPassword() {
  return (
    <div className="max-w-md mx-auto mt-20">
      <input
        type="email"
        placeholder="Email Address"
        className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="mt-4">
        <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Send Reset Link
        </button>
      </div>
    </div>
  );
}
