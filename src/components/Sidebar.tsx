import React from 'react';
import { X, BookOpen, Calendar, HelpCircle, Phone, Award, LogOut, RotateCcw, MapPin, Home, Image, Mail, Activity, LogIn, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onResetData: () => void;
  currentTab: string; // The parent page tab (e.g. 'home', 'portal', etc.)
  setTab: (tab: string) => void;
  portalSubTab: string; // The student portal sub-tab
  setPortalSubTab: (subTab: string) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  student,
  onResetData,
  currentTab,
  setTab,
  portalSubTab,
  setPortalSubTab,
  isLoggedIn = true,
  onLogout,
}: SidebarProps) {

  // Public items
  const publicItems = [
    { label: 'Home Page', value: 'home', icon: Home },
    { label: 'About College', value: 'about', icon: Award },
    { label: 'Academics Courses', value: 'academics', icon: BookOpen },
    { label: 'Official Notice Board', value: 'notices', icon: HelpCircle },
    { label: 'Campus Gallery', value: 'gallery', icon: Image },
    { label: 'Contact Us', value: 'contact', icon: MapPin },
    { label: 'AI Desk Admin Panel', value: 'admin-portal', icon: Activity },
  ];

  // Secure Portal sub-tabs
  const portalItems = [
    { label: 'Today\'s Schedule', value: 'dashboard', icon: Calendar },
    { label: 'Attendance Tracker', value: 'attendance', icon: Award },
    { label: 'Semester Grades', value: 'results', icon: BookOpen },
    { label: 'Fee Transactions', value: 'fees', icon: RotateCcw },
  ];

  const handleSelectPublic = (val: string) => {
    setTab(val);
    onClose();
  };

  const handleSelectPortalSub = (val: string) => {
    setTab('student-portal');
    setPortalSubTab(val);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 md:z-40"
          />

          {/* Drawer content panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[290px] sm:w-[335px] bg-white shadow-2xl z-55 flex flex-col border-r border-outline-variant/20 select-none font-sans"
          >
            {/* Header */}
            <div className="p-5 border-b border-outline-variant/30 bg-oxford-navy text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-serif text-lg font-bold tracking-tight text-prestige-gold">DHEMAJI COLLEGE</h3>
                <span className="text-[10px] text-white/70 font-mono uppercase tracking-wider">Estd: 1965 • NAAC 'A'</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white cursor-pointer"
                aria-label="Close sidebar drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable navigation area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* SECTION 1: PUBLIC NAVIGATION */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-gray uppercase px-2.5 tracking-wider mb-2">
                  College Web Pages
                </div>
                {publicItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => handleSelectPublic(item.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-oxford-navy text-white font-bold border-l-4 border-prestige-gold pl-2'
                          : 'text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-prestige-gold' : 'text-slate-gray'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-outline-variant/20 my-2" />

              {/* SECTION 2: SECURE PORTAL CONTROLS */}
              <div className="space-y-2 bg-prestige-gold/5 p-3 rounded-xl border border-prestige-gold/15">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center justify-between px-1 pb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-prestige-gold animate-pulse shrink-0" />
                        <span className="text-[10px] font-extrabold text-oxford-navy uppercase tracking-wider">
                          Student Zone (Active)
                        </span>
                      </div>
                      {onLogout && (
                        <button
                          onClick={() => {
                            onLogout();
                            onClose();
                          }}
                          className="text-[9px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <LogOut className="w-2.5 h-2.5" />
                          <span>Logout</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 px-1 py-1.5 border-b border-outline-variant/10">
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-9 h-9 rounded-full border border-prestige-gold object-cover shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-oxford-navy text-xs truncate">{student.name}</h4>
                        <p className="text-[9px] text-slate-gray font-mono truncate">{student.id} | {student.department}</p>
                      </div>
                    </div>

                    <div className="space-y-0.5 pt-1">
                      {portalItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentTab === 'student-portal' && portalSubTab === item.value;
                        return (
                          <button
                            key={item.value}
                            onClick={() => handleSelectPortalSub(item.value)}
                            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                              isActive
                                ? 'bg-oxford-navy text-white font-bold border-l-4 border-prestige-gold pl-1.5'
                                : 'text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-prestige-gold' : 'text-slate-gray'}`} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 px-2 space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-oxford-navy">Session Signed Out</p>
                      <p className="text-[9px] text-slate-gray">Access to academic reports requires student verification.</p>
                    </div>
                    <button
                      onClick={() => {
                        setTab('student-portal');
                        onClose();
                      }}
                      className="w-full py-1.5 px-3 bg-oxford-navy text-white hover:bg-oxford-navy/95 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <LogIn className="w-3 h-3 text-prestige-gold" />
                      <span>Log In to Portal</span>
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 3: QUICK CONTACT DETAILS */}
              <div className="space-y-1.5 bg-surface-container-low p-3 rounded-xl border border-outline-variant/10 text-[10px]">
                <div className="text-[9px] font-bold text-slate-gray uppercase tracking-wider mb-1">
                  Office Helpline
                </div>
                <div className="flex items-start gap-2.5 py-1 text-on-surface-variant">
                  <MapPin className="w-3.5 h-3.5 text-slate-gray shrink-0 mt-0.5" />
                  <span>College Road, Dhemaji, Assam, PIN-787057</span>
                </div>
                <div className="flex items-center gap-2.5 py-1 text-on-surface-variant font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-gray shrink-0" />
                  <span>+91 3753 224356</span>
                </div>
                <div className="flex items-center gap-2.5 py-1 text-on-surface-variant font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-gray shrink-0" />
                  <span>info@dhemajicollege.in</span>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low space-y-2 shrink-0">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all due sessional reports and payments back to defaults?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold py-2 px-3 border border-outline-variant rounded-xl hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Student Portal Demo
              </button>
              
              <div className="text-[9px] text-center text-slate-gray font-mono">
                Dhemaji College Workspace v2.0
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
