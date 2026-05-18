import { Link, useLocation } from "react-router-dom";
import { Home, Bookmark, User, PenSquare } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();

  const items = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Bookmark, label: "Saved", path: "/saved" },
    { icon: PenSquare, label: "New post", path: "/compose" },
    { icon: User, label: "Profile", path: `/profile/${user?.username}` },
  ];

  const isActive = (path: string) => {
    if (path === "/home") return location.pathname === "/home";
    if (path.startsWith("/profile"))
      return location.pathname.startsWith("/profile");
    return location.pathname === path;
  };

  const navLinkClass = (active: boolean) =>
    `flex flex-1 items-center justify-center min-h-[52px] touch-manipulation active:opacity-60 transition-opacity ${
      active ? "text-white" : "text-gray-500"
    }`;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-black/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="flex items-center max-w-[600px] mx-auto h-[52px] px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={navLinkClass(active)}
            >
              <Icon
                className="w-[26px] h-[26px]"
                strokeWidth={active ? 2.25 : 1.75}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
