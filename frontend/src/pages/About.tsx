import { Code2, ExternalLink } from 'lucide-react';
import MobilePageHeader from '../components/MobilePageHeader';
import { PAGE_SHELL } from '../components/Layout';

const GITHUB_URL = 'https://github.com/ayushkoli';
const PORTFOLIO_URL = 'https://ayushkoli.vercel.app/';

export default function About() {
  return (
    <div className={`${PAGE_SHELL} animate-fade-in pb-8`}>
      <MobilePageHeader title="About" subtitle="Creator credits & project info" showLogo={false} />

      <div className="px-4 sm:px-6 pt-6 sm:pt-8">
        <article className="card-premium rounded-3xl border border-border/40 overflow-hidden">
          <div className="p-6 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-3">Creator credits</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-4">Writespace</h2>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed font-medium max-w-2xl">
              A modern social writing app for sharing posts, following creators, and saving what you love built as a
              full-stack project with React, Node.js, and MongoDB.
            </p>
          </div>

          <div className="px-6 sm:px-10 pb-6 sm:pb-8">
            <div className="rounded-2xl border border-border/60 glass-card p-5 sm:p-6">
              <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">Built by</p>
              <p className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">Ayush Koli</p>
              <p className="text-text-secondary text-sm font-medium mt-2">
                Developer · open source · portfolio projects
              </p>
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-8 sm:pb-10 flex flex-col sm:flex-row gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 flex-1 px-5 py-3.5 rounded-2xl border border-border/60 glass-card text-text-primary font-bold text-sm hover:bg-white/5 transition-colors touch-manipulation"
            >
              <Code2 className="w-5 h-5 shrink-0" />
              GitHub
              <ExternalLink className="w-3.5 h-3.5 text-text-muted ml-auto sm:ml-0" />
            </a>
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 flex-1 px-5 py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-gray-100 transition-colors touch-manipulation"
            >
              Portfolio
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
