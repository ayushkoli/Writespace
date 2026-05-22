import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    age: '',
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('name', formData.name);
    data.append('password', formData.password);
    data.append('age', formData.age);
    if (profilePhoto) data.append('profilePhoto', profilePhoto);

    try {
      const uploadWarning = await register(data);
      if (uploadWarning) addToast(uploadWarning, 'info');
      navigate('/home');
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-texture flex flex-col px-4 py-8 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm mx-auto animate-scale-in flex-1">
        <Link to="/" className="flex justify-center mb-10" aria-label="Back to Writespace home">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-white/10 hover:scale-105 transition-transform">
            <PenLine className="w-7 h-7 text-black" strokeWidth={2.25} aria-hidden />
          </div>
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-8 text-center tracking-tight">Create account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-4 input-premium rounded-xl text-text-primary placeholder-text-muted font-medium text-base"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-4 input-premium rounded-xl text-text-primary placeholder-text-muted font-medium text-base"
            required
          />

          <input
            type="text"
            placeholder="Full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-4 input-premium rounded-xl text-text-primary placeholder-text-muted font-medium text-base"
            required
          />

          <input
            type="number"
            placeholder="Age"
            min="1"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full px-4 py-4 input-premium rounded-xl text-text-primary placeholder-text-muted font-medium text-base"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-4 input-premium rounded-xl text-text-primary placeholder-text-muted font-medium text-base"
            required
          />

          <div>
            <label className="block text-sm font-bold text-text-secondary mb-2">Profile photo (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
              className="w-full text-sm text-text-secondary font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-surface-2 file:text-text-primary hover:file:bg-surface-3 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 btn-primary font-bold rounded-full disabled:opacity-50 text-base"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link to="/" className="text-text-muted text-sm font-medium hover:text-text-secondary transition-colors">
            ← Back to home
          </Link>
        </p>

        <p className="mt-6 text-center text-text-secondary font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
