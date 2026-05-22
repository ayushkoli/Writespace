import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-texture text-white flex flex-col justify-between relative overflow-hidden select-none">

      {/* Header / Navbar */}
      <header className="w-full max-w-5xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <PenLine className="w-4.5 h-4.5 text-white/80" strokeWidth={2} />
          <span className="font-satoshi font-bold text-sm tracking-tight text-white/80">Writespace</span>
        </div>
        <Link 
          to="/login" 
          className="text-xs font-semibold text-white/50 hover:text-white transition-colors"
        >
          Sign in
        </Link>
      </header>

      {/* Hero Content */}
      <main className="w-full max-w-3xl mx-auto px-6 py-16 flex flex-col items-center text-center relative z-10 animate-slide-up">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] mb-8">
          <span className="text-[10px] font-semibold tracking-wider text-white/50 uppercase">v1.0 Release</span>
        </div>

        {/* Minimal Hero Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
          Writespace
        </h1>

        {/* Hero Subtitle */}
        <p className="text-white/45 text-sm sm:text-base font-medium max-w-md mx-auto mb-10 leading-relaxed">
          Write posts, follow creators, and bookmark what inspires you all in a distraction-free writing environment.
        </p>

        {/* Sleek CTA Buttons */}
        <div className="flex items-center justify-center gap-3.5 w-full sm:w-auto">
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-black font-semibold rounded-full text-xs hover:bg-white/90 active:scale-98 transition-all"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-full border border-white/10 hover:border-white/15 text-white/90 font-semibold text-xs transition-all hover:bg-white/[0.02] active:scale-98"
          >
            Explore feed
          </Link>
        </div>
      </main>

      {/* Spacer to keep main content centered */}
      <div className="h-20" aria-hidden />

    </div>
  );
}
