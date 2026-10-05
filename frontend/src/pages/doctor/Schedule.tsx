import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { doctorService, type AvailabilitySlot } from '../../services/doctor';
import { toast } from '../../components/ui/toast-store';

export default function DoctorSchedule() {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  const [newDay, setNewDay] = useState('MON');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [newType, setNewType] = useState('IN_PERSON');

  useEffect(() => {
    async function loadAvailability() {
      setIsLoading(true);
      try {
        const data = await doctorService.getAvailability();
        setSlots(data);
      } catch (err: any) {
        console.error('Failed to load availability:', err);
        toast.error(err?.message || 'Unable to load schedule');
      } finally {
        setIsLoading(false);
      }
    }
    loadAvailability();
  }, []);

  const handleAddSlot = async () => {
    if (!newStart || !newEnd) return;
    setIsSaving(true);
    try {
      const updatedSlots = [
        ...slots.map(s => ({ day: s.day, start: s.start, end: s.end, type: s.rawType || s.type })),
        { day: newDay, start: newStart, end: newEnd, type: newType }
      ];
      const res = await doctorService.updateAvailability({ slots: updatedSlots });
      setSlots(res);
      setIsAdding(false);
      toast.success('Availability updated successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add availability slot');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-12 lg:p-16 max-w-5xl">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-display font-medium tracking-tight mb-4">Schedule</h1>
          <p className="text-xl text-muted-foreground">Manage your availability.</p>
        </div>
        <Button size="lg" className="rounded-xl h-14 gap-2" onClick={() => setIsAdding(true)}>
          <Plus className="w-5 h-5" /> Add Availability
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-lg">Loading schedule...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-xl">
            No availability slots configured.
          </div>
        ) : (
          slots.map(slot => (
            <div key={slot.id} className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 font-medium"><CalendarIcon className="w-5 h-5 text-accent" /> {slot.day}</div>
                <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-muted-foreground" /> {slot.start} - {slot.end}</div>
              </div>
              <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium">{slot.type}</span>
            </div>
          ))
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border shadow-2xl rounded-[2rem] w-full max-w-md p-8 relative overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-display">New Availability</h2>
              <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Day of Week</label>
                <select 
                  value={newDay} 
                  onChange={(e) => setNewDay(e.target.value)} 
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:border-accent outline-none"
                >
                  <option value="MON">Monday</option>
                  <option value="TUE">Tuesday</option>
                  <option value="WED">Wednesday</option>
                  <option value="THU">Thursday</option>
                  <option value="FRI">Friday</option>
                  <option value="SAT">Saturday</option>
                  <option value="SUN">Sunday</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Consultation Type</label>
                <select 
                  value={newType} 
                  onChange={(e) => setNewType(e.target.value)} 
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:border-accent outline-none"
                >
                  <option value="IN_PERSON">In-Person</option>
                  <option value="VIDEO">Video Consultation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Start Time</label>
                  <input 
                    type="time" 
                    value={newStart} 
                    onChange={(e) => setNewStart(e.target.value)} 
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:border-accent outline-none" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">End Time</label>
                  <input 
                    type="time" 
                    value={newEnd} 
                    onChange={(e) => setNewEnd(e.target.value)} 
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 focus:border-accent outline-none" 
                  />
                </div>
              </div>

              <Button 
                className="w-full h-14 rounded-xl mt-4" 
                onClick={handleAddSlot} 
                disabled={isSaving}
                isLoading={isSaving}
              >
                {isSaving ? 'Saving Slot...' : 'Save Slot'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
