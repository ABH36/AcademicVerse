import React, { useState } from 'react';
import { MapPin, Briefcase, DollarSign, Lock, CheckCircle, Shield, Clock, XCircle, Trophy, Flag, AlertTriangle } from 'lucide-react';
import { applyForJob, reportJob } from '../../services/jobService';
import { toast } from 'react-toastify';

const JobCard = ({ job, userProfile, existingStatus }) => {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(existingStatus);
  const [showReport, setShowReport] = useState(false); // New State for Report Popup

  // 1. ELIGIBILITY CHECKS
  const isVerified = userProfile?.verification?.isVerified;
  const isLocked = (job.verifiedOnly && !isVerified) || (job.minTrustScore > 0 && 0 < job.minTrustScore); 
  
  // 2. COMPANY VERIFICATION CHECK (Phase-15C)
  const isCompanyVerified = job.trustProfile?.isVerifiedCompany;

  const handleApply = async () => {
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

  // 3. REPORT HANDLER (Phase-15C)
  const handleReport = async (reason) => {
      try {
          await reportJob(job._id, { reason, description: 'User flagged via UI' });
          toast.success('Report submitted. Thanks for keeping the community safe.');
          setShowReport(false);
      } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to report');
      }
  };

  // Helper to render Status Button
  const renderStatusButton = () => {
      if (localStatus) {
          switch(localStatus) {
              case 'applied': return <button disabled className="w-full py-2 rounded-lg text-sm font-bold bg-blue-500/10 text-blue-400 flex justify-center items-center gap-2 cursor-default"><Clock size={16}/> Applied</button>;
              case 'shortlisted': return <button disabled className="w-full py-2 rounded-lg text-sm font-bold bg-green-500/10 text-green-400 flex justify-center items-center gap-2 cursor-default"><CheckCircle size={16}/> Shortlisted</button>;
              case 'rejected': return <button disabled className="w-full py-2 rounded-lg text-sm font-bold bg-red-500/10 text-red-400 flex justify-center items-center gap-2 cursor-default"><XCircle size={16}/> Rejected</button>;
              case 'offered': return <button disabled className="w-full py-2 rounded-lg text-sm font-bold bg-yellow-500/10 text-yellow-400 flex justify-center items-center gap-2 cursor-default"><Trophy size={16}/> Offer Received</button>;
              case 'hired': return <button disabled className="w-full py-2 rounded-lg text-sm font-bold bg-primary text-white flex justify-center items-center gap-2 cursor-default"><Lock size={16}/> Hired</button>;
              default: return null;
          }
      }

      if (isLocked) {
          return (
            <button disabled className="w-full py-2 rounded-lg text-sm font-bold bg-gray-800 text-gray-500 flex justify-center items-center gap-2 cursor-not-allowed">
                <Lock size={16}/> Locked
            </button>
          );
      }

      return (
        <button
            onClick={handleApply}
            disabled={loading}
            className="w-full py-2 rounded-lg text-sm font-bold bg-primary hover:bg-blue-600 text-white flex justify-center items-center gap-2 transition-all"
        >
            {loading ? 'Sending...' : 'Easy Apply'}
        </button>
      );
  };

  return (
    <div className="bg-card border border-white/5 p-5 rounded-xl hover:border-primary/30 transition-all flex flex-col justify-between group h-full relative">
      
      {/* --- REPORT BUTTON (Top Right) --- */}
      <button 
        onClick={() => setShowReport(!showReport)}
        className="absolute top-4 right-4 text-gray-600 hover:text-red-400 transition-colors z-10"
        title="Report this job"
      >
        <Flag size={14}/>
      </button>

      {/* --- REPORT POPUP OVERLAY --- */}
      {showReport && (
          <div className="absolute inset-0 bg-gray-900/95 z-20 rounded-xl p-4 flex flex-col justify-center items-center text-center space-y-3 border border-red-500/30">
              <AlertTriangle size={32} className="text-red-500"/>
              <h4 className="font-bold text-white text-sm">Report this Job?</h4>
              <p className="text-[10px] text-gray-400">Help us keep AcademicVerse safe.</p>
              <div className="grid grid-cols-2 gap-2 w-full">
                  <button onClick={() => handleReport('scam')} className="bg-red-500/10 text-red-400 text-xs py-2 rounded hover:bg-red-500/20 font-bold border border-red-500/20">It's a Scam</button>
                  <button onClick={() => handleReport('asking_money')} className="bg-red-500/10 text-red-400 text-xs py-2 rounded hover:bg-red-500/20 font-bold border border-red-500/20">Asking Money</button>
              </div>
              <button onClick={() => setShowReport(false)} className="text-gray-500 text-xs hover:text-white underline mt-2">Cancel</button>
          </div>
      )}

      <div>
        <div className="flex justify-between items-start mb-3 pr-6">
            <div className="flex items-center gap-3">
                {/* COMPANY LOGO & VERIFIED BADGE */}
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-lg font-bold text-white overflow-hidden relative">
                    {job.company.logo ? <img src={job.company.logo} className="w-full h-full object-cover"/> : job.company.name.charAt(0)}
                    
                    {/* Blue Tick on Logo */}
                    {isCompanyVerified && (
                        <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-tl-md p-0.5" title="Verified Company">
                            <CheckCircle size={8} fill="white" className="text-blue-500"/>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="font-bold text-white group-hover:text-primary transition-colors flex items-center gap-1">
                        {job.title}
                        {/* Blue Tick on Title */}
                        {isCompanyVerified && <CheckCircle size={12} className="text-blue-500" fill="currentColor"/>}
                    </h3>
                    <p className="text-xs text-gray-400">{job.company.name}</p>
                </div>
            </div>
            
            {job.type === 'Remote' && (
                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full border border-purple-500/20">Remote</span>
            )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
            <span className="flex items-center gap-1"><MapPin size={12}/> {job.location}</span>
            <span className="flex items-center gap-1"><DollarSign size={12}/> {job.salary.min / 1000}k - {job.salary.max / 1000}k</span>
            <span className="flex items-center gap-1"><Briefcase size={12}/> {job.type}</span>
        </div>

        {(job.minTrustScore > 0 || job.verifiedOnly) && (
            <div className="mb-4 bg-gray-900/50 p-2 rounded-lg border border-gray-800 flex items-center gap-2">
                <Shield size={14} className={isLocked ? "text-red-400" : "text-green-400"} />
                <div className="text-[10px] text-gray-400">
                    {job.verifiedOnly && <span className="block">Requires <span className="text-blue-400 font-bold">Blue Tick</span></span>}
                    {job.minTrustScore > 0 && <span className="block">Min Trust Score: <span className="text-yellow-400 font-bold">{job.minTrustScore}</span></span>}
                </div>
            </div>
        )}
      </div>

      {renderStatusButton()}
    </div>
  );
};

export default JobCard;