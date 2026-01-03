import React, { useEffect } from 'react';
import BottomNav from '../components/mobile/BottomNav';
import { useLocation, useNavigate } from 'react-router-dom'; // <--- useNavigate added

const MobileLayout = ({ children, user }) => {
  const location = useLocation();
  const navigate = useNavigate(); // <--- Hook added

  // --- GESTURE LOGIC START ---
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = endX - startX;
      const diffY = Math.abs(endY - startY);

      // Agar Right Swipe > 90px hai aur Vertical scroll kam hai (to avoid accidental swipes)
      if (diffX > 90 && diffY < 50) {
         navigate(-1); // Go Back
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate]);
  // --- GESTURE LOGIC END ---

  // Header Title Logic
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return `Hi, ${user?.name?.split(' ')[0] || 'Student'}`;
    if (path.includes('/jobs')) return 'Job Board';
    if (path.includes('/applications')) return 'My Applications';
    if (path.includes('/profile')) return 'My Profile';
    if (path.includes('/notifications')) return 'Notifications';
    return 'AcademicVerse';
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white">
      
      {/* TOP APP BAR */}
      <header className="flex-none bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-3 safe-area-top z-40 sticky top-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-white">
            {getPageTitle()}
          </h1>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary border border-primary/30">
             {user?.name?.[0] || 'A'}
          </div>
        </div>
      </header>

      {/* SCROLLABLE CONTENT */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 scrollbar-hide">
        <div className="animate-fade-in-up">
           {children}
        </div>
      </main>

      {/* BOTTOM NAVIGATION */}
      <BottomNav />
      
    </div>
  );
};

export default MobileLayout;