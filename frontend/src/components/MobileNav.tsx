import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Bookmark, User, Plus, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function MobileNav() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!showSignOutConfirm) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !signingOut) setShowSignOutConfirm(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
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

  const isActive = (path: string) => {
    if (path === "/home") return location.pathname === "/home";
    if (path.startsWith("/profile"))
      return location.pathname.startsWith("/profile");
    return location.pathname === path;
  };

  const navLinkClass = (active: boolean) =>
    `flex flex-1 items-center justify-center h-full touch-manipulation active:opacity-60 transition-opacity ${
      active ? "text-white" : "text-gray-500"
    }`;

  return (
    <>
      <nav
        className="md:hidden fixed bottom-4 left-4 right-4 z-40 border border-white/10 bg-black/45 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-[480px] mx-auto overflow-hidden"
        aria-label="Main navigation"
      >
        <div className="flex items-center h-14 px-2">
          {/* Home */}
          <Link
            to="/home"
            aria-label="Home"
            aria-current={isActive("/home") ? "page" : undefined}
            className={navLinkClass(isActive("/home"))}
          >
            <Home className="w-[24px] h-[24px]" strokeWidth={isActive("/home") ? 2.25 : 1.75} />
          </Link>

          {/* Saved */}
          <Link
            to="/saved"
            aria-label="Saved"
            aria-current={isActive("/saved") ? "page" : undefined}
            className={navLinkClass(isActive("/saved"))}
          >
            <Bookmark className="w-[24px] h-[24px]" strokeWidth={isActive("/saved") ? 2.25 : 1.75} />
          </Link>

          {/* Create Post (Middle Plus Button) */}
          <div className="flex flex-1 justify-center items-center h-full">
            <Link
              to="/compose"
              aria-label="New post"
              className="flex items-center justify-center w-10 h-10 bg-blue-500 active:bg-blue-600 rounded-xl transition-all shadow-md shadow-blue-500/20 touch-manipulation cursor-pointer"
            >
              <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
            </Link>
          </div>

          {/* Profile */}
          <Link
            to={`/profile/${user?.username}`}
            aria-label="Profile"
            aria-current={isActive(`/profile/${user?.username}`) ? "page" : undefined}
            className={navLinkClass(isActive(`/profile/${user?.username}`))}
          >
            <User className="w-[24px] h-[24px]" strokeWidth={isActive(`/profile/${user?.username}`) ? 2.25 : 1.75} />
          </Link>

          {/* Sign Out */}
          <button
            type="button"
            onClick={() => setShowSignOutConfirm(true)}
            aria-label="Sign out"
            className="flex flex-1 items-center justify-center h-full text-gray-500 active:text-white active:opacity-60 transition-opacity touch-manipulation focus:outline-none cursor-pointer"
          >
            <LogOut className="w-[24px] h-[24px]" strokeWidth={1.75} />
          </button>
        </div>
      </nav>

      {showSignOutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-sign-out-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !signingOut && setShowSignOutConfirm(false)}
            aria-label="Close"
            disabled={signingOut}
          />
          <div className="relative w-full sm:max-w-sm glass border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 animate-slide-up">
            <h2 id="mobile-sign-out-title" className="text-lg font-extrabold text-text-primary mb-2">
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
    </>
  );
}
