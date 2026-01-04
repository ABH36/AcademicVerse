import React, { useEffect, useState } from 'react';
import BottomNav from '../components/mobile/BottomNav';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Import Auth for Logout

const MobileLayout = ({ children, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get logout function
  const [showMenu, setShowMenu] = useState(false); // State for Logout Dropdown

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

      // Swipe Right to Go Back
      if (diffX > 90 && diffY < 50) {
         navigate(-1); 
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
    if (path === '/dashboard') return `Hi, ${user?.name?.split(' ')[0] || 'User'}`;
    if (path.includes('/jobs')) return 'Opportunity Deck';
    if (path.includes('/applications')) return 'My Applications';
    if (path.includes('/profile')) return 'Profile';
    if (path.includes('/recruiter')) return 'Recruiter Hub';
    return 'AcademicVerse';
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white font-sans selection:bg-primary/30">
      
      {/* TOP APP BAR */}
      <header className="flex-none bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-3 safe-area-top z-40 sticky top-0 flex items-center justify-between shadow-lg shadow-black/20">
        
        {/* Left: Dynamic Title */}
        <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
              {getPageTitle()}
            </h1>
            {location.pathname === '/dashboard' && (
                <span className="text-[10px] text-gray-400 font-medium">Let's be productive today.</span>
            )}
        </div>

        {/* Right: App Logo & User Menu */}
        <div className="flex items-center gap-3 relative">
             {/* APP LOGO (Clickable -> Home) */}
             <div onClick={() => navigate('/dashboard')} className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-primary/20 cursor-pointer active:scale-95 transition-transform">
                 AV
             </div>

             {/* USER AVATAR (Click to Toggle Menu) */}
             <button 
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all active:scale-95"
             >
                {user?.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt="user" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                        {user?.name?.[0]}
                    </div>
                )}
             </button>

             {/* DROPDOWN MENU (Logout) */}
             {showMenu && (
                 <>
                    {/* Backdrop to close menu */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                    
                    {/* Menu Content */}
                    <div className="absolute top-10 right-0 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => {
                                setShowMenu(false);
                                navigate('/dashboard/profile');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <User size={14} /> Profile
                        </button>
                        <div className="h-px bg-gray-700 my-1"></div>
                        <button 
                            onClick={logout} 
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                 </>
             )}
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