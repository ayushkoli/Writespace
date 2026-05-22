import { Link } from "react-router-dom";
import { PenLine } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-texture text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Header / Navbar */}
      <header className="w-full max-w-5xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <PenLine className="w-4.5 h-4.5 text-white/80" strokeWidth={2} />
          <span className="font-satoshi font-bold text-sm tracking-tight text-white/80">
            Writespace
          </span>
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
        <div className="w-[4.75rem] h-[4.75rem] sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-white/10 hover:scale-105 transition-transform mb-5">
          <PenLine
            className="w-9 h-9 sm:w-10 sm:h-10 text-black"
            strokeWidth={2.25}
            aria-hidden
          />
        </div>

        {/* Minimal Hero Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
          Writespace
        </h1>

        {/* Hero Subtitle */}
        <p className="text-white/45 text-sm sm:text-base font-medium max-w-md mx-auto mb-10 leading-relaxed">
          Your feed. Your voice. Follow writers you love, share ideas that
          matter, and never lose a post worth revisiting.
        </p>

        {/* Sleek CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-black font-semibold rounded-full text-xs hover:bg-white/90 active:scale-98 transition-all text-center"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-white/10 hover:border-white/15 text-white/90 font-semibold text-xs transition-all hover:bg-white/[0.02] active:scale-98 text-center"
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
