import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, BookOpen, ChevronDown, ChevronUp, FileText, Sparkles, TrendingUp } from 'lucide-react';
import { SemesterResult, Student } from '../types';

interface ResultsTabProps {
  student: Student;
  semesterResults: SemesterResult[];
  onOpenInternalMarks: () => void;
}

export default function ResultsTab({
  student,
  semesterResults,
  onOpenInternalMarks,
}: ResultsTabProps) {
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(semesterResults[0]?.id || '');
  const [expandedSubjectCode, setExpandedSubjectCode] = useState<string | null>(null);

  const selectedSemester = semesterResults.find((s) => s.id === selectedSemesterId);

  // Total credits passed
  const totalCredits = semesterResults.reduce((acc, sem) => {
    return acc + sem.subjects.reduce((sum, s) => sum + s.credits, 0);
  }, 0);

  // Mock details of constituent internal assessment for expanding
  const getInternalBreakdown = (subjectCode: string) => {
    return [
      { component: 'Class Test 1 (Midterm)', marks: '14 / 15' },
      { component: 'Home Assignment & Quiz', marks: '9 / 10' },
      { component: 'Regularity & Attendance', marks: '4 / 5' },
    ];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20"
    >
      {/* Top Academic Record Overview */}
      <section className="glass-card p-6 rounded-2xl shadow-md border-t-4 border-oxford-navy flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-oxford-navy/5 flex items-center justify-center text-oxford-navy">
            <Award className="w-6 h-6 text-prestige-gold" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-gray uppercase tracking-wider">Cumulative Performance</span>
            <h3 className="font-serif text-3xl font-bold text-oxford-navy">{student.cgpa} CGPA</h3>
            <p className="text-xs text-slate-gray font-medium">B.Sc Physics, Semester IV</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 divide-x divide-outline-variant/30 text-center sm:text-left">
          <div className="px-3">
            <span className="text-[10px] font-bold text-slate-gray uppercase block">Passed Credits</span>
            <span className="font-serif text-xl font-bold text-oxford-navy">{totalCredits}</span>
            <p className="text-[9px] text-slate-gray font-medium">Total registered: {totalCredits}</p>
          </div>
          <div className="px-4">
            <span className="text-[10px] font-bold text-slate-gray uppercase block">Academic Standing</span>
            <span className="font-serif text-lg font-bold text-prestige-gold">Dean's List</span>
            <p className="text-[9px] text-green-600 font-bold uppercase mt-0.5">Top 3% Student</p>
          </div>
        </div>
      </section>

      {/* Semester Dropdown Selector */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <h3 className="font-serif text-xl font-bold text-oxford-navy">Examination Grades</h3>
          
          {/* Select dropdown */}
          <div className="relative">
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="w-full sm:w-60 text-sm bg-white border border-outline-variant/50 rounded-xl p-2 px-3 text-oxford-navy font-semibold outline-none focus:border-prestige-gold cursor-pointer shadow-sm"
              id="semester-results-select"
            >
              {semesterResults.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.semesterName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Semester overview */}
        {selectedSemester && (
          <div className="space-y-4">
            <div className="bg-oxford-navy/5 p-4 rounded-xl flex justify-between items-center border border-oxford-navy/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-prestige-gold" />
                <span className="text-xs font-bold text-slate-gray uppercase">Semester Grade Point Average:</span>
              </div>
              <span className="font-serif text-xl font-bold text-oxford-navy bg-white px-3 py-1 rounded-lg border border-outline-variant/30 shadow-sm">
                {selectedSemester.sgpa} SGPA
              </span>
            </div>

            {/* Subject Grades Table */}
            <div className="space-y-3">
              {selectedSemester.subjects.map((sub) => {
                const isExpanded = expandedSubjectCode === sub.code;
                const totalMarksObtained = sub.internalMarks + sub.externalMarks;
                return (
                  <div
                    key={sub.code}
                    className="glass-card rounded-xl shadow-sm border border-outline-variant/20 hover:border-prestige-gold/50 transition-all overflow-hidden"
                  >
                    {/* Item row */}
                    <div
                      onClick={() => setExpandedSubjectCode(isExpanded ? null : sub.code)}
                      className="p-4 flex justify-between items-center cursor-pointer select-none"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-oxford-navy/5 text-oxford-navy px-1.5 py-0.5 rounded">
                            {sub.code}
                          </span>
                          <span className="text-xs text-slate-gray font-semibold">
                            {sub.credits} Credits
                          </span>
                        </div>
                        <h4 className="font-sans text-sm md:text-base font-semibold text-oxford-navy mt-1">
                          {sub.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center">
                          <span className="text-xs text-slate-gray font-bold block uppercase">Grade</span>
                          <span className="font-serif text-base font-bold text-prestige-gold">
                            {sub.grade}
                          </span>
                        </div>
                        <div className="text-center min-w-16">
                          <span className="text-xs text-slate-gray font-bold block uppercase">Total Marks</span>
                          <span className="font-sans text-sm font-semibold text-oxford-navy">
                            {totalMarksObtained} / {sub.maxMarks}
                          </span>
                        </div>
                        <div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-gray" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-gray" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded view (Internal / External breakdown) */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 bg-surface-container-low border-t border-outline-variant/20 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                          {/* Left: Marks Breakdown */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-gray uppercase tracking-wider block">
                              Evaluation Breakdown
                            </span>
                            <div className="flex justify-between py-1 border-b border-outline-variant/10">
                              <span className="text-on-surface-variant">Continuous Internal Assessment (CIA):</span>
                              <span className="font-semibold text-oxford-navy">
                                {sub.internalMarks} / 30
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-outline-variant/10">
                              <span className="text-on-surface-variant">End Semester Written Exam:</span>
                              <span className="font-semibold text-oxford-navy">
                                {sub.externalMarks} / 70
                              </span>
                            </div>
                            <div className="flex justify-between py-1 font-bold pt-1.5">
                              <span className="text-oxford-navy">Aggregated Total Score:</span>
                              <span className="text-oxford-navy">
                                {totalMarksObtained} / {sub.maxMarks}
                              </span>
                            </div>
                          </div>

                          {/* Right: Internal Assessment detailed items */}
                          <div className="bg-white p-3 rounded-lg border border-outline-variant/30 space-y-2">
                            <span className="text-[9px] font-bold text-prestige-gold uppercase tracking-wider block flex justify-between items-center">
                              <span>CIA Breakdown Details</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenInternalMarks();
                                }}
                                className="text-[9px] text-oxford-navy hover:underline lowercase font-semibold"
                              >
                                view syllabus criteria
                              </button>
                            </span>
                            
                            {getInternalBreakdown(sub.code).map((item, index) => (
                              <div key={index} className="flex justify-between text-[11px] text-on-surface-variant">
                                <span>{item.component}:</span>
                                <span className="font-medium text-slate-gray">{item.marks}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* GPA Planner interactive panel */}
      <section className="glass-card p-5 rounded-2xl shadow-md space-y-4">
        <h3 className="font-serif text-lg font-bold text-oxford-navy flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-prestige-gold" />
          Academic CGPA Goal Planner
        </h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Estimate what next semester's SGPA you need to achieve your target graduation CGPA!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-gray uppercase mb-1.5">
              Target CGPA Goal
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="7.0"
                max="10.0"
                step="0.05"
                defaultValue="9.0"
                className="w-full accent-prestige-gold"
                id="gpa-target-slider"
                onChange={(e) => {
                  const target = parseFloat(e.target.value);
                  const display = document.getElementById('target-gpa-val');
                  const required = document.getElementById('required-gpa-val');
                  if (display) display.textContent = target.toFixed(2);
                  if (required) {
                    // CGPA = (Sem1*credits + Sem2*credits + Sem3*credits + Sem4*Req) / total_credits
                    // Simply say: (CurrentCGPA * 3 + Req) / 4 = Target
                    // Req = Target * 4 - CurrentCGPA * 3
                    const currentCGPA = student.cgpa;
                    const req = target * 4 - currentCGPA * 3;
                    if (req > 10) {
                      required.textContent = "Not mathematically possible (>10.0)";
                      required.className = "text-error font-bold text-sm";
                    } else if (req < 4.0) {
                      required.textContent = "Already achieved (<4.0)";
                      required.className = "text-green-600 font-bold text-sm";
                    } else {
                      required.textContent = `${req.toFixed(2)} SGPA`;
                      required.className = "text-oxford-navy font-bold text-sm";
                    }
                  }
                }}
              />
              <span id="target-gpa-val" className="font-serif font-bold text-lg text-oxford-navy w-10">9.00</span>
            </div>
          </div>

          <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20 flex flex-col justify-center">
            <span className="text-[10px] text-slate-gray uppercase font-bold">Required Sem IV SGPA</span>
            <div id="required-gpa-val" className="font-sans font-bold text-oxford-navy text-sm mt-1">
              9.24 SGPA
            </div>
            <p className="text-[10px] text-slate-gray mt-1">Based on previous 3 Semesters' aggregate CGPA of {student.cgpa}.</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
