import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore, type Role } from '../../store/auth';
import { Button } from '../../components/ui/button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(state => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Detect if user was redirected here from a protected route (e.g. /patient, /doctor)
  const from = (location.state as { from?: string })?.from;

  const fillDemo = (demoRole: Role) => {
    setEmail(`${demoRole}@example.com`);
    setPassword(`${demoRole}123`);
    setRole(demoRole);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const loggedInUser = await login(email, password, role);
      const userRole = (loggedInUser.role || role || 'patient').toLowerCase();
      // If user arrived from a specific route and the role matches, go there; otherwise go to role dashboard
      const destination = from && from.startsWith(`/${userRole}`) ? from : `/${userRole}`;
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md bg-card p-10 rounded-[2rem] border border-border shadow-xl">
        <h1 className="text-5xl font-display font-medium tracking-tight mb-2">Welcome</h1>
        {from ? (
          <p className="text-accent mb-8 text-base font-medium">
            Sign in to access {from.startsWith('/patient') ? 'your Patient dashboard' : from.startsWith('/doctor') ? 'the Doctor portal' : 'your account'}.
          </p>
        ) : (
          <p className="text-muted-foreground mb-8 text-lg">Sign in to your healthcare portal.</p>
        )}
        
        <div className="flex gap-2 mb-8 bg-muted/50 p-2 rounded-xl border border-border/50">
          <button type="button" onClick={() => fillDemo('patient')} className="flex-1 py-1.5 text-xs font-medium bg-background border border-border rounded-lg hover:bg-muted transition-colors">Demo Patient</button>
          <button type="button" onClick={() => fillDemo('doctor')} className="flex-1 py-1.5 text-xs font-medium bg-background border border-border rounded-lg hover:bg-muted transition-colors">Demo Doctor</button>
          <button type="button" onClick={() => fillDemo('admin')} className="flex-1 py-1.5 text-xs font-medium bg-background border border-border rounded-lg hover:bg-muted transition-colors">Demo Admin</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full h-14 bg-background border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow text-lg ${error && !email.includes('@') && email ? 'border-red-500' : 'border-border'}`}
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full h-14 bg-background border rounded-xl pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow text-lg ${error && password.length < 6 && password ? 'border-red-500' : 'border-border'}`}
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium">Role</label>
             <select 
               value={role || 'patient'}
               onChange={(e) => setRole(e.target.value as Role)}
               className="w-full h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent transition-shadow text-lg appearance-none"
             >
               <option value="patient">Patient</option>
               <option value="doctor">Doctor</option>
               <option value="admin">Admin</option>
             </select>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-border text-accent focus:ring-accent" defaultChecked />
              <span className="group-hover:text-foreground transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-accent hover:underline">Forgot password?</a>
          </div>

          <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-xl flex justify-center items-center gap-2 transition-all" disabled={isLoading}>
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</> : 'Login'}
          </Button>
        </form>

        <p className="mt-8 text-center text-muted-foreground">
          Don't have an account? <Link to="/register" className="text-foreground font-medium hover:underline">Create account</Link>
        </p>
      </div>
    </div>
  );
}
