import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  MapPin,
  Clock,
  BarChart3,
  CreditCard,
  GraduationCap,
  Bell,
  Check,
  Award,
  AlertCircle,
  FileText,
  Volume2
} from 'lucide-react';
import { Student, CourseScheduleItem, NotificationItem } from '../types';

interface DashboardTabProps {
  student: Student;
  schedule: CourseScheduleItem[];
  notifications: NotificationItem[];
  onTabChange: (tab: string) => void;
  onOpenAdmitCard: () => void;
  onOpenInternalMarks: () => void;
  onToggleScheduleComplete: (id: string) => void;
}

export default function DashboardTab({
  student,
  schedule,
  notifications,
  onTabChange,
  onOpenAdmitCard,
  onOpenInternalMarks,
  onToggleScheduleComplete,
}: DashboardTabProps) {
  const [selectedClass, setSelectedClass] = useState<CourseScheduleItem | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20"
    >
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-oxford-navy p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 w-32 h-32 bg-prestige-gold/10 rounded-full blur-2xl -mr-8 -mt-8" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-prestige-gold overflow-hidden shrink-0 shadow-lg">
            <img
              className="w-full h-full object-cover"
              alt="Rahul Profile"
              src={student.photoUrl}
            />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">Welcome, {student.name}</h2>
            <p className="font-sans text-xs text-on-primary-container font-medium tracking-wide mt-0.5">
              ID: {student.id} | {student.department}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-3 gap-3">
        {/* Attendance Card */}
        <button
          onClick={() => onTabChange('attendance')}
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm hover:scale-102 transition-transform duration-200 cursor-pointer group"
          id="stat-attendance-card"
        >
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-gray mb-1 group-hover:text-oxford-navy transition-colors">
            Attendance
          </span>
          <span className="font-serif text-2xl font-bold text-oxford-navy">
            {student.attendancePercent}%
          </span>
          <div className="w-full h-1 bg-surface-container rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-prestige-gold rounded-full transition-all duration-500"
              style={{ width: `${student.attendancePercent}%` }}
            />
          </div>
        </button>

        {/* CGPA Card */}
        <button
          onClick={() => onTabChange('results')}
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm hover:scale-102 transition-transform duration-200 cursor-pointer group"
          id="stat-cgpa-card"
        >
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-gray mb-1 group-hover:text-oxford-navy transition-colors">
            CGPA
          </span>
          <span className="font-serif text-2xl font-bold text-oxford-navy">
            {student.cgpa}
          </span>
          <span className="text-[9px] bg-prestige-gold/15 text-prestige-gold font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider mt-1.5 font-sans">
            Dean's List
          </span>
        </button>

        {/* Fees Due Card */}
        <button
          onClick={() => onTabChange('fees')}
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm hover:scale-102 transition-transform duration-200 cursor-pointer group"
          id="stat-fees-card"
        >
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-gray mb-1 group-hover:text-oxford-navy transition-colors">
            Fees Due
          </span>
          <span className={`font-serif text-2xl font-bold ${student.feesDue > 0 ? 'text-error' : 'text-oxford-navy'}`}>
            ₹{student.feesDue}
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider mt-1.5 font-sans ${
            student.feesDue > 0 
              ? 'bg-error-container text-on-error-container' 
              : 'bg-green-100 text-green-700'
          }`}>
            {student.feesDue > 0 ? 'Pending' : 'Paid'}
          </span>
        </button>
      </section>

      {/* Today's Schedule */}
      <section className="space-y-3">
        <div className="flex justify-between items-end px-1">
          <h3 className="font-serif text-xl font-bold text-oxford-navy">Today's Schedule</h3>
          <span className="font-sans text-xs font-semibold text-prestige-gold bg-prestige-gold/10 px-2 py-0.5 rounded-full">
            {schedule[0]?.date || "Sept 24, Tuesday"}
          </span>
        </div>

        <div className="space-y-3">
          {schedule.map((item) => (
            <div
              key={item.id}
              className={`glass-card p-4 rounded-xl flex justify-between items-center transition-all relative ${
                item.completed ? 'opacity-65 border-l-4 border-outline-variant/30' : ''
              } ${item.prestigeBorder ? 'prestige-border shadow-md' : 'border-l-4 border-outline-variant/20'}`}
            >
              <div 
                className="flex flex-col cursor-pointer flex-1"
                onClick={() => setSelectedClass(selectedClass?.id === item.id ? null : item)}
              >
                <span className={`text-xs font-bold font-sans ${item.completed ? 'text-slate-gray' : 'text-prestige-gold'}`}>
                  {item.time}
                </span>
                <h4 className="font-sans text-base font-semibold text-oxford-navy mt-0.5">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-gray flex items-center gap-1 mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-prestige-gold" />
                  {item.location}
                </p>

                {/* Expanded details (Syllabus/Instructor Mock info) */}
                {selectedClass?.id === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-3 border-t border-outline-variant/20 text-xs text-on-surface-variant space-y-1.5"
                  >
                    <div><span className="font-semibold text-oxford-navy">Instructor:</span> Dr. Amit Baruah</div>
                    <div><span className="font-semibold text-oxford-navy">Topics Today:</span> Core principles, derivations and experiment guidelines.</div>
                    <div><span className="font-semibold text-oxford-navy">Prerequisite:</span> Read Chapter 4 and review formulas.</div>
                  </motion.div>
                )}
              </div>

              {/* Completion checkbox/indicator */}
              <button
                onClick={() => onToggleScheduleComplete(item.id)}
                className="p-1.5 hover:bg-surface-container rounded-full text-slate-gray hover:text-oxford-navy transition-colors cursor-pointer ml-2"
                title={item.completed ? "Mark incomplete" : "Mark attended"}
              >
                {item.completed ? (
                  <CheckCircle className="w-5.5 h-5.5 text-green-600 fill-green-50" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-outline-variant" />
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Access shortcuts */}
      <section className="space-y-3">
        <h3 className="font-serif text-xl font-bold text-oxford-navy px-1">Quick Access</h3>
        <div className="grid grid-cols-4 gap-3">
          {/* Internal Marks */}
          <button
            onClick={onOpenInternalMarks}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-oxford-navy hover:text-white flex items-center justify-center text-oxford-navy group-active:scale-90 transition-all duration-200 shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center text-on-surface-variant group-hover:text-oxford-navy">
              Internal Marks
            </span>
          </button>

          {/* Fee Payment */}
          <button
            onClick={() => onTabChange('fees')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-oxford-navy hover:text-white flex items-center justify-center text-oxford-navy group-active:scale-90 transition-all duration-200 shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center text-on-surface-variant group-hover:text-oxford-navy">
              Fee Payment
            </span>
          </button>

          {/* Result */}
          <button
            onClick={() => onTabChange('results')}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-oxford-navy hover:text-white flex items-center justify-center text-oxford-navy group-active:scale-90 transition-all duration-200 shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center text-on-surface-variant group-hover:text-oxford-navy">
              Result
            </span>
          </button>

          {/* Admit Card */}
          <button
            onClick={onOpenAdmitCard}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-oxford-navy hover:text-white flex items-center justify-center text-oxford-navy group-active:scale-90 transition-all duration-200 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-center text-on-surface-variant group-hover:text-oxford-navy">
              Admit Card
            </span>
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-3 pb-8">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-serif text-xl font-bold text-oxford-navy">Notifications</h3>
          <button 
            onClick={() => onTabChange('results')}
            className="text-xs text-prestige-gold font-bold uppercase tracking-wider hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>
        <div className="space-y-2">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`glass-card p-4 rounded-xl flex gap-3 items-start transition-all ${
                item.type === 'pending' ? 'border-l-2 border-prestige-gold' : 'border-l-2 border-outline-variant/30'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                item.type === 'pending'
                  ? 'bg-prestige-gold/10 text-prestige-gold'
                  : item.type === 'due'
                    ? 'bg-error-container text-on-error-container'
                    : 'bg-surface-container-highest text-oxford-navy'
              }`}>
                {item.type === 'pending' && <FileText className="w-4 h-4" />}
                {item.type === 'due' && <AlertCircle className="w-4 h-4" />}
                {item.type === 'announcement' && <Volume2 className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <h5 className="font-sans text-sm font-semibold text-oxford-navy">
                  {item.title}
                </h5>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {item.description}
                </p>
                <span className="text-[9px] text-slate-gray uppercase font-bold mt-1.5 block">
                  {item.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
