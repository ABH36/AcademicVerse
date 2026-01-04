import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, FileText, User, Shield, Activity, Clock, FileCheck, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import Auth to check role

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
  const { user } = useAuth(); // Get user role

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 safe-area-bottom h-[65px]">
      <div className="flex justify-between items-center h-full px-2 max-w-md mx-auto">
        
        {/* 1. HOME (Always Left) */}
        <NavItem to="/dashboard" icon={Home} label="Home" />

        {/* 2. MIDDLE ITEMS (Role Based) */}
        
        {/* STUDENT VIEW */}
        {user?.role !== 'recruiter' && user?.role !== 'admin' && (
            <>
                <NavItem to="/dashboard/jobs" icon={Briefcase} label="Jobs" />
                <NavItem to="/dashboard/applications" icon={FileCheck} label="Apps" />
                <NavItem to="/dashboard/timeline" icon={Clock} label="History" />
            </>
        )}

        {/* RECRUITER VIEW */}
        {user?.role === 'recruiter' && (
            <>
                <NavItem to="/dashboard/recruiter" icon={Shield} label="Hub" />
                <NavItem to="/dashboard/analytics" icon={Activity} label="Stats" />
                {/* FIXED: Replaced Jobs with Plans */}
                <NavItem to="/dashboard/subscription" icon={CreditCard} label="Plans" />
            </>
        )}

        {/* ADMIN VIEW */}
        {user?.role === 'admin' && (
            <>
                <NavItem to="/dashboard/admin" icon={Shield} label="Admin" />
                <NavItem to="/dashboard/jobs" icon={Briefcase} label="Jobs" />
                <NavItem to="/dashboard/skills" icon={Activity} label="Skills" />
            </>
        )}

        {/* 3. PROFILE (Always Right) */}
        <NavItem to="/dashboard/profile" icon={User} label="Profile" />
        
      </div>
    </div>
  );
};

export default BottomNav;