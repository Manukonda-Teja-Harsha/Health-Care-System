import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, type Role } from '../../store/auth';
import { Button } from '../../components/ui/button';
import { Loader2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const registerUser = useAuthStore(state => state.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (role === 'doctor') {
      setError('Doctor accounts are provisioned by hospital administrators. Public registration is only available for patients.');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(name, email, password);
      navigate('/patient', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background pt-24">
      <div className="w-full max-w-md bg-card p-10 rounded-[2rem] border border-border shadow-xl">
        <h1 className="text-5xl font-display font-medium tracking-tight mb-2">Join us</h1>
        <p className="text-muted-foreground mb-10 text-lg">Create your healthcare account.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow text-lg"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow text-lg"
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow text-lg"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium">Role</label>
             <select 
               value={role || 'patient'}
               onChange={(e) => setRole(e.target.value as Role)}
               className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow text-lg appearance-none"
             >
               <option value="patient">Patient</option>
               <option value="doctor">Doctor (Hospital Staff)</option>
             </select>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-xl flex justify-center items-center gap-2" disabled={isLoading}>
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</> : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-muted-foreground">
          Already have an account? <Link to="/login" className="text-foreground font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
