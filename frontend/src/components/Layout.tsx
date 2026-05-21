import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

/** Shared max-width: Twitter-like narrow timeline on phone, wide on desktop. */
export const PAGE_SHELL = 'w-full max-w-[600px] md:max-w-[1200px] mx-auto';

export default function Layout() {
  return (
    <div className="min-h-screen bg-texture">
      <Sidebar />
      <MobileNav />
      <main className="min-h-screen md:ml-[90px] pb-24 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
