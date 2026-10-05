// ── Doctor Comparison Drawer ────────────────────────────────────────────────
// Shows up to 3 selected doctors side-by-side. Slides in from bottom on mobile,
// from the right on desktop.

import { X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { DOCTORS } from '../../data/doctors';
import type { Doctor } from '../../data/doctors';
import { useDoctorsStore } from '../../store/doctors';

const ROWS: { label: string; key: keyof typeof DOCTORS[0] | 'consultationFee' | 'consultationTypes' | 'languages' | 'availability' }[] = [
  { label: 'Specialty',         key: 'specialty' },
  { label: 'Department',        key: 'department' },
  { label: 'Experience',        key: 'experience' },
  { label: 'Qualifications',    key: 'qualifications' },
  { label: 'Languages',         key: 'languages' },
  { label: 'Consultation',      key: 'consultationTypes' },
  { label: 'Fee',               key: 'fee' },
  { label: 'Rating',            key: 'rating' },
];

interface Props {
  onClose: () => void;
  onBook: (doctorId: string) => void;
  doctorsList?: Doctor[];
}

export function CompareDrawer({ onClose, onBook, doctorsList }: Props) {
  const { compareList, clearCompare, toggleCompare } = useDoctorsStore();

  const source = doctorsList && doctorsList.length > 0 ? doctorsList : DOCTORS;
  const doctors = compareList
    .map(id => source.find(d => String(d.id) === String(id)))
    .filter(Boolean) as Doctor[];

  const renderCell = (doctor: typeof DOCTORS[0], row: typeof ROWS[0]) => {
    const val = (doctor as unknown as Record<string, unknown>)[row.key as string];
    if (row.key === 'experience') return `${val} years`;
    if (row.key === 'fee') return `$${val}`;
    if (row.key === 'rating') return (
      <span className="flex items-center gap-1 font-semibold">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        {String(val)}
      </span>
    );
    if (row.key === 'languages' || row.key === 'consultationTypes') {
      return (
        <div className="flex flex-wrap gap-1">
          {(val as string[]).map(v => (
            <span key={v} className="text-xs bg-muted px-2 py-0.5 rounded-full">{v}</span>
          ))}
        </div>
      );
    }
    return String(val ?? '—');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[75] flex items-end md:items-center justify-center p-0 md:p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          className="relative bg-card border border-border rounded-t-[2rem] md:rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col z-10"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-border shrink-0">
            <div>
              <h2 className="text-2xl font-display font-medium">Compare Doctors</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{doctors.length} of 3 selected</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={clearCompare} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Clear all
              </button>
              <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto sidebar-no-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted-foreground font-medium px-8 py-4 w-36 shrink-0">Attribute</th>
                  {doctors.map(doc => (
                    <th key={doc.id} className="px-6 py-4 text-left min-w-[180px]">
                      <div className="flex items-start gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0', doc.avatarColor)}>
                          {doc.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                        </div>
                        <button
                          onClick={() => toggleCompare(doc.id)}
                          className="ml-auto shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                  {/* Empty slot placeholders */}
                  {Array.from({ length: 3 - doctors.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="px-6 py-4 min-w-[180px]">
                      <div className="w-full h-12 border border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground text-xs">
                        + Add doctor
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, ri) => (
                  <tr key={row.label} className={cn('border-b border-border/50', ri % 2 === 0 && 'bg-muted/20')}>
                    <td className="px-8 py-4 text-muted-foreground font-medium whitespace-nowrap">{row.label}</td>
                    {doctors.map(doc => (
                      <td key={doc.id} className="px-6 py-4 text-foreground">
                        {renderCell(doc, row)}
                      </td>
                    ))}
                    {Array.from({ length: 3 - doctors.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="px-6 py-4" />
                    ))}
                  </tr>
                ))}
                {/* Book row */}
                <tr>
                  <td className="px-8 py-5 text-muted-foreground font-medium">Book</td>
                  {doctors.map(doc => (
                    <td key={doc.id} className="px-6 py-5">
                      <button
                        onClick={() => { onBook(doc.id); onClose(); }}
                        className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        Book Appointment
                      </button>
                    </td>
                  ))}
                  {Array.from({ length: 3 - doctors.length }).map((_, i) => (
                    <td key={`empty-${i}`} />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
