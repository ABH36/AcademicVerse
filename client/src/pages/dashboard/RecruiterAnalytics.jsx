import React, { useEffect, useState } from 'react';
import { getRecruiterAnalytics } from '../../services/analyticsService';
import { 
    Loader, TrendingUp, Users, FileText, CheckCircle, XCircle, 
    Briefcase, Activity, ShieldAlert, UserCheck, TrendingDown 
} from 'lucide-react'; // Added Phase-15B Icons

const RecruiterAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getRecruiterAnalytics();
                setStats(data);
            } catch (error) {
                console.error("Analytics Error");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-10 flex justify-center"><Loader className="animate-spin text-primary"/></div>;

    // Helper Card Component
    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-card border border-white/5 p-5 rounded-xl flex items-center gap-4 hover:border-white/10 transition-all">
            <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-white`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <div>
                <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">{label}</p>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-primary"/> Hiring Intelligence
                    </h1>
                    <p className="text-gray-400 text-sm">Real-time metrics on your recruitment pipeline.</p>
                </div>
            </div>

            {/* 1. TOP LEVEL METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Briefcase} label="Active Jobs" value={stats.totalJobs} color="bg-blue-500" />
                <StatCard icon={Users} label="Total Applicants" value={stats.totalApplications} color="bg-purple-500" />
                <StatCard icon={CheckCircle} label="Total Hired" value={stats.funnel.hired} color="bg-green-500" />
                <StatCard icon={TrendingUp} label="Offer Acceptance" value={stats.metrics.acceptanceRate} color="bg-yellow-500" />
            </div>

            {/* 2. THE HIRING FUNNEL (Pipeline View) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Funnel Visualization */}
                <div className="lg:col-span-2 bg-gray-900 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Candidate Pipeline Funnel</h3>
                    
                    <div className="space-y-4">
                        {/* Stage 1: Applied */}
                        <div className="relative pt-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                    Applied
                                </span>
                                <span className="text-xs font-bold inline-block text-blue-600">
                                    {stats.totalApplications}
                                </span>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200/20">
                                <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                            </div>
                        </div>

                        {/* Stage 2: Shortlisted */}
                        <div className="relative pt-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                    Shortlisted
                                </span>
                                <span className="text-xs font-bold inline-block text-indigo-600">
                                    {stats.funnel.shortlisted}
                                </span>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200/20">
                                <div style={{ width: `${(stats.funnel.shortlisted / (stats.totalApplications || 1)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                            </div>
                        </div>

                        {/* Stage 3: Interview */}
                        <div className="relative pt-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                                    Interviews
                                </span>
                                <span className="text-xs font-bold inline-block text-purple-600">
                                    {stats.funnel.interview}
                                </span>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200/20">
                                <div style={{ width: `${(stats.funnel.interview / (stats.totalApplications || 1)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
                            </div>
                        </div>

                         {/* Stage 4: Hired */}
                         <div className="relative pt-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                                    Hired
                                </span>
                                <span className="text-xs font-bold inline-block text-green-600">
                                    {stats.funnel.hired}
                                </span>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200/20">
                                <div style={{ width: `${(stats.funnel.hired / (stats.totalApplications || 1)) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Efficiency Stats */}
                <div className="space-y-4">
                    <div className="bg-card border border-white/5 p-5 rounded-xl">
                        <h4 className="text-gray-400 text-xs uppercase font-bold mb-2">Rejection Rate</h4>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-bold text-white">{stats.metrics.rejectionRate}</h3>
                            <span className="text-red-400 text-xs mb-1">Filtered Out</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Applicants that didn't meet criteria.</p>
                    </div>

                    <div className="bg-card border border-white/5 p-5 rounded-xl">
                        <h4 className="text-gray-400 text-xs uppercase font-bold mb-2">Overall Efficiency</h4>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-bold text-white">{stats.metrics.hiringEfficiency}</h3>
                            <span className="text-blue-400 text-xs mb-1">Selectivity</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Percentage of applicants eventually hired.</p>
                    </div>
                </div>
            </div>

            {/* 3. CANDIDATE QUALITY & RISK INTELLIGENCE (PHASE-15B) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Average Trust Score */}
                <div className="bg-gray-900 border border-white/10 p-6 rounded-xl flex flex-col justify-between hover:border-blue-500/30 transition-all">
                    <div>
                        <h4 className="text-gray-400 text-xs uppercase font-bold mb-2 flex items-center gap-2">
                            <UserCheck size={16}/> Avg Candidate Quality
                        </h4>
                        <div className="flex items-end gap-2">
                            <h3 className={`text-4xl font-black ${stats.quality?.avgCandidateTrust >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {stats.quality?.avgCandidateTrust || 0}
                            </h3>
                            <span className="text-gray-500 text-sm mb-1">/ 100</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Based on Trust Engine verification points.</p>
                </div>

                {/* Spam / Rapid Apply Detection */}
                <div className="bg-gray-900 border border-white/10 p-6 rounded-xl flex flex-col justify-between hover:border-red-500/30 transition-all">
                    <div>
                        <h4 className="text-gray-400 text-xs uppercase font-bold mb-2 flex items-center gap-2">
                            <TrendingDown size={16}/> Spam Attempts
                        </h4>
                        <h3 className="text-4xl font-black text-red-400">
                            {stats.quality?.spamAttempts || 0}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Candidates blocked/flagged for rapid-apply abuse.</p>
                </div>

                {/* Suspicious Flags */}
                <div className="bg-gray-900 border border-white/10 p-6 rounded-xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldAlert size={100} className="text-red-500"/>
                    </div>
                    <div>
                        <h4 className="text-gray-400 text-xs uppercase font-bold mb-2 flex items-center gap-2">
                            <ShieldAlert size={16}/> Suspicious Flags
                        </h4>
                        <h3 className="text-4xl font-black text-white">
                            {stats.quality?.flaggedCandidates || 0}
                        </h3>
                    </div>
                    <div className="mt-4">
                        <span className={`text-xs px-2 py-1 rounded ${stats.quality?.flaggedCandidates > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {stats.quality?.flaggedCandidates > 0 ? 'Action Required' : 'All Clear'}
                        </span>
                        <p className="text-xs text-gray-500 mt-2">Profiles with low trust or irregular behavior.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterAnalytics;