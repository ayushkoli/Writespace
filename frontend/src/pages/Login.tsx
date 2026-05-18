import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/home');
    } catch {
      setError('Invalid username, email, or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-texture flex flex-col justify-center px-4 py-10 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm mx-auto animate-scale-in">
        <Link to="/" className="flex justify-center mb-8" aria-label="Back to Writespace home">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-white/10 hover:scale-105 transition-transform">
            <PenLine className="w-7 h-7 text-black" strokeWidth={2.25} aria-hidden />
          </div>
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-8 text-center tracking-tight">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Email or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-4 py-3.5 sm:py-4 input-premium rounded-xl text-text-primary placeholder-text-muted font-medium text-base"
            autoComplete="username"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 sm:py-4 input-premium rounded-xl text-text-primary placeholder-text-muted font-medium text-base"
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 sm:py-4 btn-primary font-bold rounded-full disabled:opacity-50 touch-manipulation text-base"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link to="/" className="text-text-muted text-sm font-medium hover:text-text-secondary transition-colors">
            ← Back to home
          </Link>
        </p>

        <p className="mt-6 text-center text-text-secondary font-medium text-sm sm:text-base">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-white font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
