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

// AI Chatbot and Admin Panel
import ChatbotWidget from './components/ChatbotWidget';
import AdminPortal from './components/AdminPortal';

import {
  INITIAL_STUDENT,
  MOCK_STUDENTS,
  COURSE_SCHEDULE,
  NOTIFICATIONS,
  SUBJECT_ATTENDANCE,
  SEMESTER_RESULTS,
  INITIAL_FEES,
} from './data';
import { Student, CourseScheduleItem, NotificationItem, SubjectAttendance, FeeItem } from './types';
import { Calendar, Award, BookOpen, RotateCcw, Home, Clock, MapPin, Lock, ArrowRight, ShieldCheck, LogOut, Sparkles, Phone, Mail, User } from 'lucide-react';

export default function App() {
  // 1. Core State Managers (Mock Sessional Database)
  const [student, setStudent] = useState<Student>(INITIAL_STUDENT);
  const [schedule, setSchedule] = useState<CourseScheduleItem[]>(COURSE_SCHEDULE);
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS);
  const [fees, setFees] = useState<FeeItem[]>(INITIAL_FEES);
  const [subjectAttendance, setSubjectAttendance] = useState<SubjectAttendance[]>(SUBJECT_ATTENDANCE);
  
  // Login / Logout State Managers
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginInput, setLoginInput] = useState<string>("");
  
  // 2. Navigation State Managers
  const [currentTab, setCurrentTab] = useState<string>('home'); // Defaults to public Home Page
  const [portalSubTab, setPortalSubTab] = useState<string>('dashboard'); // Defaults to Portal Overview

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPortalSubTab('dashboard');
  };

  const handleLogin = async (identifier: string) => {
    if (!identifier.trim()) {
      setLoginError("Please enter a valid email address or phone number.");
      return;
    }
    
    setLoginError(null);
    setIsLoggingIn(true);

    // Simulate 800ms loading verification delay for realistic responsiveness
    await new Promise(resolve => setTimeout(resolve, 800));

    const cleanId = identifier.trim().toLowerCase();
    
    // Check match against MOCK_STUDENTS
    const matched = MOCK_STUDENTS.find(s => 
      s.email?.toLowerCase() === cleanId || 
      s.phone === cleanId ||
      s.id.toLowerCase() === cleanId
    );

    if (matched) {
      setStudent(matched);
      // Custom sessional records load based on student department
      if (matched.department.includes("Botany")) {
        setSubjectAttendance([
          { id: "att-b1", subjectCode: "BOT-401", subjectName: "Plant Physiology", attendedClasses: 35, totalClasses: 40, attendancePercent: 87.5, lastAttended: "Today, 10:00 AM" },
          { id: "att-b2", subjectCode: "BOT-402", subjectName: "Ecology & Phytogeography", attendedClasses: 36, totalClasses: 40, attendancePercent: 90.0, lastAttended: "Yesterday, 11:30 AM" },
          { id: "att-b3", subjectCode: "BOT-403", subjectName: "Mycology", attendedClasses: 31, totalClasses: 35, attendancePercent: 88.6, lastAttended: "Today, 02:00 PM" },
          { id: "att-b4", subjectCode: "BOT-404-P", subjectName: "Botany Lab I", attendedClasses: 14, totalClasses: 16, attendancePercent: 87.5, lastAttended: "Oct 12, 02:00 PM" }
        ]);
        setSchedule([
          { id: "class-1", time: "10:00 AM - 11:00 AM", title: "Plant Physiology Lecture", location: "Room 102, Block A", completed: false, prestigeBorder: true, date: "Sept 24, Tuesday" },
          { id: "class-2", time: "11:30 AM - 12:30 PM", title: "Mycology Lab Theory", location: "Room 105, Block A", completed: true, prestigeBorder: false, date: "Sept 24, Tuesday" }
        ]);
        setFees([
          { id: "fee-b1", title: "Semester 4 Tuition Fee", amount: 14000, dueDate: "2026-08-15", status: "pending", category: "Tuition" }
        ]);
      } else if (matched.department.includes("English")) {
        setSubjectAttendance([
          { id: "att-e1", subjectCode: "ENG-401", subjectName: "English Literature (Romantic)", attendedClasses: 32, totalClasses: 40, attendancePercent: 80.0, lastAttended: "Today, 09:30 AM" },
          { id: "att-e2", subjectCode: "ENG-402", subjectName: "Phonetics & Linguistics", attendedClasses: 33, totalClasses: 40, attendancePercent: 82.5, lastAttended: "Yesterday, 01:30 PM" },
          { id: "att-e3", subjectCode: "ENG-403", subjectName: "Creative Writing Techniques", attendedClasses: 24, totalClasses: 30, attendancePercent: 80.0, lastAttended: "Today, 11:00 AM" }
        ]);
        setSchedule([
          { id: "class-1", time: "09:30 AM - 10:30 AM", title: "Romantic Poetry Review", location: "Room 203, Block C", completed: false, prestigeBorder: true, date: "Sept 24, Tuesday" },
          { id: "class-2", time: "01:30 PM - 02:30 PM", title: "Phonetics & Pronunciation", location: "Seminar Room 1", completed: false, prestigeBorder: false, date: "Sept 24, Tuesday" }
        ]);
        setFees([
          { id: "fee-e1", title: "Semester 4 Tuition Fee", amount: 12500, dueDate: "2026-08-15", status: "pending", category: "Tuition" },
          { id: "fee-e2", title: "Special Literature Fee", amount: 1500, dueDate: "2026-08-30", status: "pending", category: "Examination" }
        ]);
      } else {
        // Reset to default Rahul (Physics)
        setSubjectAttendance(SUBJECT_ATTENDANCE);
        setSchedule(COURSE_SCHEDULE);
        setFees(INITIAL_FEES);
      }
    } else {
      // Dynamic profile generation for custom credentials
      let name = "Student User";
      if (cleanId.includes("@")) {
        const part = cleanId.split("@")[0];
        name = part.split(/[._-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
      } else {
        name = "Student (" + cleanId + ")";
      }

      const isEmail = cleanId.includes("@");
      
      const newStudent: Student = {
        name: name,
        id: `DC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        department: "B.A. Liberal Arts",
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
        cgpa: 8.35,
        attendancePercent: 79,
        feesDue: 3500,
        feesPaid: 16500,
        email: isEmail ? cleanId : `${cleanId}@dhemajicollege.edu.in`,
        phone: !isEmail ? cleanId : "9876543210"
      };

      setStudent(newStudent);
      
      // Dynamic details for B.A. Liberal Arts
      setSubjectAttendance([
        { id: "att-la1", subjectCode: "LA-401", subjectName: "Assamese Literature", attendedClasses: 30, totalClasses: 38, attendancePercent: 78.9, lastAttended: "Yesterday, 02:30 PM" },
        { id: "att-la2", subjectCode: "LA-402", subjectName: "Sociology Foundations", attendedClasses: 32, totalClasses: 40, attendancePercent: 80.0, lastAttended: "Today, 11:00 AM" },
        { id: "att-la3", subjectCode: "LA-403", subjectName: "Ethics & Philosophy", attendedClasses: 27, totalClasses: 35, attendancePercent: 77.1, lastAttended: "Today, 03:00 PM" }
      ]);
      setSchedule([
        { id: "class-la1", time: "11:00 AM - 12:00 PM", title: "Sociology Foundations Lecture", location: "Room 105, Block C", completed: false, prestigeBorder: true, date: "Sept 24, Tuesday" },
        { id: "class-la2", time: "03:00 PM - 04:00 PM", title: "Ethics seminar discussion", location: "Room 106, Block C", completed: false, prestigeBorder: false, date: "Sept 24, Tuesday" }
      ]);
      setFees([
        { id: "fee-la1", title: "Semester 4 Tuition Fee", amount: 11000, dueDate: "2026-08-15", status: "pending", category: "Tuition" }
      ]);
    }
    
    setIsLoggedIn(true);
    setIsLoggingIn(false);
  };
  
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
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
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
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
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

        {currentTab === 'admin-portal' && (
          <AdminPortal />
        )}

        {/* SECURE STUDENT PORTAL ENGINE */}
        {currentTab === 'student-portal' && (
          !isLoggedIn ? (
            <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-prestige-gold/30 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
              {/* Logo / Heading */}
              <div className="text-center space-y-2">
                <div className="inline-flex p-3.5 bg-oxford-navy/5 text-oxford-navy rounded-full border border-prestige-gold/20 mb-1">
                  <Lock className="w-6 h-6 text-prestige-gold animate-pulse" />
                </div>
                <h2 className="font-serif font-extrabold text-2xl text-oxford-navy tracking-tight">Student Portal Access</h2>
                <p className="text-xs text-slate-gray max-w-sm mx-auto leading-relaxed">
                  Enter your email or phone number to view class attendance, grades, fee receipts, and digital schedules.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleLogin(loginInput); }} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="student-id-field" className="text-[11px] font-bold text-slate-gray uppercase tracking-wider block">
                    Email Address or Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-gray pointer-events-none">
                      {loginInput.includes('@') ? <Mail className="w-4.5 h-4.5 text-prestige-gold" /> : <Phone className="w-4.5 h-4.5 text-prestige-gold" />}
                    </span>
                    <input
                      id="student-id-field"
                      type="text"
                      placeholder="e.g. rahul@dhemajicollege.edu.in"
                      value={loginInput}
                      onChange={(e) => {
                        setLoginInput(e.target.value);
                        setLoginError(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-prestige-gold focus:outline-none focus:ring-1 focus:ring-prestige-gold rounded-xl text-xs font-semibold text-slate-800 transition-all shadow-inner"
                      disabled={isLoggingIn}
                    />
                  </div>
                </div>

                {loginError && (
                  <p className="text-[11px] font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0"></span>
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-oxford-navy hover:bg-oxford-navy/95 text-white hover:text-prestige-gold rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-75"
                >
                  {isLoggingIn ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin text-prestige-gold" />
                      <span>Verifying Sessional Record...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-prestige-gold" />
                      <span>Authenticate & Log In</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick demo students selection cards */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-gray uppercase tracking-wider block text-center">
                  Quick-Demo Student Profiles
                </span>
                <div className="flex flex-col gap-2">
                  {MOCK_STUDENTS.map((stud) => (
                    <button
                      key={stud.id}
                      type="button"
                      onClick={() => {
                        setLoginInput(stud.email || stud.phone || "");
                        handleLogin(stud.email || stud.phone || "");
                      }}
                      disabled={isLoggingIn}
                      className="flex items-center gap-3 p-2.5 hover:bg-prestige-gold/5 border border-slate-100 hover:border-prestige-gold/40 rounded-xl transition-all text-left cursor-pointer disabled:opacity-50"
                    >
                      <img
                        src={stud.photoUrl}
                        alt={stud.name}
                        className="w-9 h-9 rounded-full border border-prestige-gold/50 object-cover shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-oxford-navy truncate">{stud.name}</h4>
                          <span className="text-[9px] font-mono text-slate-400">{stud.id}</span>
                        </div>
                        <p className="text-[10px] text-slate-gray truncate font-mono mt-0.5">{stud.email}</p>
                        <p className="text-[9px] text-prestige-gold font-bold">{stud.department}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-oxford-navy text-sm leading-tight truncate">{computedStudent.name}</h4>
                        <button
                          onClick={handleLogout}
                          title="Log out student"
                          className="text-[10px] text-red-500 hover:text-red-700 hover:underline flex items-center gap-0.5 cursor-pointer ml-1 font-bold shrink-0"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Exit</span>
                        </button>
                      </div>
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
          )
        )}
      </div>

      {/* 4. OFFICIAL DHEMAJI COLLEGE FOOTER */}
      <CollegeFooter setTab={setCurrentTab} />

      {/* 5. PORTAL MOBILE SUB-NAVIGATION BAR (Only visible inside Student Portal) */}
      {currentTab === 'student-portal' && isLoggedIn && (
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

      {/* 6. GLOBAL AI CHATBOT SECRETARIAT WIDGET */}
      <ChatbotWidget studentProfile={computedStudent} />
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
            <li><button onClick={() => setTab('admin-portal')} className="hover:text-prestige-gold text-prestige-gold font-semibold transition-colors text-left cursor-pointer">AI Desk Admin Panel ⚙️</button></li>
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
