import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Search, Clock, Download, ArrowRight, X, Calendar } from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  category: 'Admissions' | 'Examinations' | 'Academics' | 'Events' | 'General';
  date: string;
  description: string;
  circularNo: string;
  attachmentName: string;
  isNew?: boolean;
}

const NOTICES_DATA: NoticeItem[] = [
  {
    id: "not-1",
    title: "Admission notice for Four Year Undergraduate Program (FYUGP) 1st Semester (Arts & Science Stream)",
    category: "Admissions",
    date: "July 12, 2026",
    circularNo: "DC/ADM/2026/410",
    attachmentName: "FYUGP_Admission_Notice_2026.pdf",
    isNew: true,
    description: "Online applications are invited for admission to the FYUGP 1st Semester (Arts & Science Streams) under Dibrugarh University. Interested and eligible candidates must apply through the SAMARTH Assam portal. Please upload your Marksheets, Caste certificates, and PRCs. Last date for application submission is July 30th, 2026."
  },
  {
    id: "not-2",
    title: "Notification regarding form fill-up for B.Sc / B.A. Semester IV Sessional Examinations",
    category: "Examinations",
    date: "July 10, 2026",
    circularNo: "DC/EXM/2026/894",
    attachmentName: "Sem_IV_Sessional_Form_2026.pdf",
    isNew: true,
    description: "This is to notify all B.Sc and B.A. Semester IV students that the form fill-up for the upcoming Sessional/Internal Examination II starts on July 15th, 2026. All dues and fee invoices up to June must be fully paid and settled in the fee portal to receive the roll allocations and admit credentials."
  },
  {
    id: "not-3",
    title: "National Seminar on 'Recent Advances in Material Science' organized by Department of Physics",
    category: "Academics",
    date: "July 05, 2026",
    circularNo: "DC/PHY/SEM/2026/12",
    attachmentName: "Physics_Material_Science_Seminar.pdf",
    isNew: false,
    description: "The Department of Physics in collaboration with the IQAC Cell, Dhemaji College, is organizing a two-day national seminar on 'Recent Advances in Material Science'. We invite abstracts and research proposals from postgraduate research scholars and faculty members. Keynote address by Dr. K. Borah from IIT Guwahati."
  },
  {
    id: "not-4",
    title: "Notice regarding publication of Internal/Sessional Marks ledger for Semester IV (Physics & Arts Core)",
    category: "Examinations",
    date: "June 28, 2026",
    circularNo: "DC/EXM/INT/2026/304",
    attachmentName: "Sem_IV_Sessional_Ledger_PrePub.pdf",
    isNew: false,
    description: "The draft internal assessment marks ledger for B.Sc Physics and Humanities core Semester IV has been compiled by sessional invigilators. Students are requested to check their ledger via their secure Student Portal under 'Results' sessional panel. Any discrepancies in theory/lab marks must be reported to the HOD within July 10th."
  },
  {
    id: "not-5",
    title: "NSS Special Camp regarding Health and Sanitation awareness program at Borpatra Village",
    category: "Events",
    date: "June 15, 2026",
    circularNo: "DC/NSS/2026/88",
    attachmentName: "NSS_Borpatra_Camp_Schedule.pdf",
    isNew: false,
    description: "The National Service Scheme (NSS) unit of Dhemaji College is conducting a 5-day Special Residential Camp at Borpatra village. The camp activities include general health awareness clinics, sanitation drive, and tree plantation. Interested student volunteers must submit their names to the NSS Programme Officer by June 18th."
  },
  {
    id: "not-6",
    title: "Guidelines for Post-Matric and Ishan Uday Scholarship schemes for Academic Year 2026-27",
    category: "General",
    date: "June 10, 2026",
    circularNo: "DC/SCH/2026/02",
    attachmentName: "Scholarship_Guidelines_Assam_2026.pdf",
    isNew: false,
    description: "All registered students eligible for the Post-Matric Scholarship (SC/ST/OBC) and Ishan Uday Scholarship schemes are instructed to complete their registration on the National Scholarship Portal (NSP). Print out the submitted forms and forward them along with duplicate income/marks certificate sets to the college verification counter."
  }
];

