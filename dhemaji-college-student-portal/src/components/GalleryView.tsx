import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, Maximize2, X, Info } from 'lucide-react';

interface GalleryItem {
  id: string;
  image: string;
  title: string;
  category: 'Campus' | 'Labs' | 'Library' | 'Activities';
  description: string;
}

const GALLERY_DATA: GalleryItem[] = [
  {
    id: "gal-1",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    title: "Main Academic Building",
    category: "Campus",
    description: "The primary academic block housing Arts & Science lecture halls, faculty common rooms, and the Principal's chamber."
  },
  {
    id: "gal-2",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    title: "Central Digital Library Reading Room",
    category: "Library",
    description: "Our spacious reading environment housing over 40,000 physical volumes and 10+ digital terminals for research database access."
  },
  {
    id: "gal-3",
    image: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&w=800&q=80",
    title: "Biotechnology & Chemistry Lab",
    category: "Labs",
    description: "State-of-the-art laboratory rigs funded by DST-FIST, supporting honors research and analytical testing."
  },
  {
    id: "gal-4",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    title: "Physics Mechanics & Optics Lab",
    category: "Labs",
    description: "Modern equipment layouts for spectroscopy, mechanics, and computational physics testing."
  },
  {
    id: "gal-5",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    title: "Digital ICT & Computer Center",
    category: "Labs",
    description: "Equipped with 45+ high-speed nodes, dedicated servers, and legal software bundles supporting BCA, PGDCA, and IT programs."
  },
  {
    id: "gal-6",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    title: "Annual College Athletics Meet",
    category: "Activities",
    description: "Students participating in track and field trials at the main college playground during college week."
  },
  {
    id: "gal-7",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    title: "Dr. Radha Krishnan Auditorium Hall",
    category: "Campus",
    description: "Fully air-conditioned seminar and conference auditorium with standard acoustics, hosting workshops and cultural programs."
  },
  {
    id: "gal-8",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    title: "Lush Campus Green Lawns",
    category: "Campus",
    description: "Beautiful clean-green garden lawn, maintaining rich biodiversity and ecological balance on campus grounds."
  }
];

export default function GalleryView() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const filters = ['All', 'Campus', 'Labs', 'Library', 'Activities'];

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') return GALLERY_DATA;
    return GALLERY_DATA.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-16 font-sans"
    >
      {/* Title */}
      <section className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-prestige-gold">Campus Visuals</span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-oxford-navy">Campus Photo Gallery</h2>
        <p className="text-xs text-slate-gray max-w-xl mx-auto">
          Explore snapshots of Dhemaji College, including classroom setups, advanced scientific labs, our main sports arenas, and ecological lawns.
        </p>
        <div className="h-0.5 w-24 bg-prestige-gold mx-auto mt-2" />
      </section>

      {/* Filter Options */}
      <section className="flex flex-wrap gap-2 justify-center bg-white p-3.5 rounded-xl border border-outline-variant/30 shadow-sm max-w-md mx-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeFilter === f
                ? 'bg-oxford-navy text-white shadow-sm font-bold'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {f}
          </button>
        ))}
      </section>

      {/* Gallery Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setLightboxItem(item)}
            className="group bg-white rounded-2xl border border-outline-variant/25 shadow-sm overflow-hidden cursor-pointer hover:border-prestige-gold/40 hover:shadow-md transition-all duration-300 relative"
          >
            {/* Image frame */}
            <div className="h-48 overflow-hidden relative bg-slate-100">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {/* Blur Hover cover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 text-white backdrop-blur-md flex items-center justify-center">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </div>
              <span className="absolute bottom-2 left-2 text-[8px] font-bold text-white bg-oxford-navy/70 backdrop-blur-sm px-2 py-0.5 rounded uppercase">
                {item.category}
              </span>
            </div>

            {/* Info details */}
            <div className="p-4 space-y-1 bg-white">
              <h3 className="font-sans text-xs font-bold text-oxford-navy truncate group-hover:text-prestige-gold transition-colors">
                {item.title}
              </h3>
              <p className="text-[10px] text-slate-gray line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Lightbox Modal overlay */}
      <AnimatePresence>
        {lightboxItem && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxItem(null)}
              className="fixed inset-0 bg-black z-55 flex items-center justify-center"
            />

            {/* Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 max-w-3xl mx-auto top-24 md:top-32 bg-white rounded-2xl overflow-hidden shadow-2xl z-55 border border-white/10 flex flex-col"
            >
              {/* Main Expanded Image */}
              <div className="relative h-[250px] md:h-[450px] bg-black flex items-center justify-center">
                <img
                  src={lightboxItem.image}
                  alt={lightboxItem.title}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setLightboxItem(null)}
                  className="absolute top-4 right-4 p-2 bg-black/55 hover:bg-black/80 rounded-full text-white cursor-pointer"
                  aria-label="Close Lightbox"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Descriptions Panel */}
              <div className="p-5 md:p-6 bg-oxford-navy text-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold bg-prestige-gold text-oxford-navy px-2 py-0.5 rounded uppercase font-mono">
                    {lightboxItem.category}
                  </span>
                  <h3 className="font-serif text-base md:text-lg font-bold text-white leading-tight">
                    {lightboxItem.title}
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-white/85 leading-relaxed font-sans">
                  {lightboxItem.description}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
