import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-texture flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-3xl bg-white shadow-xl shadow-white/10 mb-6">
          <PenLine className="w-8 h-8 sm:w-9 sm:h-9 text-black" strokeWidth={2.25} aria-hidden />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight mb-3">Writespace</h1>
        <p className="text-text-secondary font-medium leading-relaxed mb-10 max-w-sm mx-auto">
          Share posts, follow creators, and save what you love  all in one clean writing space.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/register"
            className="w-full px-8 py-4 btn-primary font-bold rounded-full text-base touch-manipulation"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="w-full px-8 py-4 rounded-full font-bold text-base border border-border/60 text-text-primary hover:bg-white/5 transition-colors touch-manipulation"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </div>
  );
}
