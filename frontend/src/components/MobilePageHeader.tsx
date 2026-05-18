import { Link } from 'react-router-dom';
import { ArrowLeft, PenLine } from 'lucide-react';
import type { ReactNode } from 'react';

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  backHref?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
  children?: ReactNode;
}

export default function MobilePageHeader({
  title,
  subtitle,
  showLogo = true,
  backHref,
  onBack,
  rightAction,
  children,
}: MobilePageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 glass border-b border-border pt-[env(safe-area-inset-top)]">
      <div className="relative px-4 h-14 flex items-center gap-2 md:px-6 md:h-auto md:min-h-[4.5rem] md:py-5">
        {backHref ? (
          <Link
            to={backHref}
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/15 transition-colors shrink-0 touch-manipulation"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </Link>
        ) : onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/15 transition-colors shrink-0 touch-manipulation"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
        ) : showLogo ? (
          <Link
            to="/about"
            className="md:hidden shrink-0 p-1 -ml-1 rounded-xl active:scale-95 transition-transform touch-manipulation"
            aria-label="About Writespace"
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-md shadow-white/10">
              <PenLine className="w-4 h-4 text-black" strokeWidth={2.25} />
            </div>
          </Link>
        ) : (
          <div className="w-8 md:hidden shrink-0" aria-hidden />
        )}

        <div className="flex-1 min-w-0 text-left md:flex-none">
          <h1 className="text-[17px] md:text-2xl font-extrabold text-text-primary tracking-tight truncate leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary text-xs font-medium mt-0.5 hidden md:block">{subtitle}</p>
          )}
        </div>

        {rightAction && (
          <div className="shrink-0 flex items-center md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2">
            {rightAction}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
