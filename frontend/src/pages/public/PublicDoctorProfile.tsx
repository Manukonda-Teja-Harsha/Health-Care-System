// ── Public Doctor Profile Page ────────────────────────────────────────────────
// Route: /doctors/:id — no auth required

import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Clock, MapPin, CheckCircle2, Heart,
  Video, Languages, Stethoscope, GraduationCap, Calendar,
  BarChart3, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import type { Doctor, DayKey } from '../../data/doctors';
import { useDoctorsStore } from '../../store/doctors';
import { BookingModal } from '../../components/doctors/BookingModal';
import { toast } from '../../components/ui/toast-store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DAY_ORDER: DayKey[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function PublicDoctorProfile() {
  const { id } = useParams<{ id: string }>();
  const { favorites, compareList, toggleFavorite, toggleCompare } = useDoctorsStore();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: '-80px' });

  const [doc, setDoc] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctor = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/doctors/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        let availMap: any = {
          MON: { label: '09:00 - 17:00', slots: ['09:00 AM', '11:00 AM', '02:00 PM'], bookedSlots: [] },
          TUE: { label: '09:00 - 17:00', slots: ['09:00 AM', '11:00 AM', '02:00 PM'], bookedSlots: [] },
          WED: { label: '09:00 - 17:00', slots: ['09:00 AM', '11:00 AM', '02:00 PM'], bookedSlots: [] },
          THU: { label: '09:00 - 17:00', slots: ['09:00 AM', '11:00 AM', '02:00 PM'], bookedSlots: [] },
          FRI: { label: '09:00 - 17:00', slots: ['09:00 AM', '11:00 AM', '02:00 PM'], bookedSlots: [] },
        };

        try {
          const aRes = await fetch(`${API_URL}/doctors/${id}/availability`);
          const aJson = await aRes.json();
          if (aJson.success && Array.isArray(aJson.data) && aJson.data.length > 0) {
            const customMap: any = {};
            aJson.data.forEach((slot: any) => {
              const day = slot.day_of_week;
              const formatTime = (timeStr: string) => {
                const parts = timeStr.split(':');
                let h = parseInt(parts[0], 10);
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                return `${h.toString().padStart(2, '0')}:${parts[1]} ${ampm}`;
              };
              const timeFormatted = formatTime(slot.start_time);
              if (!customMap[day]) {
                customMap[day] = {
                  label: `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`,
                  slots: [timeFormatted],
                  bookedSlots: []
                };
              } else if (!customMap[day].slots.includes(timeFormatted)) {
                customMap[day].slots.push(timeFormatted);
              }
            });
            availMap = customMap;
          }
        } catch {
          // fallback
        }

        setDoc({
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
          education: [
            { degree: d.qualification || 'MD', institution: 'University Medical College', year: 2012 }
          ],
          experienceTimeline: [
            { year: 2020, title: 'Senior Consultant', hospital: d.hospital || 'City General Hospital' },
            { year: 2015, title: 'Attending Physician', hospital: 'Regional Healthcare Centre' }
          ],
          availability: availMap,
          location: {
            building: d.hospital || 'City General Hospital',
            department: d.department || 'Outpatient Clinic',
            floor: d.floor || '2nd Floor',
            room: d.room || 'Room 201'
          },
          reviews: [
            { id: 'rev-1', patientName: 'Verified Patient', rating: 5, date: 'Recent', text: 'Exceptionally knowledgeable and thorough consultation.', verified: true }
          ]
        });
      } else {
        setError('Doctor not found');
      }
    } catch {
      setError('Unable to load doctor profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xl text-muted-foreground">Loading doctor profile...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
        <p className="text-6xl font-display">404</p>
        <p className="text-xl text-muted-foreground">{error || 'Doctor not found.'}</p>
        <div className="flex gap-4">
          <Button onClick={fetchDoctor} variant="default">Try Again</Button>
          <Link to="/doctors"><Button variant="outline">← All Doctors</Button></Link>
        </div>
      </div>
    );
  }

  const isFav = favorites.includes(doc.id);
  const isComparing = compareList.includes(doc.id);

  const handleFav = () => {
    toggleFavorite(doc.id);
    if (isFav) {
      toast.info('Removed from favourites');
    } else {
      toast.success(`${doc.name} added to favourites`);
    }
  };

  const handleCompare = () => {
    if (!isComparing && compareList.length >= 3) {
      toast.error('Max 3 doctors for comparison');
      return;
    }
    toggleCompare(doc.id);
    toast.info(isComparing ? 'Removed from comparison' : 'Added to comparison');
  };

  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: doc.reviews.filter(r => Math.floor(r.rating) === stars).length,
    pct: doc.reviews.length
      ? Math.round((doc.reviews.filter(r => Math.floor(r.rating) === stars).length / doc.reviews.length) * 100)
      : 0,
  }));

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Back nav */}
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <Link to="/doctors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-8">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Doctors
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Main content ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-[2rem] p-10"
          >
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className={cn('w-28 h-28 rounded-3xl flex items-center justify-center text-white font-display font-bold text-3xl shrink-0', doc.avatarColor)}>
                {doc.avatar}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-display font-medium tracking-tight">{doc.name}</h1>
                    <p className="text-accent font-medium mt-1">{doc.specialty}</p>
                    <p className="text-muted-foreground text-sm">{doc.department} · {doc.hospital}</p>
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button onClick={handleFav} className={cn('p-2.5 rounded-xl border transition-colors', isFav ? 'border-rose-500 bg-rose-500/10' : 'border-border hover:border-rose-400')}>
                      <Heart className={cn('w-5 h-5', isFav ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground')} />
                    </button>
                    <button onClick={handleCompare} className={cn('p-2.5 rounded-xl border transition-colors', isComparing ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent text-muted-foreground')}>
                      <BarChart3 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Stats */}
                <div className="flex flex-wrap gap-5 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold">{doc.rating}</span>
                    <span className="text-muted-foreground">({doc.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" /> {doc.experience} years experience
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className={doc.availableToday ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}>
                      {doc.nextSlot}
                    </span>
                  </div>
                </div>
                {/* Consult types */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {doc.consultationTypes.map(t => (
                    <span key={t} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-muted rounded-full text-muted-foreground">
                      {t === 'Video Consultation' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {t}
                    </span>
                  ))}
                  <span className={cn('px-3 py-1.5 rounded-full text-xs font-semibold',
                    doc.availableToday ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
                  )}>
                    {doc.availableToday ? '● Available Today' : '● Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* About */}
          <section className="bg-card border border-border rounded-[2rem] p-10">
            <h2 className="text-2xl font-display mb-4">About</h2>
            <p className="text-muted-foreground leading-relaxed">{doc.bio}</p>
          </section>

          {/* Expertise */}
          <section className="bg-card border border-border rounded-[2rem] p-10">
            <div className="flex items-center gap-3 mb-6">
              <Stethoscope className="w-5 h-5 text-accent" />
              <h2 className="text-2xl font-display">Areas of Expertise</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {doc.expertise.map(e => (
                <div key={e} className="flex items-center gap-2 border border-accent/30 bg-accent/5 text-accent px-4 py-2 rounded-full text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {e}
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="bg-card border border-border rounded-[2rem] p-10">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-5 h-5 text-accent" />
              <h2 className="text-2xl font-display">Education</h2>
            </div>
            <div className="space-y-4">
              {doc.education.map((edu, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border border-border rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-mono text-xs shrink-0">
                    {edu.year}
                  </div>
                  <div>
                    <p className="font-semibold">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Experience Timeline */}
          <section ref={timelineRef} className="bg-card border border-border rounded-[2rem] p-10">
            <h2 className="text-2xl font-display mb-8">Career Timeline</h2>
            <div className="relative pl-6 border-l border-border space-y-8">
              {doc.experienceTimeline.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={timelineInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.15, duration: 0.4 }}
                  className="relative"
                >
                  <div className="absolute -left-[1.8rem] top-1 w-4 h-4 rounded-full bg-accent border-2 border-background" />
                  <p className="text-xs font-mono text-muted-foreground mb-1">{entry.year}</p>
                  <p className="font-semibold">{entry.title}</p>
                  <p className="text-sm text-muted-foreground">{entry.hospital}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Availability Schedule */}
          <section className="bg-card border border-border rounded-[2rem] p-10">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-accent" />
              <h2 className="text-2xl font-display">Weekly Schedule</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DAY_ORDER.map(day => {
                const sched = doc.availability[day];
                const freeCount = sched ? sched.slots.length - sched.bookedSlots.length : 0;
                return (
                  <div key={day} className={cn('p-4 rounded-2xl border', sched ? 'border-border' : 'border-border/50 opacity-40')}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">{day}</p>
                      {sched ? (
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                          freeCount > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-500'
                        )}>
                          {freeCount > 0 ? `${freeCount} slots` : 'Fully booked'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not available</span>
                      )}
                    </div>
                    {sched && <p className="text-sm text-muted-foreground">{sched.label}</p>}
                    {sched && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sched.slots.map(slot => {
                          const booked = sched.bookedSlots.includes(slot);
                          return (
                            <span key={slot} className={cn(
                              'text-[10px] px-2 py-0.5 rounded-full border font-mono',
                              booked ? 'border-border text-muted-foreground/50 line-through' : 'border-accent/30 text-accent bg-accent/5'
                            )}>
                              {slot}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Reviews */}
          <section className="bg-card border border-border rounded-[2rem] p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display">Patient Reviews</h2>
              <span className="text-sm text-muted-foreground">{doc.reviewCount} total</span>
            </div>

            {/* Rating summary */}
            <div className="flex items-start gap-10 mb-8">
              <div className="text-center shrink-0">
                <p className="text-6xl font-display font-semibold">{doc.rating}</p>
                <div className="flex gap-0.5 mt-2 justify-center">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={cn('w-4 h-4', s <= Math.round(doc.rating) ? 'text-amber-400 fill-amber-400' : 'text-border')} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{doc.reviewCount} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {ratingBreakdown.map(rb => (
                  <div key={rb.stars} className="flex items-center gap-3 text-sm">
                    <span className="w-4 text-right text-muted-foreground">{rb.stars}</span>
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${rb.pct}%` }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="h-full bg-amber-400 rounded-full"
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{rb.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review cards */}
            <div className="space-y-5">
              {(showAllReviews ? doc.reviews : doc.reviews.slice(0, 3)).map((review) => (
                <div key={review.id} className="p-5 border border-border rounded-2xl">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{review.patientName}</p>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{review.date}</p>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={cn('w-3.5 h-3.5', s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-border')} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>

            {doc.reviews.length > 3 && (
              <button
                onClick={() => setShowAllReviews(v => !v)}
                className="mt-5 flex items-center gap-2 text-sm text-accent hover:underline"
              >
                {showAllReviews ? <><ChevronUp className="w-4 h-4" /> Show fewer</> : <><ChevronDown className="w-4 h-4" /> View all {doc.reviews.length} reviews</>}
              </button>
            )}
          </section>

          {/* Location */}
          <section className="bg-card border border-border rounded-[2rem] p-10">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-accent" />
              <h2 className="text-2xl font-display">Hospital Location</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Hospital',    val: doc.location.building },
                { label: 'Department',  val: doc.location.department },
                { label: 'Floor',       val: doc.location.floor },
                { label: 'Room / Clinic', val: doc.location.room },
              ].map(r => (
                <div key={r.label} className="p-4 bg-muted/40 rounded-2xl">
                  <p className="text-xs text-muted-foreground mb-1">{r.label}</p>
                  <p className="font-semibold">{r.val}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── RIGHT: Sticky booking panel ───────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-4">
            {/* Booking card */}
            <div className="bg-card border border-border rounded-[2rem] p-8 space-y-6">
              <div>
                <p className="text-muted-foreground text-sm">Consultation fee</p>
                <p className="text-4xl font-display font-semibold mt-1">${doc.fee}</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next slot</span>
                  <span className={cn('font-medium', doc.availableToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground')}>{doc.nextSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium">{doc.experience} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {doc.rating}
                  </span>
                </div>
              </div>
              <Button className="w-full h-12 rounded-xl text-base" onClick={() => setBookingOpen(true)}>
                Book Appointment
              </Button>
              <Link to="/my-appointments">
                <Button variant="ghost" className="w-full h-10 rounded-xl text-sm">
                  View My Appointments →
                </Button>
              </Link>
            </div>

            {/* Languages */}
            <div className="bg-card border border-border rounded-[2rem] p-6">
              <div className="flex items-center gap-2 mb-3">
                <Languages className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">Languages</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {doc.languages.map(l => (
                  <span key={l} className="text-xs px-3 py-1.5 bg-muted rounded-full font-medium">{l}</span>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div className="bg-card border border-border rounded-[2rem] p-6">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm">Qualifications</h3>
              </div>
              <p className="font-mono text-xs text-muted-foreground">{doc.qualifications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingOpen && (
          <BookingModal key="booking" doctor={doc} onClose={() => setBookingOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
