import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

/** Shared max-width: Twitter-like narrow timeline on phone, wide on desktop. */
export const PAGE_SHELL = 'w-full max-w-[600px] md:max-w-[1200px] mx-auto';

export default function Layout() {
  const { pathname } = useLocation();
  const hideMobileNav = pathname === '/compose';

  return (
    <div className="min-h-screen bg-texture">
      <Sidebar />
      {!hideMobileNav && <MobileNav />}
      <main
        className={`min-h-screen md:ml-[90px] ${
          hideMobileNav ? 'pb-0' : 'pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
