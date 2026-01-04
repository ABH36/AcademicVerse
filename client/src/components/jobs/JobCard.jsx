import React, { useState } from 'react';
import { MapPin, Briefcase, IndianRupee, Lock, CheckCircle, Shield, Clock, XCircle, Trophy, Flag, AlertTriangle, ArrowRight } from 'lucide-react';
import { applyForJob, reportJob } from '../../services/jobService';
import { toast } from 'react-toastify';

const JobCard = ({ job, userProfile, existingStatus }) => {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(existingStatus);
  const [showReport, setShowReport] = useState(false); 

  // 1. ELIGIBILITY CHECKS
  const isVerified = userProfile?.verification?.isVerified;
  const isLocked = (job.verifiedOnly && !isVerified) || (job.minTrustScore > 0 && 0 < job.minTrustScore); 
  
  // 2. COMPANY VERIFICATION CHECK
  const isCompanyVerified = job.trustProfile?.isVerifiedCompany;

  const handleApply = async (e) => {
    e.stopPropagation(); // Prevent bubbling if card is clickable
    setLoading(true);
    try {
      await applyForJob(job._id);
      toast.success('Application Sent! Good luck.');
      setLocalStatus('applied'); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  // 3. REPORT HANDLER
  const handleReport = async (reason) => {
      try {
          await reportJob(job._id, { reason, description: 'User flagged via UI' });
          toast.success('Report submitted.');
          setShowReport(false);
      } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to report');
      }
  };

  // Helper to render Status Button with Animations
  const renderStatusButton = () => {
      if (localStatus) {
          const baseClass = "w-full py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 cursor-default transition-all duration-300 animate-in fade-in zoom-in";
          switch(localStatus) {
              case 'applied': return <button disabled className={`${baseClass} bg-blue-500/10 text-blue-400 border border-blue-500/20`}><Clock size={16}/> Applied</button>;
              case 'shortlisted': return <button disabled className={`${baseClass} bg-green-500/10 text-green-400 border border-green-500/20`}><CheckCircle size={16}/> Shortlisted</button>;
              case 'rejected': return <button disabled className={`${baseClass} bg-red-500/10 text-red-400 border border-red-500/20`}><XCircle size={16}/> Rejected</button>;
              case 'offered': return <button disabled className={`${baseClass} bg-yellow-500/10 text-yellow-400 border border-yellow-500/20`}><Trophy size={16}/> Offer Received</button>;
              case 'hired': return <button disabled className={`${baseClass} bg-primary text-white shadow-lg shadow-primary/30`}><Lock size={16}/> Hired</button>;
              default: return null;
          }
      }

      if (isLocked) {
          return (
            <button disabled className="w-full py-2.5 rounded-lg text-sm font-bold bg-gray-800 text-gray-500 flex justify-center items-center gap-2 cursor-not-allowed border border-gray-700">
                <Lock size={16}/> Locked
            </button>
          );
      }

      return (
        <button
            onClick={handleApply}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white flex justify-center items-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-95 group/btn"
        >
            {loading ? 'Sending...' : (
                <>
                    Easy Apply <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                </>
            )}
        </button>
      );
  };

  return (
    // CARD CONTAINER WITH HOVER LIFT & GLOW
    <div className="bg-card/80 backdrop-blur-sm border border-white/5 p-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 flex flex-col justify-between group h-full relative overflow-hidden">
      
      {/* Subtle Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"/>

      {/* REPORT BUTTON (Animated) */}
      <button 
        onClick={() => setShowReport(!showReport)}
        className="absolute top-4 right-4 text-gray-600 hover:text-red-400 transition-all duration-300 z-10 hover:rotate-12 hover:scale-110"
        title="Report this job"
      >
        <Flag size={14}/>
      </button>

      {/* REPORT POPUP (With Fade In) */}
      {showReport && (
          <div className="absolute inset-0 bg-gray-900/95 z-20 rounded-xl p-4 flex flex-col justify-center items-center text-center space-y-3 border border-red-500/30 animate-in fade-in zoom-in-95 duration-200">
              <AlertTriangle size={32} className="text-red-500 animate-pulse"/>
              <h4 className="font-bold text-white text-sm">Report this Job?</h4>
              <p className="text-[10px] text-gray-400">Help us keep AcademicVerse safe.</p>
              <div className="grid grid-cols-2 gap-2 w-full">
                  <button onClick={() => handleReport('scam')} className="bg-red-500/10 text-red-400 text-xs py-2 rounded hover:bg-red-500/20 font-bold border border-red-500/20 transition-colors">It's a Scam</button>
                  <button onClick={() => handleReport('asking_money')} className="bg-red-500/10 text-red-400 text-xs py-2 rounded hover:bg-red-500/20 font-bold border border-red-500/20 transition-colors">Asking Money</button>
              </div>
              <button onClick={() => setShowReport(false)} className="text-gray-500 text-xs hover:text-white underline mt-2 hover:scale-105 transition-transform">Cancel</button>
          </div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4 pr-6">
            <div className="flex items-center gap-3">
                {/* LOGO WITH ZOOM EFFECT */}
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-lg font-bold text-white overflow-hidden relative shadow-inner border border-white/5 group-hover:border-primary/30 transition-colors duration-300">
                    {job.company.logo ? (
                        <img src={job.company.logo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                    ) : (
                        <span className="group-hover:scale-110 transition-transform duration-300">{job.company.name.charAt(0)}</span>
                    )}
                    
                    {isCompanyVerified && (
                        <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-tl-md p-0.5 z-10 shadow-sm">
                            <CheckCircle size={8} fill="white" className="text-blue-500"/>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="font-bold text-white group-hover:text-primary transition-colors duration-300 flex items-center gap-1.5 text-base">
                        {job.title}
                        {isCompanyVerified && <CheckCircle size={14} className="text-blue-500 animate-in zoom-in spin-in-12 duration-500" fill="currentColor"/>}
                    </h3>
                    <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{job.company.name}</p>
                </div>
            </div>
            
            {job.type === 'Remote' && (
                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/20 font-medium shadow-sm shadow-purple-900/20">Remote</span>
            )}
        </div>

        {/* INFO CHIPS WITH HOVER EFFECT */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-5">
            <span className="flex items-center gap-1.5 bg-gray-800/50 px-2 py-1 rounded border border-white/5 group-hover:border-white/10 transition-colors">
                <MapPin size={12} className="text-primary"/> {job.location}
            </span>
            <span className="flex items-center gap-1.5 bg-gray-800/50 px-2 py-1 rounded border border-white/5 group-hover:border-white/10 transition-colors">
                <IndianRupee size={12} className="text-green-400"/> 
                <span className="text-gray-300 font-medium">{job.salary.min / 1000}k - {job.salary.max / 1000}k</span>
            </span>
            <span className="flex items-center gap-1.5 bg-gray-800/50 px-2 py-1 rounded border border-white/5 group-hover:border-white/10 transition-colors">
                <Briefcase size={12} className="text-purple-400"/> {job.type}
            </span>
        </div>

        {/* TRUST SCORE BAR */}
        {(job.minTrustScore > 0 || job.verifiedOnly) && (
            <div className="mb-5 bg-gray-900/80 p-2.5 rounded-lg border border-gray-800 flex items-center gap-3 shadow-inner">
                <div className={`p-1.5 rounded-full ${isLocked ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                    <Shield size={14} />
                </div>
                <div className="text-[10px] text-gray-400 leading-tight">
                    {job.verifiedOnly && <span className="block mb-0.5">Requires <span className="text-blue-400 font-bold">Blue Tick</span> verification</span>}
                    {job.minTrustScore > 0 && <span className="block">Min Trust Score: <span className="text-yellow-400 font-bold">{job.minTrustScore}</span></span>}
                </div>
            </div>
        )}
      </div>

      <div className="relative z-10 mt-auto">
        {renderStatusButton()}
      </div>
    </div>
  );
};

export default JobCard;