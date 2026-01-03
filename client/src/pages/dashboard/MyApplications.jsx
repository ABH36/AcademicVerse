import React, { useEffect, useState } from 'react';
import { getMyApplications, respondToOffer } from '../../services/jobService';
import { Loader, Clock, CheckCircle, XCircle, Trophy, Briefcase, MapPin, Lock, Video, Map, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const data = await getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleOfferResponse = async (appId, response) => {
    try {
        await respondToOffer(appId, response);
        toast.success(`Offer ${response} successfully`);
        fetchApps(); // Refresh UI
    } catch (error) {
        toast.error("Failed to update offer");
    }
  };

  const renderStatusDetails = (app) => {
      // 1. INTERVIEW VIEW
      if (app.status === 'interview' && app.interview) {
          return (
              <div className="mt-3 bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg text-sm">
                  <h4 className="font-bold text-blue-400 flex items-center gap-2 mb-2">
                      <Calendar size={14}/> Interview Scheduled
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300">
                      <p><span className="text-gray-500">Time:</span> {new Date(app.interview.datetime).toLocaleString()}</p>
                      <p><span className="text-gray-500">Mode:</span> {app.interview.type.toUpperCase()}</p>
                      <p className="md:col-span-2 flex items-center gap-1">
                          {app.interview.type === 'online' ? <Video size={12}/> : <Map size={12}/>}
                          <span className="text-white bg-black/30 px-2 rounded select-all">{app.interview.link || app.interview.venue}</span>
                      </p>
                      {app.interview.message && <p className="md:col-span-2 text-xs italic text-gray-400">"{app.interview.message}"</p>}
                  </div>
              </div>
          );
      }

      // 2. OFFER VIEW
      if (app.status === 'offered') {
          return (
              <div className="mt-3 bg-green-900/20 border border-green-500/30 p-4 rounded-lg text-center animate-pulse">
                  <h4 className="font-bold text-green-400 text-lg mb-2">🎉 You have received an Offer!</h4>
                  <p className="text-sm text-gray-300 mb-4">The company wants to hire you. Do you accept?</p>
                  <div className="flex justify-center gap-4">
                      <button onClick={() => handleOfferResponse(app._id, 'accepted')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold">Accept Offer</button>
                      <button onClick={() => handleOfferResponse(app._id, 'declined')} className="bg-gray-700 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold">Decline</button>
                  </div>
              </div>
          );
      }
      return null;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'shortlisted': return <span className="text-green-400 bg-green-500/10 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">Shortlisted</span>;
      case 'interview': return <span className="text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">Interviewing</span>;
      case 'offered': return <span className="text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20">Offer Received</span>;
      case 'hired': return <span className="text-white bg-green-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-green-500/20">HIRED</span>;
      case 'rejected': return <span className="text-red-400 bg-red-500/10 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">Rejected</span>;
      default: return <span className="text-gray-400 bg-gray-500/10 px-3 py-1 rounded-full text-xs font-bold">Applied</span>;
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader className="animate-spin text-primary"/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-end">
          <div><h1 className="text-2xl font-bold text-white">Application History</h1><p className="text-gray-400 text-sm">Track your journey.</p></div>
          <Link to="/dashboard/jobs" className="text-primary text-sm hover:underline">Browse Jobs</Link>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
            <div key={app._id} className="bg-card border border-white/5 p-5 rounded-xl hover:border-primary/30 transition-all">
               <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center font-bold text-xl text-white">{app.job?.company?.name?.[0] || 'C'}</div>
                      <div>
                         <h3 className="font-bold text-white">{app.job?.title}</h3>
                         <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                            <Briefcase size={12}/> {app.job?.company?.name} • <MapPin size={12}/> {app.job?.location}
                         </p>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">{getStatusBadge(app.status)}<span className="text-[10px] text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</span></div>
               </div>
               {renderStatusDetails(app)}
            </div>
        ))}
      </div>
    </div>
  );
};

export default MyApplications;