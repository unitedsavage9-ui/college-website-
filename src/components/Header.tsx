import React from 'react';
import { Menu, Mail, Phone, Calendar, Award, ShieldAlert, Clock } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function Header({
  onMenuToggle,
  currentTab,
  setTab,
}: HeaderProps) {
  
  const navItems = [
    { label: 'Home', value: 'home' },
    { label: 'About Us', value: 'about' },
    { label: 'Academics', value: 'academics' },
    { label: 'Notice Board', value: 'notices' },
    { label: 'Campus Gallery', value: 'gallery' },
    { label: 'Contact Us', value: 'contact' },
  ];

  return (
    <div className="w-full bg-white border-b border-outline-variant/30 shadow-sm relative z-40 font-sans">
      {/* 1. TOP STATS & TICKER BAR */}
      <div className="bg-oxford-navy text-white text-[11px] py-2 px-4 md:px-12 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-4 flex-wrap justify-center font-mono">
          <span className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-prestige-gold" />
            info@dhemajicollege.in
          </span>
          <span className="flex items-center gap-1 border-l border-white/20 pl-4">
            <Phone className="w-3.5 h-3.5 text-prestige-gold" />
            +91-3753-224356
          </span>
          <span className="hidden md:inline border-l border-white/20 pl-4 uppercase tracking-wider text-prestige-gold font-bold">
            ESTD: 1965
          </span>
        </div>

        {/* Scrolling News Ticker marquee */}
        <div className="flex-1 max-w-lg mx-4 hidden md:flex items-center gap-2 overflow-hidden relative bg-white/5 py-0.5 px-3 rounded-full border border-white/10 select-none">
          <span className="bg-prestige-gold text-oxford-navy px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shrink-0">
            Alert
          </span>
          <div className="animate-marquee whitespace-nowrap text-[10px] text-white/95 font-medium flex gap-8">
            <span>📢 FYUGP 1st Semester Admission is now active on Samarth Assam portal!</span>
            <span>📢 Sessional assessment verification ledger for Semester IV is published.</span>
            <span>📢 Dhemaji College secures NAAC Grade 'A' status with 3.12 CGPA!</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-prestige-gold text-oxford-navy font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
            NAAC Grade 'A'
          </span>
          <span className="hidden md:inline text-white/80">Affiliated to Dibrugarh University</span>
        </div>
      </div>

      {/* 2. MAIN BRANDED BANNER AREA */}
      <div className="py-4 px-4 md:px-12 flex justify-between items-center bg-surface-container-lowest select-none">
        <div className="flex items-center gap-3.5 md:gap-5">
          {/* Logo Crest */}
          <div 
            onClick={() => setTab('home')}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-prestige-gold bg-oxford-navy flex flex-col items-center justify-center text-white p-1 relative shadow cursor-pointer hover:scale-103 transition-transform"
          >
            {/* SVG Crest Emblem */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-prestige-gold fill-current">
              <path d="M50,10 L85,25 L85,55 C85,75 50,90 50,90 C50,90 15,75 15,55 L15,25 Z" fill="none" stroke="#D4AF37" strokeWidth="4"/>
              <circle cx="50" cy="50" r="18" fill="none" stroke="#D4AF37" strokeWidth="2" />
              <path d="M40,45 L50,35 L60,45 L50,55 Z" fill="#D4AF37"/>
              <path d="M42,56 L50,65 L58,56" fill="none" stroke="#D4AF37" strokeWidth="2"/>
              <text x="50" y="80" textAnchor="middle" fontSize="10" fill="#D4AF37" fontWeight="bold">1965</text>
            </svg>
          </div>

          <div className="space-y-0.5">
            <h1 
              onClick={() => setTab('home')}
              className="font-serif text-2xl md:text-3.5xl font-extrabold text-oxford-navy tracking-tight leading-none cursor-pointer"
            >
              DHEMAJI COLLEGE
            </h1>
            <p className="text-[9px] md:text-xs text-slate-gray font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>College Road, Dhemaji, Assam, PIN-787057</span>
            </p>
            <p className="text-[8px] md:text-[10px] text-prestige-gold font-bold">
              An Autonomous College Affiliated to Dibrugarh University | Accredited 'A' Grade by NAAC (3.12 CGPA)
            </p>
          </div>
        </div>

        {/* High-value accreditation badge */}
        <div className="hidden lg:flex items-center gap-3 bg-oxford-navy/5 p-2 rounded-xl border border-oxford-navy/10 select-none">
          <Award className="w-7 h-7 text-prestige-gold" />
          <div className="text-[10px] text-oxford-navy">
            <p className="font-bold">60 Years of Excellence</p>
            <p className="text-slate-gray font-mono text-[9px]">Estd: 1965 • ISO 9001:2015</p>
          </div>
        </div>
      </div>

      {/* 3. STICKY HORIZONTAL NAVIGATION BAR */}
      <nav className="bg-oxford-navy text-white h-12 px-4 md:px-12 flex justify-between items-center select-none shadow">
        {/* Mobile Hamburger toggle */}
        <button
          onClick={onMenuToggle}
          className="p-1.5 hover:bg-white/10 rounded-lg text-white md:hidden cursor-pointer"
          aria-label="Toggle mobile navigation menu"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>

        {/* Desktop Navbar List */}
        <div className="hidden md:flex items-center gap-1 h-full text-xs font-semibold">
          {navItems.map((item) => {
            const isActive = currentTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setTab(item.value)}
                className={`px-4 h-full relative transition-all duration-150 text-center flex items-center hover:bg-white/5 hover:text-prestige-gold cursor-pointer ${
                  isActive
                    ? 'text-prestige-gold font-bold bg-white/5 border-b-2 border-prestige-gold'
                    : 'text-white/90'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Student Portal direct access navbar launcher */}
        <div>
          <button
            onClick={() => setTab('student-portal')}
            className={`font-bold text-xs px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-md ${
              currentTab === 'student-portal'
                ? 'bg-prestige-gold text-oxford-navy border border-prestige-gold font-extrabold'
                : 'bg-white/10 text-white border border-white/20 hover:bg-prestige-gold hover:text-oxford-navy'
            }`}
          >
            <span>Student Portal</span>
            <span className="bg-red-600 w-2 h-2 rounded-full animate-pulse" />
          </button>
        </div>
      </nav>
    </div>
  );
}
