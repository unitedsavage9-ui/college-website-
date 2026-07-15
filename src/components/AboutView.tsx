import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Compass, Landmark, Users, Award, BookOpen } from 'lucide-react';

export default function AboutView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-10 pb-16 font-sans"
    >
      {/* Page Title */}
      <section className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-prestige-gold">Institutional Profile</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-oxford-navy">About Dhemaji College</h2>
        <div className="h-0.5 w-24 bg-prestige-gold mx-auto mt-2" />
      </section>

      {/* Motto, Vision & Mission Blocks */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-prestige-gold/10 text-prestige-gold flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-oxford-navy">Our Motto</h3>
          <p className="text-sm font-semibold text-prestige-gold italic">
            "Tamaso Ma Jyotirgamaya"
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Translated from Sanskrit, it means <strong>"Lead me from darkness to light."</strong> It represents our goal to disperse the darkness of ignorance with the light of wisdom.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-oxford-navy/5 text-oxford-navy flex items-center justify-center">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-oxford-navy">Our Vision</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            To make Dhemaji College a center of educational excellence, equipping rural students with academic expertise, scientific temper, moral integrity, and social commitment.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-oxford-navy/5 text-oxford-navy flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-oxford-navy">Our Mission</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            To provide equal learning opportunities, offer skill-oriented education, nurture potential in scientific research, and preserve the ethnic cultural heritage of Assam.
          </p>
        </div>
      </section>

      {/* College Brief History */}
      <section className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/30 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h3 className="font-serif text-2xl font-bold text-oxford-navy">A Legacy Since 1965</h3>
          <div className="h-0.5 w-12 bg-prestige-gold" />
          <div className="text-xs md:text-sm text-on-surface-variant space-y-3 leading-relaxed">
            <p>
              Dhemaji College holds the distinction of being the first and oldest institution of higher education in Dhemaji district. Established in the year <strong>1965</strong>, the college arose through the relentless contributions, sacrifices, and coordination of the local community.
            </p>
            <p>
              The college initially commenced as an Arts college, and subsequently expanded with a full-fledged <strong>Science stream in 1978</strong>. Over the last six decades, Dhemaji College has nurtured thousands of alumni who are actively serving Assam, India, and global institutions.
            </p>
            <p>
              In recognition of its outstanding performance, the National Assessment and Accreditation Council (NAAC) accredited Dhemaji College with <strong>'A' Grade (CGPA 3.12)</strong> during the third cycle of assessment, establishing it as an autonomous academic leader.
            </p>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden shadow-md border border-outline-variant/20 h-64 md:h-80 bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"
            alt="Dhemaji college campus heritage"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Governing Body Listing */}
      <section className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-oxford-navy text-center">College Administration & Governing Body</h3>
        <p className="text-xs text-center text-slate-gray max-w-xl mx-auto">
          The administrative machinery of Dhemaji College comprises distinguished educationists, community leaders, and departmental representatives.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: "Sri Phanidhar Baruah", role: "President, Governing Body", status: "Administrative Head" },
            { name: "Dr. Dipak Kr. Neog", role: "Principal & Secretary", status: "Academic & Executive Head" },
            { name: "Sri Diganta Kumar Chutia", role: "Vice Principal", status: "Academic Coordinator" },
            { name: "Dr. Amit Baruah", role: "Senior Coordinator, IQAC", status: "Quality Assurance cell" }
          ].map((item) => (
            <div key={item.name} className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-xl text-center space-y-1.5 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-oxford-navy text-white font-serif font-bold text-sm flex items-center justify-center mx-auto shadow-inner">
                {item.name.charAt(4) || item.name.charAt(0)}
              </div>
              <h4 className="font-sans text-xs font-bold text-oxford-navy mt-2">{item.name}</h4>
              <p className="text-[10px] text-prestige-gold font-bold">{item.role}</p>
              <p className="text-[9px] text-slate-gray font-mono">{item.status}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quality Indicators & Certifications */}
      <section className="bg-oxford-navy text-white rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="space-y-2 col-span-1 md:col-span-2">
          <h4 className="font-serif text-xl font-bold text-prestige-gold">Institutional Benchmarks</h4>
          <p className="text-xs text-white/85 leading-relaxed">
            Dhemaji College strictly complies with administrative standards defined by the UGC, RUSA, and Government of Assam. We are constantly reviewing and strengthening quality parameters across all teaching departments.
          </p>
        </div>
        <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-prestige-gold">✓ UGC Section 2(f) & 12(B) compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-prestige-gold">✓ Affiliated to Dibrugarh University</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-prestige-gold">✓ NAAC Accredited 'A' Grade</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
