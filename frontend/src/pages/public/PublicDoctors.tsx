// ── Public Doctors Directory ────────────────────────────────────────────────
// Route: /doctors — no authentication required

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Star, Clock, MapPin, Heart, ChevronRight, SlidersHorizontal,
  X, BarChart3, CheckCircle2, Video, Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { DEPARTMENTS, SYMPTOM_MAP } from '../../data/doctors';
import type { Doctor } from '../../data/doctors';
import { useDoctorsStore } from '../../store/doctors';
import { BookingModal } from '../../components/doctors/BookingModal';
import { CompareDrawer } from '../../components/doctors/CompareDrawer';
import { toast } from '../../components/ui/toast-store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Filter types ────────────────────────────────────────────────────────────
type SortKey   = 'recommended' | 'experience' | 'rating' | 'fee-asc' | 'fee-desc';
type ExpFilter = 'any' | '0-5' | '5-10' | '10+';
type AvailFilter = 'any' | 'today' | 'unavailable';
type ConsultFilter = 'any' | 'In-Person' | 'Video Consultation';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function matchesSearch(doc: Doctor, q: string): boolean {
  if (!q) return true;
  const t = q.toLowerCase();
  return (
    doc.name.toLowerCase().includes(t) ||
    doc.specialty.toLowerCase().includes(t) ||
    doc.department.toLowerCase().includes(t) ||
    doc.expertise.some(e => e.toLowerCase().includes(t)) ||
    doc.qualifications.toLowerCase().includes(t) ||
    doc.bio.toLowerCase().includes(t)
  );
}

function matchesExp(doc: Doctor, f: ExpFilter): boolean {
  if (f === 'any') return true;
  if (f === '0-5')  return doc.experience <= 5;
  if (f === '5-10') return doc.experience > 5 && doc.experience <= 10;
  return doc.experience > 10;
}

