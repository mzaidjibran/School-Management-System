import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-white/90 backdrop-blur-md mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Main footer content */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-4 text-center lg:text-left">
          
          {/* Left: School branding */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold font-serif">P</span>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <p className="text-sm font-bold text-slate-800 tracking-wide">
                Punjab Public High School
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Empowering Minds Since 1985
              </p>
            </div>
          </div>

          {/* Center: Quick links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
            <Link to="/privacy-policy" className="hover:text-indigo-600 transition duration-150">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-indigo-600 transition duration-150">Terms of Service</Link>
            <Link to="/support" className="hover:text-indigo-600 transition duration-150">Support</Link>
            <Link to="/contact-us" className="hover:text-indigo-600 transition duration-150">Contact Us</Link>
          </div>

          {/* Right: Copyright + Version + Dev credit */}
          <div className="text-center lg:text-right text-xs text-slate-400 space-y-1">
            <p>© {currentYear} School ERP • <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold border border-slate-200/30">v1.0.0</span></p>
            <p className="text-slate-400">
              Developed by{" "}
              <span className="text-indigo-500 font-bold hover:text-indigo-600 transition duration-150 cursor-pointer">Null Stack Solutions</span>
            </p>
          </div>
        </div>

        {/* Divider + additional subtle note */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-[10px] text-slate-400 tracking-wider uppercase font-bold">
          <p>This system is for authorized use only. All data is protected.</p>
        </div>
      </div>
    </footer>
  );
}