export default function NoticesView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Categories
  const categories = ['All', 'Admissions', 'Examinations', 'Academics', 'Events', 'General'];

  // Filter notices
  const filteredNotices = useMemo(() => {
    return NOTICES_DATA.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.circularNo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleDownloadFile = (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card expansion
    setDownloadSuccessMessage(`Circular attachment "${fileName}" downloaded successfully!`);
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-16 font-sans relative"
    >
      {/* Page Title */}
      <section className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-prestige-gold">Official News Desk</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-oxford-navy font-serif">College Notice Board</h2>
        <p className="text-xs text-slate-gray max-w-xl mx-auto">
          Access latest announcements, examination circulars, fee updates, and academic notifications issued by Dhemaji College administration.
        </p>
        <div className="h-0.5 w-24 bg-prestige-gold mx-auto mt-2" />
      </section>

      {/* Downloads notification */}
      {downloadSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-24 right-4 z-50 bg-green-800 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-green-600 flex items-center gap-2"
        >
          <span>{downloadSuccessMessage}</span>
        </motion.div>
      )}

      {/* Filters & Search Toolbar */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-outline-variant/30 shadow-sm">
        {/* Search Input */}
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/25 rounded-xl px-4 py-2 w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-gray shrink-0" />
          <input
            type="text"
            placeholder="Search circular no, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-on-surface focus:ring-0 placeholder-slate-gray/60"
          />
        </div>

        {/* Category Toggles */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-oxford-navy text-white shadow-sm font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Notice Listing */}
      <section className="space-y-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => setSelectedNotice(notice)}
              className="bg-white p-5 rounded-2xl border border-outline-variant/30 shadow-sm hover:border-prestige-gold/50 cursor-pointer transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold font-mono text-slate-gray px-1.5 py-0.5 bg-surface-container rounded uppercase">
                    {notice.category}
                  </span>
                  <span className="text-[10px] text-slate-gray font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {notice.date}
                  </span>
                  {notice.isNew && (
                    <span className="text-[8px] font-bold text-white bg-red-600 px-1 rounded uppercase animate-pulse">
                      New
                    </span>
                  )}
                </div>

                <h3 className="font-sans text-sm md:text-base font-bold text-oxford-navy leading-tight group-hover:text-prestige-gold transition-colors">
                  {notice.title}
                </h3>

                <div className="flex items-center gap-2 text-[10px] text-slate-gray font-mono">
                  <span>Circular No:</span>
                  <span className="font-bold text-oxford-navy">{notice.circularNo}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-stretch md:self-auto justify-end border-t md:border-t-0 border-outline-variant/10 pt-3 md:pt-0 shrink-0">
                <button
                  onClick={(e) => handleDownloadFile(notice.attachmentName, e)}
                  className="p-2 bg-surface-container-low hover:bg-prestige-gold/20 text-oxford-navy hover:text-oxford-navy rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Download Attachment PDF"
                >
                  <Download className="w-4 h-4 shrink-0 text-prestige-gold" />
                  <span className="hidden md:inline">Download</span>
                </button>
                <div className="p-2 bg-oxford-navy/5 rounded-xl group-hover:bg-oxford-navy group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4 text-oxford-navy group-hover:text-prestige-gold" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 space-y-2">
            <p className="text-slate-gray text-sm">No circular notices match your search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="text-xs text-prestige-gold font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Notice Detailed Overlay Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotice(null)}
              className="fixed inset-0 bg-black z-50"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-24 md:top-32 max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-outline-variant/35 flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="p-5 bg-oxford-navy text-white flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold font-mono text-oxford-navy px-2 py-0.5 bg-prestige-gold rounded uppercase">
                    {selectedNotice.category}
                  </span>
                  <h3 className="font-serif text-base md:text-lg font-bold tracking-tight leading-snug">
                    {selectedNotice.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm text-on-surface-variant leading-relaxed">
                <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-outline-variant/10 pb-4 bg-surface-container-low p-3 rounded-xl">
                  <div>
                    <span className="text-slate-gray block">Circular Ref:</span>
                    <span className="font-bold text-oxford-navy">{selectedNotice.circularNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-gray block">Publish Date:</span>
                    <span className="font-bold text-oxford-navy">{selectedNotice.date}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-sans font-bold text-oxford-navy">Official Declaration:</h4>
                  <p className="font-sans text-xs md:text-sm">{selectedNotice.description}</p>
                </div>

                {/* Simulated file download segment */}
                <div className="border border-outline-variant/20 p-4 rounded-xl flex items-center justify-between bg-surface-container-low">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-oxford-navy truncate">{selectedNotice.attachmentName}</p>
                      <p className="text-[10px] text-slate-gray">Authorized digital signature attached • 1.2 MB</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      handleDownloadFile(selectedNotice.attachmentName, e);
                      setSelectedNotice(null);
                    }}
                    className="p-2 hover:bg-prestige-gold/20 text-prestige-gold hover:text-oxford-navy rounded-lg transition-all cursor-pointer flex items-center gap-1 text-xs font-bold border border-prestige-gold/30 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-2 text-xs font-bold bg-oxford-navy hover:bg-oxford-navy/90 text-white rounded-xl transition-all cursor-pointer"
                >
                  Close Document
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