function sortDocs(docs: Doctor[], key: SortKey): Doctor[] {
  return [...docs].sort((a, b) => {
    if (key === 'experience') return b.experience - a.experience;
    if (key === 'rating')     return b.rating - a.rating;
    if (key === 'fee-asc')    return a.fee - b.fee;
    if (key === 'fee-desc')   return b.fee - a.fee;
    // recommended: available first, then by rating
    if (a.availableToday && !b.availableToday) return -1;
    if (!a.availableToday && b.availableToday) return 1;
    return b.rating - a.rating;
  });
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PublicDoctorsPage() {
  const { favorites, compareList, toggleFavorite, toggleCompare } = useDoctorsStore();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch]         = useState('');
  const [dept,   setDept]           = useState('All');
  const [expF,   setExpF]           = useState<ExpFilter>('any');
  const [avail,  setAvail]          = useState<AvailFilter>('any');
  const [consult,setConsult]        = useState<ConsultFilter>('any');
  const [sort,   setSort]           = useState<SortKey>('recommended');
  const [showFilters, setShowFilters] = useState(false);
  const [showFavs,    setShowFavs]    = useState(false);

  // Booking
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  // Compare
  const [showCompare, setShowCompare] = useState(false);

  const allDepts = ['All', ...DEPARTMENTS.map(d => d.name)];

  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/doctors`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const formatted: Doctor[] = json.data.map((d: any) => ({
          id: String(d.id),
          name: d.name,
          specialty: d.specialization || d.specialty || 'General Specialist',
          department: d.department || 'General Medicine',
          qualifications: d.qualification || d.qualifications || 'MD',
          experience: Number(d.experience || d.experience_years || 0),
          bio: d.bio || '',
          rating: Number(d.rating || 5.0),
          reviewCount: Number(d.review_count || 0),
          fee: Number(d.consultation_fee || d.fee || 100),
          hospital: d.hospital || 'City General Hospital',
          avatar: d.profile_image || d.avatar || '',
          avatarColor: 'from-blue-600 to-indigo-700',
          consultationTypes: ['In-Person', 'Video Consultation'],
          availableToday: true,
          nextSlot: 'Today, 2:30 PM',
          expertise: d.specialization ? [d.specialization] : [],
          languages: typeof d.languages === 'string' ? d.languages.split(',').map((s: string) => s.trim()) : (d.languages || ['English']),
          education: [],
          experienceTimeline: [],
          availability: {
            MON: { label: '09:00 - 17:00', slots: ['09:00 AM', '11:00 AM', '02:00 PM'], bookedSlots: [] },
            TUE: { label: '09:00 - 17:00', slots: ['09:00 AM', '11:00 AM', '02:00 PM'], bookedSlots: [] },
            WED: { label: '09:00 - 17:00', slots: ['09:00 AM', '11:00 AM', '02:00 PM'], bookedSlots: [] },
            THU: { label: '09:00 - 17:00', slots: ['09:00 AM', '11:00 AM', '02:00 PM'], bookedSlots: [] },
            FRI: { label: '09:00 - 17:00', slots: ['09:00 AM', '11:00 AM', '02:00 PM'], bookedSlots: [] },
          },
          location: {
            building: d.hospital || 'City General Hospital',
            department: d.department || 'Outpatient Clinic',
            floor: d.floor || '2nd Floor',
            room: d.room || 'Room 201'
          },
          reviews: []
        }));
        setDoctors(formatted);
      } else {
        setError('Unable to load doctors.');
      }
    } catch {
      setError('Unable to load doctors.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filtered = useMemo(() => {
    let docs = doctors.filter(d => {
      if (showFavs && !favorites.includes(d.id)) return false;
      if (!matchesSearch(d, search)) return false;
      if (dept !== 'All' && d.department !== dept) return false;
      if (!matchesExp(d, expF)) return false;
      if (avail === 'today' && !d.availableToday) return false;
      if (avail === 'unavailable' && d.availableToday) return false;
      if (consult !== 'any' && !d.consultationTypes.includes(consult as 'In-Person' | 'Video Consultation')) return false;
      return true;
    });
    return sortDocs(docs, sort);
  }, [doctors, search, dept, expF, avail, consult, sort, showFavs, favorites]);

  const hasFilters = dept !== 'All' || expF !== 'any' || avail !== 'any' || consult !== 'any';

  const clearFilters = () => {
    setDept('All'); setExpF('any'); setAvail('any'); setConsult('any'); setSearch('');
  };

  const handleFav = (id: string, name: string) => {
    const wasFav = favorites.includes(id);
    toggleFavorite(id);
    if (wasFav) {
      toast.info('Removed from favourites');
    } else {
      toast.success(`${name} added to favourites`);
    }
  };

  const handleCompare = (id: string) => {
    if (!compareList.includes(id) && compareList.length >= 3) {
      toast.error('You can compare up to 3 doctors at a time');
      return;
    }
    toggleCompare(id);
  };

  const handleSymptom = (symptom: string) => {
    const targetDept = SYMPTOM_MAP[symptom];
    setDept(targetDept);
    setSearch('');
    document.getElementById('doctors-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-accent text-sm font-medium tracking-widest uppercase mb-4">City General Hospital</p>
            <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tight mb-6">
              Find Your Doctor
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mb-10">
              Connect with our team of highly qualified specialists and consultants. Browse, compare, and book an appointment directly.
            </p>
            {/* Search bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, specialty, or symptom…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-14 bg-background border border-border rounded-2xl pl-14 pr-5 text-base focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── FIND RIGHT DOCTOR ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-display font-medium mb-6">What do you need help with?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(SYMPTOM_MAP).map(([symptom, targetDept]) => (
            <button
              key={symptom}
              onClick={() => handleSymptom(symptom)}
              className={cn(
                'p-4 rounded-2xl border text-left transition-all hover:border-accent hover:bg-accent/5 group',
                dept === targetDept ? 'border-accent bg-accent/8' : 'border-border'
              )}
            >
              <p className="text-sm font-semibold group-hover:text-accent transition-colors">{symptom}</p>
              <p className="text-xs text-muted-foreground mt-1">{targetDept}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── DEPARTMENTS ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-display font-medium mb-6">Departments</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {DEPARTMENTS.map((d) => {
            const count = doctors.filter((doc: Doctor) => doc.department === d.name).length;
            return (
              <button
                key={d.name}
                onClick={() => setDept(prev => prev === d.name ? 'All' : d.name)}
                className={cn(
                  'p-5 rounded-2xl border text-left transition-all hover:border-accent group',
                  dept === d.name ? 'border-accent bg-accent/8' : 'border-border'
                )}
              >
                <div className="text-3xl mb-3">{d.icon}</div>
                <p className="font-semibold text-sm group-hover:text-accent transition-colors">{d.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{count} doctor{count !== 1 ? 's' : ''}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FILTERS + SORT BAR ────────────────────────────────────────────── */}
      <div className="sticky top-20 z-40 bg-background/90 backdrop-blur-md border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 flex-wrap">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors',
              showFilters ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-accent" />}
          </button>

          {/* Availability quick pills */}
          {(['any', 'today'] as AvailFilter[]).map(a => (
            <button
              key={a}
              onClick={() => setAvail(a)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors',
                avail === a ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              )}
            >
              {a === 'today' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {a === 'any' ? 'All doctors' : 'Available today'}
            </button>
          ))}

          {/* Favourites toggle */}
          <button
            onClick={() => setShowFavs(v => !v)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors',
              showFavs ? 'bg-rose-500 text-white border-rose-500' : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
            )}
          >
            <Heart className={cn('w-3.5 h-3.5', showFavs && 'fill-current')} />
            Favourites {favorites.length > 0 && `(${favorites.length})`}
          </button>

          {compareList.length > 0 && (
            <button
              onClick={() => setShowCompare(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Scale className="w-4 h-4" />
              Compare ({compareList.length})
            </button>
          )}

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="ml-auto bg-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="experience">Most Experienced</option>
            <option value="rating">Highest Rated</option>
            <option value="fee-asc">Fee: Low to High</option>
            <option value="fee-desc">Fee: High to Low</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Expanded filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Department */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Department</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allDepts.map(d => (
                      <button key={d} onClick={() => setDept(d)}
                        className={cn('px-3 py-1 rounded-full text-xs border transition-colors',
                          dept === d ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground text-muted-foreground'
                        )}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Experience */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Experience</p>
                  <div className="space-y-1.5">
                    {([['any', 'Any'], ['0-5', '0 – 5 years'], ['5-10', '5 – 10 years'], ['10+', '10+ years']] as [ExpFilter, string][]).map(([v, l]) => (
                      <button key={v} onClick={() => setExpF(v)}
                        className={cn('w-full text-left px-3 py-1.5 rounded-xl text-xs border transition-colors',
                          expF === v ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground text-muted-foreground'
                        )}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Availability */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Availability</p>
                  <div className="space-y-1.5">
                    {([['any', 'Any'], ['today', 'Available Today'], ['unavailable', 'Currently Unavailable']] as [AvailFilter, string][]).map(([v, l]) => (
                      <button key={v} onClick={() => setAvail(v)}
                        className={cn('w-full text-left px-3 py-1.5 rounded-xl text-xs border transition-colors',
                          avail === v ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground text-muted-foreground'
                        )}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Consultation type */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Consultation</p>
                  <div className="space-y-1.5">
                    {([['any', 'Any'], ['In-Person', 'In-Person'], ['Video Consultation', 'Video']] as [ConsultFilter, string][]).map(([v, l]) => (
                      <button key={v} onClick={() => setConsult(v)}
                        className={cn('w-full text-left px-3 py-1.5 rounded-xl text-xs border transition-colors',
                          consult === v ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground text-muted-foreground'
                        )}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── RESULTS ───────────────────────────────────────────────────────── */}
      <div id="doctors-grid" className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> doctor{filtered.length !== 1 ? 's' : ''} found
            {dept !== 'All' && ` in ${dept}`}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-24">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Loading doctors...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-xl text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchDoctors}>Try Again</Button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-3xl font-display mb-3">No doctors found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or clearing the filters.</p>
                <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
              </motion.div>
            ) : (
              <motion.div key="grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    layout
                  >
                    <DoctorCard
                      doc={doc}
                      isFav={favorites.includes(doc.id)}
                      isComparing={compareList.includes(doc.id)}
                      onFav={() => handleFav(doc.id, doc.name)}
                      onCompare={() => handleCompare(doc.id)}
                      onBook={() => setBookingDoctor(doc)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ── BOOKING MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {bookingDoctor && (
          <BookingModal
            key={bookingDoctor.id}
            doctor={bookingDoctor}
            onClose={() => setBookingDoctor(null)}
          />
        )}
      </AnimatePresence>

      {/* ── COMPARE DRAWER ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCompare && (
          <CompareDrawer
            key="compare"
            doctorsList={doctors}
            onClose={() => setShowCompare(false)}
            onBook={(id) => {
              const doc = doctors.find(d => String(d.id) === String(id));
              if (doc) setBookingDoctor(doc);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── FLOATING COMPARE BUTTON ───────────────────────────────────────── */}
      <AnimatePresence>
        {compareList.length > 0 && !showCompare && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            onClick={() => setShowCompare(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-2xl shadow-xl hover:opacity-90 transition-opacity font-medium"
          >
            <Scale className="w-5 h-5" />
            Compare {compareList.length} doctor{compareList.length > 1 ? 's' : ''}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Doctor Card ─────────────────────────────────────────────────────────────
interface CardProps {
  doc: Doctor;
  isFav: boolean;
  isComparing: boolean;
  onFav: () => void;
  onCompare: () => void;
  onBook: () => void;
}

function DoctorCard({ doc, isFav, isComparing, onFav, onCompare, onBook }: CardProps) {
  return (
    <div className={cn(
      'bg-card border rounded-[2rem] p-7 flex flex-col gap-5 transition-all group hover:shadow-lg',
      isComparing ? 'border-accent' : 'border-border hover:border-accent/50'
    )}>
      {/* Top row */}
      <div className="flex items-start gap-4">
        <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-white font-display font-semibold text-lg shrink-0 group-hover:scale-105 transition-transform', doc.avatarColor)}>
          {doc.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base leading-tight truncate">{doc.name}</h2>
          <p className="text-accent text-sm font-medium mt-0.5">{doc.specialty}</p>
          <p className="text-muted-foreground text-xs mt-0.5">{doc.department}</p>
        </div>
        {/* Favourite */}
        <button onClick={onFav} className="shrink-0 p-1.5 rounded-xl hover:bg-muted transition-colors">
          <Heart className={cn('w-4 h-4 transition-colors', isFav ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground hover:text-rose-400')} />
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-semibold text-foreground">{doc.rating}</span>
          <span>({doc.reviewCount})</span>
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {doc.experience} yrs
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span className={doc.availableToday ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>
            {doc.nextSlot}
          </span>
        </span>
      </div>

      {/* Consult type badges */}
      <div className="flex flex-wrap gap-2">
        {doc.consultationTypes.map(t => (
          <span key={t} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-muted rounded-full text-muted-foreground">
            {t === 'Video Consultation' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            {t}
          </span>
        ))}
        <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold ml-auto',
          doc.availableToday ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
        )}>
          {doc.availableToday ? 'Available' : 'Unavailable'}
        </span>
      </div>

      {/* Expertise chips */}
      <div className="flex flex-wrap gap-1.5">
        {doc.expertise.slice(0, 3).map(e => (
          <span key={e} className="text-xs px-2.5 py-1 bg-muted rounded-full text-muted-foreground">{e}</span>
        ))}
        {doc.expertise.length > 3 && (
          <span className="text-xs px-2.5 py-1 bg-muted rounded-full text-muted-foreground">+{doc.expertise.length - 3}</span>
        )}
      </div>

      {/* Fee + Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Fee</p>
          <p className="text-xl font-display font-semibold">${doc.fee}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Compare toggle */}
          <button
            onClick={onCompare}
            title={isComparing ? 'Remove from compare' : 'Add to compare'}
            className={cn(
              'p-2 rounded-xl border transition-colors',
              isComparing ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent text-muted-foreground'
            )}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <Link
            to={`/doctors/${doc.id}`}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted hover:border-foreground transition-colors"
          >
            Profile <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onBook}
            className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}
