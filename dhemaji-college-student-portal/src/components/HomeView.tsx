import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  ArrowRight,
  Phone,
  FileText,
  AlertCircle,
  GraduationCap,
  Users,
  Award,
  Globe,
  Flame,
  ShieldCheck,
  CheckCircle,
  Library
} from 'lucide-react';

interface HomeViewProps {
  onTabChange: (tab: string) => void;
  onSelectNotice?: (noticeId: string) => void;
}

const CAROUSEL_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    title: "Welcome to Dhemaji College",
    subtitle: "Empowering minds, transforming lives, and fostering excellence in Assam since 1965.",
    badge: "Accredited 'A' Grade by NAAC"
  },
  {
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    title: "State-of-the-Art Science Laboratories",
    subtitle: "Providing students with cutting-edge infrastructure and practical scientific learning environments.",
    badge: "Affiliated to Dibrugarh University"
  },
  {
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    title: "Well-Equipped Digital Central Library",
    subtitle: "Over 40,000+ books, digital journals, and reference materials with comfortable reading halls.",
    badge: "E-Learning Facility"
  }
];

const QUICK_NOTICES = [
  {
    id: "notice-1",
    title: "Admission notice for Four Year Undergraduate Program (FYUGP) 1st Semester",
    date: "July 12, 2026",
    category: "Admissions",
    isNew: true
  },
  {
    id: "notice-2",
    title: "Notification regarding form fill-up for B.Sc / B.A. Semester IV Sessional Exams",
    date: "July 10, 2026",
    category: "Examinations",
    isNew: true
  },
  {
    id: "notice-3",
    title: "National Seminar on 'Recent Advances in Material Science' by Department of Physics",
    date: "July 05, 2026",
    category: "Academics",
    isNew: false
  },
  {
    id: "notice-4",
    title: "Notice regarding publication of Internal/Sessional Marks ledger for Semester IV",
    date: "June 28, 2026",
    category: "Examinations",
    isNew: false
  },
  {
    id: "notice-5",
    title: "NSS Special Camp regarding Health and Sanitation awareness program",
    date: "June 15, 2026",
    category: "Events",
    isNew: false
  }
];

