import React, { useState } from "react";
import { HelpCircle, ChevronDown, MessageSquare, LifeBuoy, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function Support() {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", ticketType: "bug", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      q: "How can I update my profile details?",
      a: "Click on your profile avatar in the top-right header and select 'Edit Profile' to update your full name or profile photo. Note that email addresses are fixed and cannot be changed for security reasons.",
    },
    {
      q: "Why are some dashboard widgets hidden?",
      a: "Teacher accounts display widgets depending on the permissions assigned by the Principal. If you need access to a specific tab (like fees, attendance, or exams), please contact the Principal to update your assigned pages.",
    },
    {
      q: "Can I download my student or fee reports?",
      a: "Yes! All data lists (Students, Teachers, Fees, Attendance, Timetable, Exams) have export options for CSV, Excel, and PDF formats located at the top right of the table views.",
    },
    {
      q: "How do I reset my login password?",
      a: "If you have an active account, you can change your password. Teachers can also request the Principal to reset their password using the 'Teacher Permissions' portal in the header.",
    },
  ];

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields!");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Support ticket created! We will contact you soon.");
      setForm({ name: "", email: "", ticketType: "bug", message: "" });
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-md border border-slate-100/85 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-md">
            <LifeBuoy size={26} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">ERP Help & Support</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Punjab Public High School ERP Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
          <span>Support Hours: 08:00 AM - 02:00 PM</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: FAQ Accordion */}
        <div className="lg:col-span-3 bg-white rounded-md border border-slate-100/85 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 mb-2">
            <HelpCircle size={16} className="text-indigo-600" /> Frequently Asked Questions
          </h2>
          
          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="border border-slate-100 rounded-md overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 text-left font-semibold text-slate-700 text-xs transition cursor-pointer select-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white border-t border-slate-50 text-xs text-slate-500 leading-relaxed animate-slideDown">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Open a Ticket Form */}
        <div className="lg:col-span-2 bg-white rounded-md border border-slate-100/85 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 mb-2">
            <MessageSquare size={16} className="text-indigo-600" /> Open a Support Ticket
          </h2>

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ticket Type</label>
              <select
                value={form.ticketType}
                onChange={(e) => setForm(prev => ({ ...prev, ticketType: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:border-indigo-500 transition"
              >
                <option value="bug">Report System Bug</option>
                <option value="access">Access & Permissions Issue</option>
                <option value="training">Request ERP Training</option>
                <option value="other">General Query</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded outline-none focus:border-indigo-500 focus:bg-white transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded text-xs font-bold shadow-md shadow-indigo-600/10 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {submitting ? "Creating Ticket..." : "Submit Ticket"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
