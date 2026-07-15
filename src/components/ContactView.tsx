import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactView() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Enquiry',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all required fields (Name, Email, Message).');
      return;
    }
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Enquiry',
        message: ''
      });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-10 pb-16 font-sans"
    >
      {/* Title */}
      <section className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-prestige-gold">Get In Touch</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-oxford-navy font-serif">Contact Information</h2>
        <p className="text-xs text-slate-gray max-w-xl mx-auto">
          Contact our principal's office, administrative admission cell, sessional controller, or IT support regarding any academic, fee, or portal queries.
        </p>
        <div className="h-0.5 w-24 bg-prestige-gold mx-auto mt-2" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact info grid (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold text-oxford-navy border-b border-outline-variant/20 pb-3">
              College Secretariat
            </h3>

            <div className="space-y-4 text-xs md:text-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-prestige-gold/10 text-prestige-gold flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-gray font-bold uppercase block">Postal Address</span>
                  <p className="font-semibold text-oxford-navy mt-0.5">
                    Dhemaji College, College Road, <br />
                    District: Dhemaji, Assam, PIN-787057, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-prestige-gold/10 text-prestige-gold flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-gray font-bold uppercase block">Helpline Contacts</span>
                  <p className="font-semibold text-oxford-navy mt-0.5 font-mono">
                    +91 3753 224356 (Admin Office) <br />
                    +91 3753 224320 (Principal Office)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-prestige-gold/10 text-prestige-gold flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-gray font-bold uppercase block">Official Emails</span>
                  <p className="font-semibold text-oxford-navy mt-0.5 font-mono">
                    principal@dhemajicollege.in <br />
                    info@dhemajicollege.in
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-prestige-gold/10 text-prestige-gold flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-gray font-bold uppercase block">Office Hours</span>
                  <p className="font-semibold text-oxford-navy mt-0.5">
                    Monday – Saturday: 09:30 AM to 04:00 PM <br />
                    <span className="text-[10px] text-slate-gray">(Closed on Sundays & Gazetted Holidays)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Styled Map Widget (Safe from Iframe constraints) */}
          <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-sm space-y-3">
            <h4 className="font-sans font-bold text-xs text-oxford-navy uppercase tracking-wider">
              College Location Map
            </h4>
            
            {/* Visual simulation of Google Map */}
            <div className="h-44 rounded-xl bg-sky-100 border border-sky-200 relative overflow-hidden flex items-center justify-center">
              {/* Abstract Map Art */}
              <div className="absolute inset-0 opacity-40">
                <div className="absolute top-0 left-12 w-0.5 h-full bg-slate-400" />
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-400" />
                <div className="absolute bottom-6 left-0 w-full h-1 bg-yellow-400 rotate-12" />
                <div className="absolute top-6 left-24 w-1 h-full bg-slate-400 -rotate-12" />
                {/* Forest/Greenery shapes */}
                <div className="absolute top-2 left-4 w-12 h-10 bg-green-200 rounded-full" />
                <div className="absolute bottom-4 right-12 w-20 h-14 bg-green-200 rounded-full" />
                <div className="absolute top-16 right-4 w-16 h-12 bg-sky-200 rounded-full" />
              </div>

              {/* Marker pin */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-4 h-4 bg-red-600 rounded-full animate-ping absolute top-0" />
                <MapPin className="w-8 h-8 text-red-600 drop-shadow-md relative z-10" />
                <div className="bg-oxford-navy text-white text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 whitespace-nowrap shadow border border-prestige-gold">
                  Dhemaji College, Assam
                </div>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Dhemaji+College+Assam"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center border border-outline hover:border-oxford-navy text-oxford-navy hover:bg-oxford-navy hover:text-white font-bold text-xs py-2 rounded-xl transition-all block cursor-pointer"
            >
              Open in Google Maps
            </a>
          </div>
        </div>

        {/* Enquiry form (7 columns) */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold text-oxford-navy border-b border-outline-variant/20 pb-3">
              College Enquiry & Grievance Form
            </h3>

            {isSubmitted ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3 py-12"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-sans font-bold text-green-900 text-base">Inquiry Dispatched Successfully!</h4>
                <p className="text-xs text-green-700 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out to Dhemaji College. Your query has been logged in our administrative secretariat. We will get back to you within 24–48 working hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-gray uppercase">Your Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Borah"
                      className="w-full bg-surface-container-low border border-outline-variant/25 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-prestige-gold transition-colors text-on-surface"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-gray uppercase">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full bg-surface-container-low border border-outline-variant/25 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-prestige-gold transition-colors text-on-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-gray uppercase">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98452 10200"
                      className="w-full bg-surface-container-low border border-outline-variant/25 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-prestige-gold transition-colors text-on-surface"
                    />
                  </div>

                  {/* Subject field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-gray uppercase">Enquiry Topic</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/25 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-prestige-gold transition-colors text-on-surface"
                    >
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Admission Criteria">Admission Criteria</option>
                      <option value="Hostel Accommodation">Hostel Accommodation</option>
                      <option value="Sessional / Exams">Sessional / Exams</option>
                      <option value="Portal Issues">Portal Issues</option>
                    </select>
                  </div>
                </div>

                {/* Message field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-gray uppercase">Detailed Message <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry, registration issues, or details..."
                    className="w-full bg-surface-container-low border border-outline-variant/25 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-prestige-gold transition-colors text-on-surface resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-oxford-navy text-white hover:bg-oxford-navy/95 font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Dispatch Secretariat Message</span>
                  <Send className="w-3.5 h-3.5 text-prestige-gold" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
