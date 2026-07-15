import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, Calendar, ShieldCheck, AlertTriangle, BookOpen, RefreshCw } from 'lucide-react';
import { SubjectAttendance } from '../types';

interface AttendanceTabProps {
  subjectAttendance: SubjectAttendance[];
  onAddAttendance: (id: string, attended: boolean) => void;
}

export default function AttendanceTab({
  subjectAttendance,
  onAddAttendance,
}: AttendanceTabProps) {
  const [selectedEstimatorSubject, setSelectedEstimatorSubject] = useState<string>(
    subjectAttendance[0]?.id || ''
  );
  const [futureAttend, setFutureAttend] = useState<number>(5);
  const [futureMiss, setFutureMiss] = useState<number>(0);

  // Overall statistics
  const totalAttended = subjectAttendance.reduce((acc, curr) => acc + curr.attendedClasses, 0);
  const totalClasses = subjectAttendance.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const overallPercent = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 0;

  const currentSubject = subjectAttendance.find((s) => s.id === selectedEstimatorSubject);

  // Calculate simulated attendance
  let simulatedPercent = 0;
  if (currentSubject) {
    const newAttended = currentSubject.attendedClasses + futureAttend;
    const newTotal = currentSubject.totalClasses + futureAttend + futureMiss;
    simulatedPercent = newTotal > 0 ? Math.round((newAttended / newTotal) * 1000) / 10 : 0;
  }

  // Get color for progress bar
  const getProgressColor = (percent: number) => {
    if (percent < 75) return 'bg-error'; // Red (Danger)
    if (percent < 80) return 'bg-amber-500'; // Amber (Borderline)
    return 'bg-green-600'; // Green (Safe)
  };

  const getTextColor = (percent: number) => {
    if (percent < 75) return 'text-error';
    if (percent < 80) return 'text-amber-600';
    return 'text-green-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20"
    >
      {/* Overview Card */}
      <section className="glass-card p-6 rounded-2xl shadow-md border-t-4 border-prestige-gold">
        <h3 className="font-serif text-lg font-bold text-oxford-navy mb-4">Overall Attendance Status</h3>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG circular progress ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="54"
                className="stroke-surface-container"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="54"
                className="stroke-prestige-gold transition-all duration-500"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${((100 - overallPercent) / 100) * (2 * Math.PI * 54)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="font-serif text-3xl font-bold text-oxford-navy">{overallPercent}%</span>
              <p className="text-[10px] text-slate-gray font-bold uppercase tracking-wider">Overall</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 w-full">
            <div className="flex justify-between text-sm">
              <span className="text-slate-gray font-medium">Total Classes Scheduled:</span>
              <span className="font-bold text-oxford-navy">{totalClasses} Lectures</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-gray font-medium">Lectures Attended:</span>
              <span className="font-bold text-green-600">{totalAttended} Lectures</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-gray font-medium">Lectures Missed:</span>
              <span className="font-bold text-error">{totalClasses - totalAttended} Lectures</span>
            </div>
            <div className="h-px bg-outline-variant/30 my-2" />
            <div className="flex items-center gap-2 text-xs">
              {overallPercent >= 75 ? (
                <div className="flex items-center gap-1.5 text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Good Standing (Exceeds 75% criteria)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-error font-bold bg-error-container/30 px-2.5 py-1 rounded-full">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Shortage Warning (Below 75% threshold)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Subject-Wise breakdown list */}
      <section className="space-y-3">
        <h3 className="font-serif text-xl font-bold text-oxford-navy px-1">Subject-Wise Breakdown</h3>
        <div className="space-y-3">
          {subjectAttendance.map((subject) => (
            <div key={subject.id} className="glass-card p-4 rounded-xl shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-gray uppercase">
                    {subject.subjectCode}
                  </span>
                  <h4 className="font-sans text-base font-semibold text-oxford-navy">
                    {subject.subjectName}
                  </h4>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold font-serif ${getTextColor(subject.attendancePercent)}`}>
                    {subject.attendancePercent}%
                  </span>
                  <p className="text-[10px] text-slate-gray font-bold">
                    {subject.attendedClasses}/{subject.totalClasses} classes
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getProgressColor(
                    subject.attendancePercent
                  )}`}
                  style={{ width: `${subject.attendancePercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-outline-variant/10">
                <span className="text-[10px] text-slate-gray italic">
                  Last Class: {subject.lastAttended}
                </span>

                {/* Instant Mock Log Interaction */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-gray">Log today's class:</span>
                  <button
                    onClick={() => onAddAttendance(subject.id, true)}
                    className="p-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded transition-colors cursor-pointer"
                    title="Mark Present"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onAddAttendance(subject.id, false)}
                    className="p-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded transition-colors cursor-pointer"
                    title="Mark Absent"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What-If Interactive Simulator */}
      <section className="glass-card p-5 rounded-2xl shadow-md space-y-4">
        <h3 className="font-serif text-lg font-bold text-oxford-navy flex items-center gap-1.5">
          <BookOpen className="w-5 h-5 text-prestige-gold" />
          What-If Attendance Estimator
        </h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Select a subject and predict how upcoming lecture attendances/absences will influence your standing.
        </p>

        <div className="space-y-3.5 pt-1">
          {/* Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-gray uppercase mb-1.5">
              Select Subject
            </label>
            <select
              value={selectedEstimatorSubject}
              onChange={(e) => setSelectedEstimatorSubject(e.target.value)}
              className="w-full text-sm bg-surface-container-low border border-outline-variant/50 rounded-xl p-2.5 text-oxford-navy font-medium outline-none focus:border-prestige-gold"
              id="estimator-subject-select"
            >
              {subjectAttendance.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.subjectCode} - {sub.subjectName} (Current: {sub.attendancePercent}%)
                </option>
              ))}
            </select>
          </div>

          {/* Schedulers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-gray uppercase mb-1">
                Attend Next Classes
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={futureAttend}
                  onChange={(e) => setFutureAttend(parseInt(e.target.value) || 0)}
                  className="w-full accent-prestige-gold"
                />
                <span className="font-bold text-sm text-oxford-navy w-6 text-center">{futureAttend}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-gray uppercase mb-1">
                Skip Next Classes
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={futureMiss}
                  onChange={(e) => setFutureMiss(parseInt(e.target.value) || 0)}
                  className="w-full accent-error"
                />
                <span className="font-bold text-sm text-oxford-navy w-6 text-center">{futureMiss}</span>
              </div>
            </div>
          </div>

          {/* Results Comparison View */}
          {currentSubject && (
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-gray uppercase font-bold">Estimated Result</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-2xl font-serif font-bold ${getTextColor(simulatedPercent)}`}>
                    {simulatedPercent}%
                  </span>
                  <span className="text-xs text-slate-gray font-mono">
                    (Current: {currentSubject.attendancePercent}%)
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Estimated ratio: <span className="font-bold">{currentSubject.attendedClasses + futureAttend}</span> out of <span className="font-bold">{currentSubject.totalClasses + futureAttend + futureMiss}</span> classes.
                </p>
              </div>

              <div className="text-right">
                {simulatedPercent >= 75 ? (
                  <div className="text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg flex flex-col items-center">
                    <Check className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Eligible</span>
                  </div>
                ) : (
                  <div className="text-error bg-error-container/20 border border-error/20 px-3 py-1.5 rounded-lg flex flex-col items-center">
                    <X className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Ineligible</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
