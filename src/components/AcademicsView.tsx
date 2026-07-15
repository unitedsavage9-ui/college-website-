import React from 'react';
import { motion } from 'motion/react';
import { Award, BookOpen, Clock, FileCheck2, HelpCircle } from 'lucide-react';

export default function AcademicsView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-10 pb-16 font-sans"
    >
      {/* Title */}
      <section className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-prestige-gold">Academics & Curricula</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-oxford-navy">Academic Programs Offered</h2>
        <div className="h-0.5 w-24 bg-prestige-gold mx-auto mt-2" />
      </section>

      {/* Streams Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Science Stream Card */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-3">
            <div className="w-10 h-10 rounded-lg bg-prestige-gold/15 text-prestige-gold flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-oxford-navy">B.Sc. Honors (Bachelor of Science)</h3>
              <p className="text-[10px] text-slate-gray font-mono">Affiliated to Dibrugarh University | NEP-2020 & CBCS</p>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            The Science curriculum focuses on cultivating rigorous inquiry, experimentation, and critical analytical capacities. All physics, chemistry, biological, and electronic labs are fully standardized under state funding.
          </p>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase text-oxford-navy tracking-wide">Core Honours Subjects (Major):</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { name: "Physics", code: "PHY-H" },
                { name: "Chemistry", code: "CHM-H" },
                { name: "Mathematics", code: "MTH-H" },
                { name: "Zoology", code: "ZOO-H" },
                { name: "Botany", code: "BOT-H" },
                { name: "Computer Science", code: "CSC-H" }
              ].map((sub) => (
                <div key={sub.name} className="flex justify-between p-2 rounded-lg bg-surface-container-low border border-outline-variant/10">
                  <span className="font-semibold text-oxford-navy">{sub.name}</span>
                  <span className="text-[10px] text-prestige-gold font-mono font-bold">{sub.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Arts Stream Card */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-3">
            <div className="w-10 h-10 rounded-lg bg-oxford-navy/5 text-oxford-navy flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-prestige-gold" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-oxford-navy">B.A. Honors (Bachelor of Arts)</h3>
              <p className="text-[10px] text-slate-gray font-mono">Affiliated to Dibrugarh University | NEP-2020 & CBCS</p>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            The Arts curriculum is structured to explore linguistic heritage, philosophical thought structures, economics, socio-political dynamics, and historic legacies. It focuses heavily on seminars, debates, and research dissertations.
          </p>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase text-oxford-navy tracking-wide">Core Honours Subjects (Major):</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { name: "English", code: "ENG-H" },
                { name: "Assamese", code: "ASM-H" },
                { name: "Political Science", code: "PSC-H" },
                { name: "Economics", code: "ECO-H" },
                { name: "Education", code: "EDN-H" },
                { name: "Philosophy", code: "PHL-H" }
              ].map((sub) => (
                <div key={sub.name} className="flex justify-between p-2 rounded-lg bg-surface-container-low border border-outline-variant/10">
                  <span className="font-semibold text-oxford-navy">{sub.name}</span>
                  <span className="text-[10px] text-prestige-gold font-mono font-bold">{sub.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sessional / Assessment Guidelines */}
      <section className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6">
        <h3 className="font-serif text-2xl font-bold text-oxford-navy flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-prestige-gold" />
          <span>Sessional Evaluation & Continuous Assessment Rules</span>
        </h3>
        <div className="h-0.5 w-12 bg-prestige-gold" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
          <div className="space-y-2 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <h4 className="font-sans font-bold text-oxford-navy text-sm">Attendance Criteria</h4>
            <p className="text-on-surface-variant">
              Students must maintain a minimum of <strong>75% attendance</strong> across all core and elective subjects. Falling below 75% renders a student ineligible to appear in Dibrugarh University End-Semester examinations.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <h4 className="font-sans font-bold text-oxford-navy text-sm">Sessional Examinations</h4>
            <p className="text-on-surface-variant">
              Two sessional examinations are conducted every semester (carrying 20% of the total marking weight). The college sessional marks ledger is published on the student portal for student auditing prior to DU portal synchronization.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <h4 className="font-sans font-bold text-oxford-navy text-sm">Internal Assessment Marks</h4>
            <p className="text-on-surface-variant">
              Consists of Sessional Examinations (10 marks), Attendance Consistency (5 marks), and Seminars/Group Assignments (5 marks) making a total of <strong>20 marks</strong> per course paper.
            </p>
          </div>
        </div>
      </section>

      {/* Academic Calendar Widget */}
      <section className="bg-oxford-navy text-white rounded-2xl p-6 md:p-8 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h4 className="font-serif text-xl font-bold text-prestige-gold">FYUGP Semester IV Term Overview</h4>
            <p className="text-xs text-white/85">Official Semester Duration: July 2026 - December 2026</p>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Academic Calendar Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {[
            { title: "Sessional Exam I", desc: "Aug 20 - Aug 25, 2026", icon: Clock },
            { title: "Sessional Exam II", desc: "Oct 12 - Oct 16, 2026", icon: Clock },
            { title: "Marks Display", desc: "Oct 28, 2026", icon: FileCheck2 },
            { title: "DU Final Exams", desc: "Nov 23 - Dec 15, 2026", icon: Award }
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-1 text-center md:text-left">
                <span className="text-[10px] font-bold text-prestige-gold uppercase tracking-wider block">Phase {idx + 1}</span>
                <h5 className="font-bold text-sm text-white">{step.title}</h5>
                <p className="text-xs text-white/70 font-mono">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
