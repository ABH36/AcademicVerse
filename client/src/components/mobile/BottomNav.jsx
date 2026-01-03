import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, FileText, Bell, User } from 'lucide-react';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to} 
    end={to === '/dashboard'}
    className={({ isActive }) => `
      flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200
      ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}
    `}
  >
    {({ isActive }) => (
      <>
        <div className={`relative p-1 rounded-xl transition-all ${isActive ? 'bg-primary/10 -translate-y-1' : ''}`}>
          <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
          {label}
        </span>
      </>
    )}
  </NavLink>
);

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 safe-area-bottom h-[65px]">
      <div className="flex justify-between items-center h-full px-2 max-w-md mx-auto">
        <NavItem to="/dashboard" icon={Home} label="Home" />
        <NavItem to="/dashboard/jobs" icon={Briefcase} label="Jobs" />
        <NavItem to="/dashboard/applications" icon={FileText} label="Applied" />
        <NavItem to="/dashboard/notifications" icon={Bell} label="Alerts" />
        <NavItem to="/dashboard/profile" icon={User} label="Profile" />
      </div>
    </div>
  );
};

export default BottomNav;