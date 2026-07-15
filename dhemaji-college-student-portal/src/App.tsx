import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Public views
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import AcademicsView from './components/AcademicsView';
import NoticesView from './components/NoticesView';
import GalleryView from './components/GalleryView';
import ContactView from './components/ContactView';

// Student Portal views
import DashboardTab from './components/DashboardTab';
import AttendanceTab from './components/AttendanceTab';
import ResultsTab from './components/ResultsTab';
import FeesTab from './components/FeesTab';
import AdmitCardModal from './components/AdmitCardModal';
import InternalMarksModal from './components/InternalMarksModal';

import {
  INITIAL_STUDENT,
  COURSE_SCHEDULE,
  NOTIFICATIONS,
  SUBJECT_ATTENDANCE,
  SEMESTER_RESULTS,
  INITIAL_FEES,
} from './data';
import { Student, CourseScheduleItem, NotificationItem, SubjectAttendance, FeeItem } from './types';
import { Calendar, Award, BookOpen, RotateCcw, Home, Clock, MapPin } from 'lucide-react';

export default function App() {
  // 1. Core State Managers (Mock Sessional Database)
  const [student, setStudent] = useState<Student>(INITIAL_STUDENT);
  const [schedule, setSchedule] = useState<CourseScheduleItem[]>(COURSE_SCHEDULE);
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS);
  const [fees, setFees] = useState<FeeItem[]>(INITIAL_FEES);
  const [subjectAttendance, setSubjectAttendance] = useState<SubjectAttendance[]>(SUBJECT_ATTENDANCE);
  
  // 2. Navigation State Managers
  const [currentTab, setCurrentTab] = useState<string>('home'); // Defaults to public Home Page
  const [portalSubTab, setPortalSubTab] = useState<string>('dashboard'); // Defaults to Portal Overview
  
  // 3. UI states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmitCardOpen, setIsAdmitCardOpen] = useState(false);
  const [isInternalMarksOpen, setIsInternalMarksOpen] = useState(false);

  // Auto scroll back to top on tab swap
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab, portalSubTab]);

  // Reset sessional metrics demo state
  const handleResetData = () => {
    setStudent(INITIAL_STUDENT);
    setSchedule(COURSE_SCHEDULE);
    setNotifications(NOTIFICATIONS);
    setFees(INITIAL_FEES);
    setSubjectAttendance(SUBJECT_ATTENDANCE);
    setCurrentTab('student-portal');
    setPortalSubTab('dashboard');
  };

  // Toggle checklist course items
  const handleToggleScheduleComplete = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // What-If sessional classes predictor
  const handleAddAttendance = (subjectId: string, attended: boolean) => {
    setSubjectAttendance((prev) =>
      prev.map((sub) => {
        if (sub.id === subjectId) {
          const newAttended = sub.attendedClasses + (attended ? 1 : 0);
          const newTotal = sub.totalClasses + 1;
          return {
            ...sub,
            attendedClasses: newAttended,
            totalClasses: newTotal,
            attendancePercent: Math.round((newAttended / newTotal) * 1000) / 10,
            lastAttended: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          };
        }
        return sub;
      })
    );
  };

  // Online invoice payment gateway simulation
  const handlePayFee = (feeId: string, transactionId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setFees((prev) =>
      prev.map((f) =>
        f.id === feeId
          ? { ...f, status: 'paid', transactionId, paymentDate: todayStr }
          : f
      )
    );
  };

  // Reactively compute student metrics
  const computedStudent = useMemo(() => {
    const totalDue = fees
      .filter((f) => f.status !== 'paid')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalPaid = fees
      .filter((f) => f.status === 'paid')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalAttendedCount = subjectAttendance.reduce((acc, curr) => acc + curr.attendedClasses, 0);
    const totalLecturesCount = subjectAttendance.reduce((acc, curr) => acc + curr.totalClasses, 0);
    const calculatedAttendancePercent = totalLecturesCount > 0 
      ? Math.round((totalAttendedCount / totalLecturesCount) * 100) 
      : 0;

    return {
      ...student,
      feesDue: totalDue,
      feesPaid: totalPaid,
      attendancePercent: calculatedAttendancePercent,
    };
  }, [student, fees, subjectAttendance]);

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col antialiased">
      {/* 1. TOP HEADER & ACCREDITATION BANNER */}
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentTab={currentTab}
        setTab={setCurrentTab}
      />

      {/* 2. RESPONSIVE MOBILE NAVIGATION DRAWER */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        student={computedStudent}
        onResetData={handleResetData}
        currentTab={currentTab}
        setTab={setCurrentTab}
        portalSubTab={portalSubTab}
        setPortalSubTab={setPortalSubTab}
      />

      {/* 3. DYNAMIC CONTENT AREA */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* PUBLIC WEBPAGE VIEWS */}
        {currentTab === 'home' && (
          <HomeView onTabChange={setCurrentTab} />
        )}

        {currentTab === 'about' && (
          <AboutView />
        )}

        {currentTab === 'academics' && (
          <AcademicsView />
        )}

        {currentTab === 'notices' && (
          <NoticesView />
        )}

        {currentTab === 'gallery' && (
          <GalleryView />
        )}

        {currentTab === 'contact' && (
          <ContactView />
        )}

        {/* SECURE STUDENT PORTAL ENGINE */}
        {currentTab === 'student-portal' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Desktop Left-Hand Student Sidebar panel */}
            <aside className="hidden lg:block lg:col-span-1 space-y-6">
              <div className="glass-card p-5 rounded-2xl shadow-sm border border-outline-variant/30 space-y-4">
                
                {/* Small Profile Card */}
                <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
                  <img
                    src={computedStudent.photoUrl}
                    alt={computedStudent.name}
                    className="w-12 h-12 rounded-full border border-prestige-gold object-cover shadow-sm"
                  />
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-oxford-navy text-sm leading-tight truncate">{computedStudent.name}</h4>
                    <p className="text-[10px] text-slate-gray font-mono">{computedStudent.id}</p>
                    <p className="text-[10px] text-prestige-gold font-bold mt-0.5 truncate">{computedStudent.department}</p>
                  </div>
                </div>

                {/* Sessional GPA metrics widget */}
                <div className="space-y-1.5 p-3 rounded-xl bg-oxford-navy/5 border border-oxford-navy/10">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-gray">Attendance:</span>
                    <span className="font-mono font-bold text-oxford-navy">{computedStudent.attendancePercent}%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-gray">Current CGPA:</span>
                    <span className="font-mono font-bold text-oxford-navy">{computedStudent.cgpa}</span>
                  </div>
                </div>

                {/* Sub-tab Selection rail */}
                <nav className="flex flex-col gap-1 text-xs font-semibold">
                  {[
                    { label: 'Today\'s Schedule', value: 'dashboard', icon: Home },
                    { label: 'Attendance Tracker', value: 'attendance', icon: Calendar },
                    { label: 'Semester Grades', value: 'results', icon: BookOpen },
                    { label: 'Fee Transactions', value: 'fees', icon: RotateCcw },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = portalSubTab === item.value;
                    return (
                      <button
                        key={item.value}
                        onClick={() => setPortalSubTab(item.value)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                          isActive
                            ? 'bg-oxford-navy text-white font-bold'
                            : 'text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-prestige-gold' : 'text-slate-gray'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Office helpline banner */}
              <div className="bg-oxford-navy text-white p-4 rounded-2xl border border-oxford-navy/10 space-y-2 text-[11px]">
                <span className="text-[9px] font-bold text-prestige-gold uppercase tracking-wider block">Portal Support Desk</span>
                <p className="text-white/80">Need help updating your exam form registrations or sessional score ledger?</p>
                <p className="font-bold text-prestige-gold font-mono">+91 3753 224356</p>
              </div>
            </aside>

            {/* Portal Center Panel (Renders selected sub-tab) */}
            <main className="lg:col-span-3">
              {portalSubTab === 'dashboard' && (
                <DashboardTab
                  student={computedStudent}
                  schedule={schedule}
                  notifications={notifications}
                  onTabChange={setPortalSubTab}
                  onOpenAdmitCard={() => setIsAdmitCardOpen(true)}
                  onOpenInternalMarks={() => setIsInternalMarksOpen(true)}
                  onToggleScheduleComplete={handleToggleScheduleComplete}
                />
              )}

              {portalSubTab === 'attendance' && (
                <AttendanceTab
                  subjectAttendance={subjectAttendance}
                  onAddAttendance={handleAddAttendance}
                />
              )}

              {portalSubTab === 'results' && (
                <ResultsTab
                  student={computedStudent}
                  semesterResults={SEMESTER_RESULTS}
                  onOpenInternalMarks={() => setIsInternalMarksOpen(true)}
                />
              )}

              {portalSubTab === 'fees' && (
                <FeesTab
                  student={computedStudent}
                  fees={fees}
                  onPayFee={handlePayFee}
                />
              )}
            </main>
          </div>
        )}
      </div>

      {/* 4. OFFICIAL DHEMAJI COLLEGE FOOTER */}
      <CollegeFooter setTab={setCurrentTab} />

      {/* 5. PORTAL MOBILE SUB-NAVIGATION BAR (Only visible inside Student Portal) */}
      {currentTab === 'student-portal' && (
        <nav className="fixed bottom-0 left-0 w-full z-30 bg-white/95 backdrop-blur-md border-t border-outline-variant/30 shadow-lg lg:hidden flex justify-around items-center h-16 px-2">
          {[
            { label: 'Overview', value: 'dashboard', icon: Home },
            { label: 'Attendance', value: 'attendance', icon: Calendar },
            { label: 'Results', value: 'results', icon: BookOpen },
            { label: 'Fees Due', value: 'fees', icon: RotateCcw },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = portalSubTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setPortalSubTab(item.value)}
                className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-prestige-gold bg-oxford-navy/5 font-bold scale-105'
                    : 'text-slate-gray hover:text-oxford-navy'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] tracking-wide font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Admit Card Verification Popup Modal */}
      <AdmitCardModal
        isOpen={isAdmitCardOpen}
        onClose={() => setIsAdmitCardOpen(false)}
        student={computedStudent}
      />

      {/* Internal Marks Ledger Popup Modal */}
      <InternalMarksModal
        isOpen={isInternalMarksOpen}
        onClose={() => setIsInternalMarksOpen(false)}
        student={computedStudent}
      />
    </div>
  );
}

// 6. DETAILED COLLEGE FOOTER COMPONENT
function CollegeFooter({ setTab }: { setTab: (tab: string) => void }) {
  return (
    <footer className="bg-oxford-navy text-white/90 border-t border-white/10 pt-12 pb-6 select-none font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Logo & Mission Brief */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-prestige-gold bg-white flex items-center justify-center font-serif text-oxford-navy font-extrabold text-xs">
              DC
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-prestige-gold">DHEMAJI COLLEGE</h4>
              <p className="text-[10px] text-white/50">Estd: 1965 • NAAC Grade 'A'</p>
            </div>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            A premier seat of learning in Assam, fostering scientific inquiry, academic excellence, and ethical values across generations.
          </p>
        </div>

        {/* Col 2: Streams */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-prestige-gold">Academic Streams</h4>
          <ul className="space-y-1.5 text-xs text-white/70">
            <li><button onClick={() => setTab('academics')} className="hover:text-prestige-gold transition-colors text-left cursor-pointer">B.Sc. Honors (Science Stream)</button></li>
            <li><button onClick={() => setTab('academics')} className="hover:text-prestige-gold transition-colors text-left cursor-pointer">B.A. Honors (Arts Stream)</button></li>
            <li><button onClick={() => setTab('academics')} className="hover:text-prestige-gold transition-colors text-left cursor-pointer">Computer Certifications (BCA/PGDCA)</button></li>
            <li><button onClick={() => setTab('about')} className="hover:text-prestige-gold transition-colors text-left cursor-pointer">Continuous Sessional assessments</button></li>
          </ul>
        </div>

        {/* Col 3: Navigation */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-prestige-gold">Quick Navigation</h4>
          <ul className="space-y-1.5 text-xs text-white/70">
            <li><button onClick={() => setTab('home')} className="hover:text-prestige-gold transition-colors text-left cursor-pointer">Official Homepage</button></li>
            <li><button onClick={() => setTab('about')} className="hover:text-prestige-gold transition-colors text-left cursor-pointer">History & Motto</button></li>
            <li><button onClick={() => setTab('notices')} className="hover:text-prestige-gold transition-colors text-left cursor-pointer">Official Notice Archive</button></li>
            <li><button onClick={() => setTab('student-portal')} className="hover:text-prestige-gold transition-colors text-left cursor-pointer">Secure Student Portal 🎓</button></li>
          </ul>
        </div>

        {/* Col 4: Contacts */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-prestige-gold">Campus Contact</h4>
          <p className="text-xs text-white/70 leading-relaxed">
            College Road, Dhemaji <br />
            Assam, PIN-787057, India <br />
            Phone: +91 3753 224356 <br />
            Email: principal@dhemajicollege.in
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 mt-10 pt-6 text-center text-[11px] text-white/50 flex flex-col sm:flex-row justify-between gap-4">
        <p>Copyright © 2026 Dhemaji College, Assam. All Rights Reserved.</p>
        <div className="flex gap-4 justify-center">
          <a href="#" className="hover:text-prestige-gold transition-colors">Terms of Use</a>
          <span>•</span>
          <a href="#" className="hover:text-prestige-gold transition-colors">Privacy Regulations</a>
          <span>•</span>
          <button onClick={() => setTab('contact')} className="hover:text-prestige-gold cursor-pointer transition-colors">College Helpdesk</button>
        </div>
      </div>
    </footer>
  );
}
