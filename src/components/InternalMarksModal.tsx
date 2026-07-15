import React from 'react';
import { X, Award, BarChart3, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../types';

interface InternalMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export default function InternalMarksModal({ isOpen, onClose, student }: InternalMarksModalProps) {
  const subjectsInternal = [
    { code: 'PHY-401', name: 'Quantum Mechanics', midSem: 14, assignment: 9, attendance: 4, total: 27 },
    { code: 'PHY-402', name: 'Electromagnetism', midSem: 13, assignment: 9, attendance: 4, total: 26 },
    { code: 'PHY-403', name: 'Statistical Mechanics', midSem: 12, assignment: 8, attendance: 4, total: 24 },
    { code: 'PHY-405', name: 'Mathematical Physics', midSem: 13, assignment: 9, attendance: 4, total: 26 },
  ];

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
            className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="bg-oxford-navy text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-prestige-gold" />
                <h3 className="font-serif font-bold text-base md:text-lg">Internal Assessment Ledger</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="bg-surface-container p-4 rounded-xl space-y-2">
                <h4 className="font-serif font-bold text-oxford-navy text-sm">Continuous Internal Assessment (CIA) Criteria</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Internal grades at Dhemaji College are aggregated out of a total of 30 Marks based on the following metrics:
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[10px]">
                  <div className="bg-white p-2 rounded-lg border border-outline-variant/30">
                    <span className="text-slate-gray font-bold block uppercase">Midterm Exam</span>
                    <span className="font-semibold text-oxford-navy text-xs">15 Marks Max</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-outline-variant/30">
                    <span className="text-slate-gray font-bold block uppercase">Assignments</span>
                    <span className="font-semibold text-oxford-navy text-xs">10 Marks Max</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-outline-variant/30">
                    <span className="text-slate-gray font-bold block uppercase">Attendance</span>
                    <span className="font-semibold text-oxford-navy text-xs">5 Marks Max</span>
                  </div>
                </div>
              </div>

              {/* Subject Tables */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-oxford-navy text-sm">Active Semester IV Scores</h4>
                <div className="space-y-3">
                  {subjectsInternal.map((sub) => (
                    <div key={sub.code} className="border border-outline-variant/30 rounded-xl p-3 bg-white space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-mono text-[10px] bg-oxford-navy/5 text-oxford-navy px-1.5 py-0.5 rounded font-bold">
                            {sub.code}
                          </span>
                          <span className="font-sans text-xs font-semibold text-oxford-navy ml-2">{sub.name}</span>
                        </div>
                        <span className="font-serif text-sm font-bold text-prestige-gold">
                          {sub.total} / 30 Marks
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1.5 border-t border-dashed border-outline-variant/20">
                        <div>
                          <span className="text-[9px] text-slate-gray uppercase">Sessional</span>
                          <p className="font-medium text-oxford-navy">{sub.midSem} / 15</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-gray uppercase">Assignment</span>
                          <p className="font-medium text-oxford-navy">{sub.assignment} / 10</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-gray uppercase">Attendance</span>
                          <p className="font-medium text-oxford-navy">{sub.attendance} / 5</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-surface-container border-t border-outline-variant/30 flex justify-end shrink-0">
              <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-bold bg-oxford-navy text-white hover:bg-oxford-navy/95 rounded-xl transition-colors cursor-pointer"
              >
                Close Ledger
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
