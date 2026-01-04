import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { 
  LogOut, User, LayoutDashboard, Briefcase, Award, Settings, 
  Menu, X, Clock, Zap, FileText, Printer, Shield, ShieldCheck, 
  Rocket, Activity, CreditCard, FileCheck // Added FileCheck for Applications
} from 'lucide-react'; 
import { getMyProfile, getMySkills, getAcademicRecord } from '../services/profileService';
import { getMyProjects } from '../services/projectService';

// Import Layouts & Components
import MobileLayout from '../layouts/MobileLayout';
import AppSplash from '../components/mobile/AppSplash'; 

// Import Sub-Modules
import ProfileEditor from './dashboard/ProfileEditor';
import AcademicTimeline from './dashboard/AcademicTimeline';
import ProjectManager from './dashboard/ProjectManager';
import SkillManager from './dashboard/SkillManager';
import ResumeBuilder from './dashboard/ResumeBuilder'; 
import ProfileStrength from '../components/dashboard/ProfileStrength'; 
import AnalyticsWidget from '../components/dashboard/AnalyticsWidget'; 
import StudentVerification from '../components/dashboard/StudentVerification';

// Phase-13C & 14B Modules
import JobBoard from './dashboard/JobBoard';
import RecruiterHub from './dashboard/RecruiterHub';
import MyApplications from './dashboard/MyApplications';
import RecruiterAnalytics from './dashboard/RecruiterAnalytics'; 
import SubscriptionPage from './dashboard/SubscriptionPage'; 
import AdminPanel from './dashboard/AdminPanel'; 

// --- HELPER: Detect Mobile Screen ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

// --- HELPER: Sidebar Link Component ---
const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
  <Link 
    to={path}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
      active 
        ? 'bg-primary/10 text-primary border-l-4 border-primary' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

