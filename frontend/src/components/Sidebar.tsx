import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, User, Settings, LogOut, Plus, PenLine } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!showSignOutConfirm) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !signingOut) setShowSignOutConfirm(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [showSignOutConfirm, signingOut]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
      setShowSignOutConfirm(false);
    }
  };

  const navItems = [
    { icon: Home, label: 'Feed', path: '/home' },
    { icon: Bookmark, label: 'Saved', path: '/saved' },
    { icon: User, label: 'Profile', path: `/profile/${user?.username}` },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const splitAt = Math.floor(navItems.length / 2);
  const navBeforeCompose = navItems.slice(0, splitAt);
  const navAfterCompose = navItems.slice(splitAt);

  const renderNavLink = (item: (typeof navItems)[number]) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        title={item.label}
        className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 ${
          isActive
            ? 'bg-white text-black shadow-lg shadow-white/10'
            : 'text-gray-500 hover:text-white hover:bg-white/10'
        }`}
      >
        <Icon className="w-6 h-6" />
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[90px] border-r border-white/5 flex-col bg-black/40 backdrop-blur-xl z-30">
      <div className="flex justify-center pt-6 pb-2 shrink-0">
        <Link to="/about" className="group" title="About Writespace">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center transition-smooth group-hover:scale-[1.03] shadow-lg shadow-white/10">
            <PenLine className="w-6 h-6 text-black" strokeWidth={2.25} aria-hidden />
          </div>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6 gap-6 min-h-0">
        <div className="flex flex-col items-center gap-6">
          {navBeforeCompose.map(renderNavLink)}
          <Link
            to="/compose"
            title="Create post"
            className="flex items-center justify-center w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-2xl transition-all shadow-lg shadow-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/50"
          >
            <Plus className="w-7 h-7 text-white" />
          </Link>
          {navAfterCompose.map(renderNavLink)}
        </div>
      </div>

      <div className="p-4 pb-6 flex justify-center">
        <button
          type="button"
          onClick={() => setShowSignOutConfirm(true)}
          title="Sign out"
          className="flex items-center justify-center w-14 h-14 rounded-2xl text-gray-500 hover:text-white hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      {showSignOutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sign-out-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !signingOut && setShowSignOutConfirm(false)}
            aria-label="Close"
            disabled={signingOut}
          />
          <div className="relative w-full sm:max-w-sm glass border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 animate-slide-up">
            <h2 id="sign-out-title" className="text-lg font-extrabold text-text-primary mb-2">
              Sign out?
            </h2>
            <p className="text-text-muted text-sm font-medium mb-6">
              Do you want to sign out of your account?
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={signingOut}
                className="px-5 py-2.5 rounded-full border border-white/10 text-text-primary font-bold text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-white/90 text-black font-bold text-sm transition-colors disabled:opacity-50"
              >
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
