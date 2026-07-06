import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields!");
      return;
    }

    setLoading(true);
    // Construct mailto link
    const mailtoSubject = encodeURIComponent(form.subject);
    const mailtoBody = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );
    
    // Open mailto
    window.location.href = `mailto:nullsatcksloutions@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    setTimeout(() => {
      toast.success("Opening your mail application...");
      setForm({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      "Hello Null Stack Solutions team! I am looking for assistance regarding the school ERP system."
    );
    window.open(`https://wa.me/923076048509?text=${text}`, "_blank");
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-md border border-slate-100/85 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-md">
            <Mail size={26} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Contact Developer Support</h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">We would love to hear from you</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Contact Form */}
        <div className="lg:col-span-3 bg-white rounded-md border border-slate-100/85 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 mb-2">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
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
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
                className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Type your message here..."
                rows={5}
                className="w-full px-3 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded outline-none focus:border-indigo-500 focus:bg-white transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded text-xs font-bold shadow-md shadow-indigo-600/10 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send size={14} />
              {loading ? "Opening Mail App..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Right Column: Contact Details & WhatsApp Button */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Info Card */}
          <div className="bg-white rounded-md border border-slate-100/85 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 mb-2">
              Developer Information
            </h2>

            <div className="space-y-4 text-xs text-slate-500">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-700 font-bold">Address</strong>
                  <span className="leading-relaxed">Nullstack Solutions, Gulberg, Lahore, Pakistan</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-700 font-bold">Phone Number</strong>
                  <span>+92 307 6048509</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-700 font-bold">Email Address</strong>
                  <span>nullsatcksloutions@gmail.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-700 font-bold">Support Hours</strong>
                  <span>Mon - Sat: 08:00 AM - 02:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Chat Card */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-md p-6 space-y-3.5 shadow-sm">
            <h3 className="text-sm font-extrabold text-emerald-800 flex items-center gap-2">
              <MessageCircle size={18} className="text-emerald-600" /> WhatsApp Support
            </h3>
            <p className="text-xs text-emerald-700/80 leading-relaxed font-semibold">
              Instant help is just a click away! Chat directly with our developer support team on WhatsApp.
            </p>
            <button
              onClick={handleWhatsApp}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded text-xs font-bold shadow-md shadow-emerald-600/10 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageCircle size={14} />
              Chat on WhatsApp
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
