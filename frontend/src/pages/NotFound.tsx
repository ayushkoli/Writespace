import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  const homeTo = user ? '/home' : '/';

  return (
    <div className="min-h-screen bg-texture flex flex-col items-center justify-center px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-white/10 mb-6">
        <PenLine className="w-7 h-7 text-black" strokeWidth={2.25} aria-hidden />
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-2">Page not found</h1>
      <p className="text-text-secondary font-medium mb-8 max-w-sm">
        This page doesn&apos;t exist or may have been moved.
      </p>
      <Link to={homeTo} className="px-8 py-3 btn-primary font-bold rounded-full">
        {user ? 'Back to feed' : 'Back to home'}
      </Link>
    </div>
  );
}
