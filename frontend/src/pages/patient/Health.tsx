import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, Activity, Moon } from 'lucide-react';

const mockData = {
  'Today': [
    { time: '00:00', hr: 62, bp: 110 }, { time: '04:00', hr: 58, bp: 108 },
    { time: '08:00', hr: 75, bp: 120 }, { time: '12:00', hr: 82, bp: 125 },
    { time: '16:00', hr: 78, bp: 122 }, { time: '20:00', hr: 70, bp: 118 },
  ],
  '7 Days': [
    { time: 'Mon', hr: 72, bp: 118 }, { time: 'Tue', hr: 70, bp: 115 },
    { time: 'Wed', hr: 74, bp: 120 }, { time: 'Thu', hr: 71, bp: 119 },
    { time: 'Fri', hr: 75, bp: 122 }, { time: 'Sat', hr: 68, bp: 112 },
    { time: 'Sun', hr: 69, bp: 114 },
  ]
};

export default function Health() {
  const [range, setRange] = useState<'Today' | '7 Days'>('7 Days');

  return (
    <div className="p-6 md:p-12 lg:p-16 max-w-6xl">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-display font-medium tracking-tight mb-4">Health Monitoring</h1>
          <p className="text-xl text-muted-foreground">Track your vital signs over time.</p>
        </div>
        <div className="flex gap-2 bg-card p-1 border border-border rounded-xl">
          {['Today', '7 Days'].map(r => (
            <button 
              key={r}
              onClick={() => setRange(r as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${range === r ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-card border border-border rounded-[2rem] p-8 relative overflow-hidden group">
           <Heart className="w-8 h-8 text-accent mb-6" />
           <p className="text-muted-foreground mb-2">Avg Heart Rate</p>
           <h3 className="text-5xl font-display font-medium">71 <span className="text-2xl text-muted-foreground">bpm</span></h3>
           <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors"></div>
        </div>
        <div className="bg-card border border-border rounded-[2rem] p-8 relative overflow-hidden group">
           <Activity className="w-8 h-8 text-blue-500 mb-6" />
           <p className="text-muted-foreground mb-2">Avg Blood Pressure</p>
           <h3 className="text-5xl font-display font-medium">118/78 <span className="text-2xl text-muted-foreground">mmHg</span></h3>
           <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
        </div>
        <div className="bg-card border border-border rounded-[2rem] p-8 relative overflow-hidden group">
           <Moon className="w-8 h-8 text-indigo-500 mb-6" />
           <p className="text-muted-foreground mb-2">Avg Sleep</p>
           <h3 className="text-5xl font-display font-medium">7.2 <span className="text-2xl text-muted-foreground">hrs</span></h3>
           <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2rem] p-8 md:p-12">
        <h3 className="text-2xl font-display mb-8">Heart Rate & Blood Pressure Trend</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData[range]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" axisLine={false} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '1rem', color: 'var(--foreground)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Area type="monotone" dataKey="hr" name="Heart Rate (BPM)" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorHr)" />
              <Area type="monotone" dataKey="bp" name="Systolic BP" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