export default function HomeView({ onTabChange }: HomeViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto scroll slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Dynamic Campus Image Slider / Hero */}
      <section className="relative h-[300px] md:h-[480px] w-full overflow-hidden rounded-2xl shadow-xl bg-slate-900" id="home-carousel">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {/* Background image */}
            <img
              src={CAROUSEL_SLIDES[currentSlide].image}
              alt={CAROUSEL_SLIDES[currentSlide].title}
              className="w-full h-full object-cover brightness-65 transition-transform duration-1000 scale-102"
              referrerPolicy="no-referrer"
            />
            {/* Color Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-oxford-navy via-transparent to-black/30" />
            
            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 text-white max-w-3xl">
              <motion.span
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-wider bg-prestige-gold text-oxford-navy px-2.5 py-1 rounded-full mb-3"
              >
                {CAROUSEL_SLIDES[currentSlide].badge}
              </motion.span>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-serif text-2xl md:text-5xl font-bold text-white tracking-tight leading-tight"
              >
                {CAROUSEL_SLIDES[currentSlide].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xs md:text-lg text-white/90 mt-2 md:mt-4 font-normal"
              >
                {CAROUSEL_SLIDES[currentSlide].subtitle}
              </motion.p>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4 md:mt-6"
              >
                <button
                  onClick={() => onTabChange('student-portal')}
                  className="bg-prestige-gold text-oxford-navy hover:bg-white hover:text-oxford-navy font-bold text-xs md:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Access Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bullet Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {CAROUSEL_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-prestige-gold w-6' : 'bg-white/50 hover:bg-white'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Side-by-Side: Principal Message & Latest Notice Board */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Principal Welcome Desk (7 columns) */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-40 md:w-44 md:h-52 rounded-xl overflow-hidden border-2 border-prestige-gold shadow-md shrink-0 bg-slate-100">
              {/* Photo of the Principal */}
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80"
                alt="Dr. Dipak Kr. Neog"
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-3 text-center md:text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-prestige-gold">Principal's Greeting</span>
              <h3 className="font-serif text-2xl font-bold text-oxford-navy">From the Principal's Desk</h3>
              <p className="text-xs font-semibold text-slate-gray font-sans">
                Dr. Dipak Kr. Neog, M.Sc., Ph.D. <br />
                <span className="text-[10px] text-oxford-navy font-bold">Principal, Dhemaji College</span>
              </p>
              <div className="h-0.5 w-16 bg-prestige-gold mx-auto md:mx-0" />
            </div>
          </div>
          
          <div className="text-sm text-on-surface-variant leading-relaxed space-y-3 font-sans">
            <p>
              It gives me immense pleasure to welcome you to <strong>Dhemaji College</strong>, the premier institution of higher education in the north-eastern part of Assam. Founded in 1965, the college has been steadfast in its mission to bring quality collegiate education to students of this aspiring district.
            </p>
            <p>
              Under our affiliate, Dibrugarh University, we offer rich curricula in both <strong>Science and Arts streams</strong>. Dhemaji College was accredited with an <strong>'A' Grade by NAAC</strong>, testifying to our sustained commitment to scholastic, administrative, and sports-related infrastructure.
            </p>
            <p>
              We believe in holistic student growth. Our digital library, modern computer center, interactive sessional structures, and dedicated NCC and NSS programs provide the framework for students to reach their full potential. Welcome to our vibrant digital campus.
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-outline-variant/20">
            <button
              onClick={() => onTabChange('about')}
              className="text-xs font-bold text-oxford-navy hover:text-prestige-gold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Read College Profile & History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Notice Board (5 columns) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-prestige-gold animate-pulse" />
              <h3 className="font-serif text-lg font-bold text-oxford-navy">Latest Notices</h3>
            </div>
            <button
              onClick={() => onTabChange('notices')}
              className="text-xs font-bold text-prestige-gold hover:underline cursor-pointer uppercase tracking-wider"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 divide-y divide-outline-variant/10">
            {QUICK_NOTICES.map((notice, idx) => (
              <div
                key={notice.id}
                className={`pt-3 first:pt-0 group cursor-pointer`}
                onClick={() => onTabChange('notices')}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 bg-oxford-navy/5 p-1 rounded text-oxford-navy group-hover:bg-prestige-gold/10 group-hover:text-prestige-gold transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold font-mono text-slate-gray px-1.5 py-0.5 bg-surface-container rounded uppercase">
                        {notice.category}
                      </span>
                      {notice.isNew && (
                        <span className="text-[8px] font-bold text-white bg-red-600 px-1 rounded animate-pulse uppercase">
                          New
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-oxford-navy leading-tight group-hover:text-prestige-gold transition-colors">
                      {notice.title}
                    </h4>
                    <p className="text-[10px] text-slate-gray font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {notice.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onTabChange('notices')}
            className="w-full text-center bg-oxford-navy hover:bg-oxford-navy/90 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
          >
            <span>Go to Official Notice Archive</span>
            <ArrowRight className="w-3.5 h-3.5 text-prestige-gold" />
          </button>
        </div>
      </section>

      {/* 3. Stream Selection Bento Grid (Science, Arts, IT/CS) */}
      <section className="space-y-4">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-prestige-gold">Academic Streams</span>
          <h3 className="font-serif text-3xl font-bold text-oxford-navy">Streams & Departments</h3>
          <p className="text-xs text-slate-gray">
            Dhemaji College offers undergraduate degrees under Choice Based Credit System (CBCS) and FYUGP (NEP-2020) frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Science Card */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm hover:shadow-md overflow-hidden flex flex-col group transition-all duration-300">
            <div className="h-40 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&w=500&q=80"
                alt="Science stream"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white">
                <Flame className="w-5 h-5 text-prestige-gold" />
                <h4 className="font-serif text-lg font-bold">Science Stream</h4>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Equipped with fully funded DST, DBT state-of-the-art laboratory rigs and specialized modules in physical, biological, and electronic sciences.
              </p>
              <div className="space-y-1.5 border-t border-outline-variant/10 pt-3">
                <span className="text-[10px] font-bold uppercase text-slate-gray tracking-wider">Departments:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Physics', 'Chemistry', 'Mathematics', 'Zoology', 'Botany', 'Computer Science'].map((dep) => (
                    <span key={dep} className="text-[10px] font-medium bg-surface-container-low text-oxford-navy px-2 py-0.5 rounded border border-outline-variant/10">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onTabChange('academics')}
                className="w-full border border-outline hover:border-oxford-navy text-oxford-navy text-xs font-bold py-2 rounded-xl transition-all text-center flex items-center justify-center gap-1 group-hover:bg-oxford-navy group-hover:text-white cursor-pointer"
              >
                <span>View Course Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Arts Card */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm hover:shadow-md overflow-hidden flex flex-col group transition-all duration-300">
            <div className="h-40 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=500&q=80"
                alt="Arts stream"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white">
                <BookOpen className="w-5 h-5 text-prestige-gold" />
                <h4 className="font-serif text-lg font-bold">Arts Stream</h4>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Fostering analytical critique, linguistic skills, historical contexts, and deep philosophical awareness under highly veteran faculty.
              </p>
              <div className="space-y-1.5 border-t border-outline-variant/10 pt-3">
                <span className="text-[10px] font-bold uppercase text-slate-gray tracking-wider">Departments:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['English', 'Assamese', 'Political Science', 'Economics', 'Education', 'Philosophy', 'History', 'Sociology'].map((dep) => (
                    <span key={dep} className="text-[10px] font-medium bg-surface-container-low text-oxford-navy px-2 py-0.5 rounded border border-outline-variant/10">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onTabChange('academics')}
                className="w-full border border-outline hover:border-oxford-navy text-oxford-navy text-xs font-bold py-2 rounded-xl transition-all text-center flex items-center justify-center gap-1 group-hover:bg-oxford-navy group-hover:text-white cursor-pointer"
              >
                <span>View Course Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Amenities/Facilities Card */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm hover:shadow-md overflow-hidden flex flex-col group transition-all duration-300">
            <div className="h-40 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=500&q=80"
                alt="Infrastructure"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-white">
                <Library className="w-5 h-5 text-prestige-gold" />
                <h4 className="font-serif text-lg font-bold">Campus Amenities</h4>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Enjoy academic freedom in a pristine environment. Our campus covers lush greens, multi-facility gyms, separate dormitories, and central e-learning resource gates.
              </p>
              <div className="space-y-1.5 border-t border-outline-variant/10 pt-3">
                <span className="text-[10px] font-bold uppercase text-slate-gray tracking-wider">Features:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Digital Library', 'Hostels', 'Gymnasium', 'Computer Lab', 'NSS & NCC', 'Sports Ground'].map((dep) => (
                    <span key={dep} className="text-[10px] font-medium bg-surface-container-low text-oxford-navy px-2 py-0.5 rounded border border-outline-variant/10">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onTabChange('about')}
                className="w-full border border-outline hover:border-oxford-navy text-oxford-navy text-xs font-bold py-2 rounded-xl transition-all text-center flex items-center justify-center gap-1 group-hover:bg-oxford-navy group-hover:text-white cursor-pointer"
              >
                <span>View Campus Facilities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. College At a Glance: Stats Grid */}
      <section className="bg-oxford-navy text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-prestige-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="p-4 flex flex-col items-center justify-center space-y-2">
            <GraduationCap className="w-8 h-8 text-prestige-gold" />
            <h4 className="font-serif text-3xl font-bold">1965</h4>
            <p className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Year Established</p>
          </div>
          <div className="p-4 flex flex-col items-center justify-center space-y-2 pt-6 md:pt-4">
            <Users className="w-8 h-8 text-prestige-gold" />
            <h4 className="font-serif text-3xl font-bold">2,500+</h4>
            <p className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Active Students</p>
          </div>
          <div className="p-4 flex flex-col items-center justify-center space-y-2 pt-6 md:pt-4">
            <Award className="w-8 h-8 text-prestige-gold" />
            <h4 className="font-serif text-3xl font-bold">A Grade</h4>
            <p className="text-[10px] uppercase font-bold text-white/70 tracking-wider">NAAC Accreditation</p>
          </div>
          <div className="p-4 flex flex-col items-center justify-center space-y-2 pt-6 md:pt-4">
            <Library className="w-8 h-8 text-prestige-gold" />
            <h4 className="font-serif text-3xl font-bold">40k+</h4>
            <p className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Library Books</p>
          </div>
          <div className="p-4 flex flex-col items-center justify-center space-y-2 pt-6 md:pt-4">
            <Globe className="w-8 h-8 text-prestige-gold" />
            <h4 className="font-serif text-3xl font-bold">15+</h4>
            <p className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Departments</p>
          </div>
        </div>
      </section>

      {/* 5. Direct Quick Action Hub */}
      <section className="bg-prestige-gold/10 rounded-2xl p-6 md:p-8 border border-prestige-gold/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left max-w-2xl">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <ShieldCheck className="w-5 h-5 text-oxford-navy" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-oxford-navy">Secure Student Hub</span>
          </div>
          <h3 className="font-serif text-xl md:text-2xl font-bold text-oxford-navy">Looking to access your Academic Records?</h3>
          <p className="text-xs text-slate-gray leading-relaxed">
            Authorized students can log in to check daily class schedules, simulate attendance percentages, download end-term Admit Cards, view internal mark records, and make online due-fees transactions.
          </p>
        </div>
        <button
          onClick={() => onTabChange('student-portal')}
          className="bg-oxford-navy text-white hover:bg-oxford-navy/90 font-bold text-xs md:text-sm px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Open Student Portal Dashboard</span>
          <GraduationCap className="w-4 h-4 text-prestige-gold" />
        </button>
      </section>
    </div>
  );
}
