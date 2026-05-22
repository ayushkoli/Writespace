import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Bookmark, User, Plus, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ConfirmDialog from "./ConfirmDialog";

export default function MobileNav() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

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
      <ConfirmDialog
        isOpen={showSignOutConfirm}
        title="Sign out?"
        message="Do you want to sign out of your account?"
        confirmLabel="Sign out"
        danger={false}
        loading={signingOut}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
      />
    </>
  );
}
