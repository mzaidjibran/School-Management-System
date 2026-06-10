export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left: School branding */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Punjab Public High School
              </p>
              <p className="text-xs text-slate-500">
                Empowering Minds Since 1985
              </p>
            </div>
          </div>

          {/* Center: Quick links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <a
              href="#"
              className="text-slate-500 hover:text-indigo-600 transition"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-indigo-600 transition"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-indigo-600 transition"
            >
              Support
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-indigo-600 transition"
            >
              Contact Us
            </a>
          </div>

          {/* Right: Copyright + Version + Dev credit */}
          <div className="text-right text-xs text-slate-400 space-y-1">
            <p>© {currentYear} School ERP • v1.0.0</p>
            <p className="text-slate-400">
              Developed by{" "}
              <span className="text-indigo-500 font-medium">Null Stack</span>
            </p>
          </div>
        </div>

        {/* Divider + additional subtle note */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          <p>This system is for authorized use only. All data is protected.</p>
        </div>
      </div>
    </footer>
  );
}
