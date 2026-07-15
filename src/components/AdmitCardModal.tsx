import React from 'react';
import { X, Printer, Download, Check, Award, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../types';

interface AdmitCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export default function AdmitCardModal({ isOpen, onClose, student }: AdmitCardModalProps) {
  const examSchedule = [
    { code: 'PHY-401', name: 'Quantum Mechanics', date: 'Nov 12, 2026', time: '10:00 AM - 01:00 PM', room: 'Block B, Hall 1' },
    { code: 'PHY-402', name: 'Electromagnetism', date: 'Nov 15, 2026', time: '10:00 AM - 01:00 PM', room: 'Block B, Hall 1' },
    { code: 'PHY-403', name: 'Statistical Mechanics', date: 'Nov 18, 2026', time: '10:00 AM - 01:00 PM', room: 'Block A, Room 204' },
    { code: 'PHY-405', name: 'Mathematical Physics', date: 'Nov 22, 2026', time: '10:00 AM - 01:00 PM', room: 'Block B, Hall 2' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[90vh]"
          >
            {/* Header / Actions toolbar */}
            <div className="bg-oxford-navy text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-prestige-gold" />
                <h3 className="font-serif font-bold text-base md:text-lg">Examination Admit Card</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer"
                  title="Print Admit Card"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Area */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-[#fcfcfc] print-container">
              {/* College Credentials Heading */}
              <div className="text-center pb-6 border-b-2 border-oxford-navy flex flex-col items-center">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-oxford-navy tracking-tight">
                  DHEMAJI COLLEGE
                </h2>
                <p className="text-xs uppercase tracking-widest text-prestige-gold font-semibold mt-1">
                  Established: 1965 | Affiliated to Dibrugarh University
                </p>
                <p className="text-sm font-semibold text-slate-gray mt-1 bg-surface-container px-3 py-1 rounded-full">
                  ADMIT CARD - END SEMESTER EXAMINATION (NOV 2026)
                </p>
              </div>

              {/* Student Metadata Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 py-6 border-b border-outline-variant/50">
                <div className="sm:col-span-3 space-y-3.5 text-sm">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-gray font-medium">Candidate Name:</span>
                    <span className="col-span-2 text-oxford-navy font-bold">{student.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-gray font-medium">Student Roll ID:</span>
                    <span className="col-span-2 text-oxford-navy font-mono font-semibold">{student.id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-gray font-medium">Academic Program:</span>
                    <span className="col-span-2 text-oxford-navy font-medium">{student.department}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-gray font-medium">Semester:</span>
                    <span className="col-span-2 text-oxford-navy font-medium">Semester IV (B.Sc Physics)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-gray font-medium">Exam Centre:</span>
                    <span className="col-span-2 text-oxford-navy font-semibold">Dhemaji College Science Block B (Centre-01)</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center shrink-0">
                  <div className="w-28 h-28 border-2 border-oxford-navy rounded-lg overflow-hidden shadow-md">
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] text-slate-gray font-mono mt-1 select-none">Verified Identity</span>
                </div>
              </div>

              {/* Exam Timings Table */}
              <div className="py-6">
                <h4 className="font-serif font-bold text-oxford-navy mb-3 text-base flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-prestige-gold"></span>
                  EXAMINATION DATE SHEET & VENUE
                </h4>
                <div className="overflow-x-auto rounded-xl border border-outline-variant/40 shadow-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-oxford-navy text-white text-xs uppercase tracking-wider">
                        <th className="p-3">Course Code</th>
                        <th className="p-3">Subject Name</th>
                        <th className="p-3">Exam Date</th>
                        <th className="p-3">Session</th>
                        <th className="p-3">Venue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 text-on-surface bg-white">
                      {examSchedule.map((exam) => (
                        <tr key={exam.code} className="hover:bg-surface-container-lowest/50">
                          <td className="p-3 font-mono font-semibold text-oxford-navy">{exam.code}</td>
                          <td className="p-3 font-medium text-on-surface">{exam.name}</td>
                          <td className="p-3 font-semibold text-slate-gray">{exam.date}</td>
                          <td className="p-3 text-xs text-on-surface-variant">{exam.time}</td>
                          <td className="p-3 text-xs text-on-surface-variant font-medium">{exam.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Security Seal & Verification Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-dashed border-outline-variant mt-4">
                <div className="flex flex-col items-center sm:items-start text-xs text-on-surface-variant space-y-1.5">
                  <span className="font-semibold text-oxford-navy">Important Candidate Instructions:</span>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>Report to the exam center 30 minutes before schedule.</li>
                    <li>Carry physical college identity card along with this admit card.</li>
                    <li>Electronic devices and calculators are strictly prohibited.</li>
                  </ul>
                </div>

                <div className="flex justify-around items-end">
                  {/* Mock Stamp Seal */}
                  <div className="w-20 h-20 border-2 border-dashed border-[#ff6b6b]/40 rounded-full flex flex-col items-center justify-center text-[8px] text-[#ff6b6b] font-bold font-mono rotate-12 shrink-0">
                    <span>DHEMAJI COLL</span>
                    <span className="border-y border-[#ff6b6b]/40 py-0.5 my-0.5 px-1 uppercase">OFFICIAL SEAL</span>
                    <span>ASSAM</span>
                  </div>

                  {/* Principal Sign */}
                  <div className="text-center flex flex-col items-center shrink-0">
                    <span className="font-serif italic text-sm text-oxford-navy/80 font-bold tracking-wide border-b border-slate-gray pb-0.5 px-3 mb-1 select-none">
                      Dr. Dipak Kr. Neog
                    </span>
                    <span className="text-[10px] text-slate-gray uppercase font-bold tracking-wider">Controller of Exams</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-surface-container border-t border-outline-variant/30 flex justify-end gap-3 shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium hover:bg-surface-container-high rounded-xl text-on-surface transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm font-medium bg-oxford-navy text-white hover:bg-oxford-navy/95 hover:shadow rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print PDF / Admit Card
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
