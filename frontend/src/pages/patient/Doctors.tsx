import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { useAppStore } from '../../store/app';
import { Button } from '../../components/ui/button';

export default function Doctors() {
  const doctors = useAppStore(state => state.doctors);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-12 lg:p-16">
      <div className="mb-12">
        <h1 className="text-5xl font-display font-medium tracking-tight mb-4">Find a Doctor</h1>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, specialty or hospital..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-card border border-border rounded-full pl-12 pr-4 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDoctors.map(doc => (
          <div key={doc.id} className="bg-card border border-border rounded-[2rem] p-8 flex flex-col justify-between group hover:border-accent transition-colors">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center font-display text-xl">{doc.name.charAt(4)}</div>
                <div>
                  <h3 className="text-xl font-medium">{doc.name}</h3>
                  <p className="text-muted-foreground">{doc.specialty}</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-8 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium">{doc.experience}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-current" /> {doc.rating}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Consultation</span>
                  <span className="font-medium">${doc.fee}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-auto">
              <Link to={`/patient/doctors/${doc.id}`} className="flex-1">
                <Button variant="outline" className="w-full rounded-xl h-12">Profile</Button>
              </Link>
              <Link to={`/patient/doctors/${doc.id}`} className="flex-1">
                <Button className="w-full rounded-xl h-12">Book</Button>
              </Link>
            </div>
          </div>
        ))}
        {filteredDoctors.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground text-xl">
            No doctors found matching "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
}