// --- HELPER: Centralized Routes ---
const DashboardRoutes = ({ user, loading, overviewData, fetchOverview }) => {
    return (
        <Routes>
            {/* 1. OVERVIEW (HOME) */}
            <Route path="/" element={
                loading ? <div className="text-gray-500 animate-pulse">Loading Command Deck...</div> : (
                <div className="space-y-6 animate-fade-in-up">
                    <header className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name.split(' ')[0]}</h1>
                            <p className="text-gray-400 text-sm mt-1">Here is your daily briefing.</p>
                        </div>
                        {user?.username && (
                            <a 
                                href={`/u/${user.username}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="hidden md:flex text-sm text-primary hover:text-white underline items-center gap-1"
                            >
                                View Public Profile <Settings size={12}/>
                            </a>
                        )}
                    </header>

                    {/* ADD TO HOME SCREEN HINT (Mobile Only) */}
                    <div className="md:hidden mb-4 bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl flex items-center gap-3">
                         <div className="bg-blue-500/20 p-2.5 rounded-lg text-blue-400">📱</div>
                         <div>
                             <p className="text-sm text-blue-200 font-bold">Install App</p>
                             <p className="text-xs text-blue-300/70">Add to Home Screen for faster access.</p>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <ProfileStrength 
                                profile={overviewData.profile} 
                                skills={overviewData.skills} 
                                projects={overviewData.projects}
                                certs={[]} 
                            />
                            {/* Only show verification for students */}
                            {user?.role !== 'recruiter' && user?.role !== 'admin' && (
                                <StudentVerification 
                                    profile={overviewData.profile} 
                                    onVerified={() => {
                                        console.log("Verified! Refreshing data...");
                                        fetchOverview();
                                    }} 
                                />
                            )}
                        </div>
                        <div className="lg:col-span-2 h-full">
                            <AnalyticsWidget totalViews={overviewData.profile?.analytics?.profileViews || 0} />
                        </div>
                    </div>

                    {/* Quick Actions (Role Based Visibility) */}
                    <h3 className="text-lg font-bold text-white mt-8 mb-4 border-l-4 border-primary pl-3">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Student Specific Actions */}
                            {user?.role !== 'recruiter' && user?.role !== 'admin' && (
                                <>
                                    <Link to="/dashboard/resume" className="bg-card hover:bg-gray-800 border border-white/5 p-4 rounded-xl flex items-center gap-3 transition-colors group">
                                        <div className="bg-purple-500/20 p-2.5 rounded-lg text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors"><Printer size={20}/></div>
                                        <div>
                                            <p className="font-bold text-sm text-white">Resume Builder</p>
                                            <p className="text-xs text-gray-500">Download PDF</p>
                                        </div>
                                    </Link>
                                    <Link to="/dashboard/projects" className="bg-card hover:bg-gray-800 border border-white/5 p-4 rounded-xl flex items-center gap-3 transition-colors group">
                                        <div className="bg-blue-500/20 p-2.5 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors"><Rocket size={20}/></div>
                                        <div>
                                            <p className="font-bold text-sm text-white">Add Project</p>
                                            <p className="text-xs text-gray-500">Showcase Work</p>
                                        </div>
                                    </Link>
                                    <Link to="/dashboard/skills" className="bg-card hover:bg-gray-800 border border-white/5 p-4 rounded-xl flex items-center gap-3 transition-colors group">
                                        <div className="bg-yellow-500/20 p-2.5 rounded-lg text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-colors"><Zap size={20}/></div>
                                        <div>
                                            <p className="font-bold text-sm text-white">Update Skills</p>
                                            <p className="text-xs text-gray-500">Level Up</p>
                                        </div>
                                    </Link>
                                </>
                            )}
                            
                            {/* Recruiter Specific Actions */}
                            {user?.role === 'recruiter' && (
                                <Link to="/dashboard/recruiter" className="bg-card hover:bg-gray-800 border border-white/5 p-4 rounded-xl flex items-center gap-3 transition-colors group">
                                    <div className="bg-indigo-500/20 p-2.5 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors"><Shield size={20}/></div>
                                    <div>
                                        <p className="font-bold text-sm text-white">Manage Jobs</p>
                                        <p className="text-xs text-gray-500">Recruiter Hub</p>
                                    </div>
                                </Link>
                            )}

                            {/* Common Action */}
                            <Link to="/dashboard/profile" className="bg-card hover:bg-gray-800 border border-white/5 p-4 rounded-xl flex items-center gap-3 transition-colors group">
                                <div className="bg-green-500/20 p-2.5 rounded-lg text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors"><User size={20}/></div>
                                <div>
                                    <p className="font-bold text-sm text-white">Edit Profile</p>
                                    <p className="text-xs text-gray-500">Identity</p>
                                </div>
                            </Link>
                    </div>
                </div>
            )} />

            <Route path="/profile" element={<ProfileEditor />} />
            <Route path="/timeline" element={<AcademicTimeline />} />
            <Route path="/projects" element={<ProjectManager />} />
            <Route path="/skills" element={<SkillManager />} />
            <Route path="/resume" element={<ResumeBuilder />} />
            <Route path="/jobs" element={<JobBoard />} />
            <Route path="/applications" element={<MyApplications />} />
            
            <Route path="/recruiter" element={
                user?.role === 'recruiter' ? <RecruiterHub /> : <div className="p-10 text-center text-red-500">Access Denied: Recruiters Only</div>
            } />
            
            <Route path="/analytics" element={
                user?.role === 'recruiter' ? <RecruiterAnalytics /> : <div className="p-10 text-center text-red-500">Access Denied: Recruiters Only</div>
            } />

            <Route path="/subscription" element={
                user?.role === 'recruiter' ? <SubscriptionPage /> : <div className="p-10 text-center text-red-500">Access Denied: Recruiters Only</div>
            } />

            <Route path="/admin" element={
                user?.role === 'admin' ? <AdminPanel /> : <div className="p-10 text-center text-red-500">Access Denied: Admins Only</div>
            } />

            <Route path="/certificates" element={<div className="p-10 text-center text-gray-500">Certificate Manager coming in next patch.</div>} />
            <Route path="/settings" element={<div className="p-10 text-center text-gray-500">Settings Module coming in next patch.</div>} />

        </Routes>
    );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile(); 
  
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState({
    profile: null, skills: null, academic: null, projects: [], certs: []
  });

  const fetchOverview = async () => {
    try {
        const [profile, skills, academic, projects] = await Promise.all([
            getMyProfile(), getMySkills(), getAcademicRecord(), getMyProjects()
        ]);
        setOverviewData({ profile, skills, academic, projects });
    } catch (error) {
        console.error("Dashboard overview fetch error", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname === '/dashboard') {
        fetchOverview();
    } else {
        setLoading(false);
    }
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ---------------------------------------------------------
  // RENDER: MOBILE LAYOUT (AppSplash + MobileLayout)
  // ---------------------------------------------------------
  if (isMobile) {
    return (
        <AppSplash> 
            <MobileLayout user={user}>
                <DashboardRoutes 
                    user={user} 
                    loading={loading} 
                    overviewData={overviewData} 
                    fetchOverview={fetchOverview} 
                />
            </MobileLayout>
        </AppSplash>
    );
  }

  // ---------------------------------------------------------
  // RENDER: DESKTOP LAYOUT
  // ---------------------------------------------------------
  return (
    <div className="h-screen flex bg-gray-900 text-white font-sans selection:bg-primary/30 overflow-hidden">
      
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-40 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static flex flex-col
      `}>
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">AV</div>
                Academic<span className="text-primary">Verse</span>
            </h2>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400">
             <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* 1. OVERVIEW (COMMON) */}
          <SidebarItem icon={LayoutDashboard} label="Overview" path="/dashboard" active={location.pathname === '/dashboard'} onClick={() => setSidebarOpen(false)} />

          {/* 2. ROLE BASED PRIORITY ITEMS */}
          
          {/* RECRUITER SECTION */}
          {user?.role === 'recruiter' && (
             <>
                 <SidebarItem icon={Shield} label="Recruiter Hub" path="/dashboard/recruiter" active={location.pathname === '/dashboard/recruiter'} onClick={() => setSidebarOpen(false)} />
                 <SidebarItem icon={Activity} label="Analytics" path="/dashboard/analytics" active={location.pathname === '/dashboard/analytics'} onClick={() => setSidebarOpen(false)} />
                 <SidebarItem icon={CreditCard} label="Billing & Plans" path="/dashboard/subscription" active={location.pathname === '/dashboard/subscription'} onClick={() => setSidebarOpen(false)} />
             </>
          )}

          {/* ADMIN SECTION */}
          {user?.role === 'admin' && (
             <SidebarItem icon={ShieldCheck} label="Admin Authority" path="/dashboard/admin" active={location.pathname === '/dashboard/admin'} onClick={() => setSidebarOpen(false)} />
          )}

          {/* 3. JOB BOARD (COMMON) */}
          <SidebarItem icon={Briefcase} label="Job Board" path="/dashboard/jobs" active={location.pathname === '/dashboard/jobs'} onClick={() => setSidebarOpen(false)} />

          {/* 4. STUDENT ITEMS (Hidden for Recruiter/Admin to keep clean) */}
          {user?.role !== 'recruiter' && user?.role !== 'admin' && (
             <>
                {/* Fixed Icon: Using FileCheck for Applications */}
                <SidebarItem icon={FileCheck} label="My Applications" path="/dashboard/applications" active={location.pathname === '/dashboard/applications'} onClick={() => setSidebarOpen(false)} />
                <SidebarItem icon={User} label="Edit Profile" path="/dashboard/profile" active={location.pathname === '/dashboard/profile'} onClick={() => setSidebarOpen(false)} />
                {/* Fixed Icon: Clock is now unique to Timeline */}
                <SidebarItem icon={Clock} label="Timeline & History" path="/dashboard/timeline" active={location.pathname === '/dashboard/timeline'} onClick={() => setSidebarOpen(false)} />
                <SidebarItem icon={Zap} label="Skills & Badges" path="/dashboard/skills" active={location.pathname === '/dashboard/skills'} onClick={() => setSidebarOpen(false)} />
                <SidebarItem icon={Rocket} label="Project Universe" path="/dashboard/projects" active={location.pathname === '/dashboard/projects'} onClick={() => setSidebarOpen(false)} />
                <SidebarItem icon={FileText} label="Resume Builder" path="/dashboard/resume" active={location.pathname === '/dashboard/resume'} onClick={() => setSidebarOpen(false)} />
             </>
          )}

          {/* Recruiter/Admin need profile access too, but simpler */}
          {(user?.role === 'recruiter' || user?.role === 'admin') && (
              <SidebarItem icon={User} label="Edit Profile" path="/dashboard/profile" active={location.pathname === '/dashboard/profile'} onClick={() => setSidebarOpen(false)} />
          )}

          {/* 5. FUTURE MODULES (At Bottom) */}
          <SidebarItem icon={Award} label="Certificates (Beta)" path="/dashboard/certificates" active={location.pathname === '/dashboard/certificates'} onClick={() => setSidebarOpen(false)} />
          <SidebarItem icon={Settings} label="Settings" path="/dashboard/settings" active={location.pathname === '/dashboard/settings'} onClick={() => setSidebarOpen(false)} />
        </nav>

        <div className="p-4 border-t border-gray-800">
           <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs">{user?.name[0]}</div>}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
           </div>
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
            <LogOut className="h-4 w-4" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        {/* Mobile Header */}
        <header className="bg-gray-900 border-b border-gray-800 md:hidden p-4 flex justify-between items-center sticky top-0 z-20">
             <div className="flex items-center gap-3">
                 <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
                     <Menu size={24} />
                 </button>
                 <span className="font-bold">Dashboard</span>
             </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
             <DashboardRoutes 
                user={user} 
                loading={loading} 
                overviewData={overviewData} 
                fetchOverview={fetchOverview} 
            />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;