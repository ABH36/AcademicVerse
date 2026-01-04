import React, { useState } from 'react';
import { CheckCircle, XCircle, Shield, ExternalLink, Clock, Calendar, Trophy, Send, Briefcase, MapPin, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const ApplicantCard = ({ application, onUpdateStatus }) => {
  const { applicant, trustSnapshot, status } = application;
  
  // --- STATE 1: Interview Scheduling (Purana Logic) ---
  const [showSchedule, setShowSchedule] = useState(false);
  const [interview, setInterview] = useState({
      type: 'online', 
      link: '', 
      datetime: '', 
      message: ''
  });

  // --- STATE 2: Offer Letter Details (NEW UPDATED) ---
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offer, setOffer] = useState({ 
      role: '', 
      salary: '', 
      joiningDate: '', 
      location: '', // New: Reporting Address
      manager: '',  // New: Reporting Manager
      message: '' 
  });

  // Handle Interview Submit
  const handleScheduleSubmit = () => {
      // Validation
      if (!interview.datetime) {
          toast.warning("Please select a Date & Time for the interview.");
          return;
      }
      if (!interview.link) {
          toast.warning("Please provide a Meeting Link or Venue address.");
          return;
      }
      // Send Data
      onUpdateStatus(application._id, 'interview', interview);
      setShowSchedule(false);
  };

  // --- Handle Offer Submit (NEW) ---
  const handleOfferSubmit = () => {
      // Validation including new Location field
      if (!offer.salary || !offer.joiningDate || !offer.location) {
          toast.warning("Salary, Joining Date & Location are required!");
          return;
      }
      
      onUpdateStatus(application._id, 'offered', offer);
      setShowOfferForm(false);
  };

  // Color Logic for Trust Score
  const score = trustSnapshot?.score || 0;
  const scoreColor = score >= 90 ? 'text-yellow-400' : score >= 70 ? 'text-blue-400' : 'text-gray-500';

  return (
    <div className="bg-gray-900 border border-white/10 p-4 rounded-xl flex flex-col gap-4 shadow-lg transition-all hover:border-primary/30">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
              {applicant?.avatar ? (
                  <img src={applicant.avatar} className="w-full h-full object-cover" alt="avatar"/>
              ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-xs">
                      {applicant?.name?.[0]}
                  </div>
              )}
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">{applicant?.name}</h4>
            <a href={`/u/${applicant?.username}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                View Profile <ExternalLink size={10}/>
            </a>
          </div>
        </div>
        <div className={`text-xl font-black ${scoreColor} flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded`}>
            {score} <Shield size={14}/>
        </div>
      </div>

      {/* STATUS BADGE */}
      <div className={`text-xs text-center border p-1 rounded uppercase font-bold tracking-wider
          ${status === 'flagged' ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400'}
      `}>
          {status}
      </div>

      {/* --- FORM 1: INTERVIEW SCHEDULING (SAME AS BEFORE) --- */}
      {showSchedule && (
          <div className="bg-gray-800 p-4 rounded-lg space-y-3 text-xs border border-blue-500/30 shadow-2xl relative animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-blue-400 uppercase">Interview Details</span>
                  <button onClick={() => setShowSchedule(false)} className="text-gray-500 hover:text-white"><XCircle size={14}/></button>
              </div>

              <div>
                  <label className="block text-gray-500 mb-1">Date & Time *</label>
                  <input type="datetime-local" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none" onChange={e => setInterview({...interview, datetime: e.target.value})}/>
              </div>

              <div className="flex gap-2">
                  <div className="flex-1">
                      <label className="block text-gray-500 mb-1">Mode</label>
                      <select className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white outline-none" onChange={e => setInterview({...interview, type: e.target.value})} value={interview.type}>
                          <option value="online">Online (Video)</option>
                          <option value="offline">In-Person</option>
                      </select>
                  </div>
              </div>

              <div>
                  <label className="block text-gray-500 mb-1">{interview.type === 'online' ? 'Meeting Link *' : 'Venue Address *'}</label>
                  <input type="text" placeholder={interview.type === 'online' ? "Paste Zoom/GMeet link..." : "Office Floor, Building Name..."} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none placeholder:text-gray-600" onChange={e => setInterview({...interview, link: e.target.value})} />
              </div>

              <div>
                  <label className="block text-gray-500 mb-1">Instructions (Optional)</label>
                  <textarea rows="2" placeholder="e.g. Please join 5 mins early." className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none placeholder:text-gray-600 resize-none" onChange={e => setInterview({...interview, message: e.target.value})}></textarea>
              </div>

              <button onClick={handleScheduleSubmit} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded py-2 font-bold flex items-center justify-center gap-2 transition-colors mt-2">
                  <Send size={14} /> Send Invite
              </button>
          </div>
      )}

      {/* --- FORM 2: OFFER LETTER (UPDATED WITH ADDRESS & MANAGER) --- */}
      {showOfferForm && (
          <div className="bg-green-900/20 p-4 rounded-lg space-y-3 text-xs border border-green-500/30 shadow-2xl relative animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-green-400 uppercase flex items-center gap-1"><Trophy size={14}/> Generate Offer</span>
                  <button onClick={() => setShowOfferForm(false)} className="text-gray-500 hover:text-white"><XCircle size={14}/></button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                   <div>
                      <label className="text-gray-400 block mb-1">Designation</label>
                      <input type="text" placeholder="e.g. Jr Developer" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-green-500 outline-none" onChange={e => setOffer({...offer, role: e.target.value})}/>
                   </div>
                   <div>
                      <label className="text-gray-400 block mb-1">CTC / Salary *</label>
                      <input type="text" placeholder="₹ LPA" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-green-500 outline-none" onChange={e => setOffer({...offer, salary: e.target.value})}/>
                   </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                  <div>
                      <label className="text-gray-400 block mb-1">Joining Date *</label>
                      <input type="date" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-green-500 outline-none" onChange={e => setOffer({...offer, joiningDate: e.target.value})}/>
                  </div>
                  <div>
                      <label className="text-gray-400 block mb-1">Reporting Manager</label>
                      <input type="text" placeholder="e.g. HR Manager" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-green-500 outline-none" onChange={e => setOffer({...offer, manager: e.target.value})}/>
                  </div>
              </div>

              {/* NEW FIELD: ADDRESS */}
              <div>
                  <label className="text-gray-400 block mb-1">Reporting Address / Location *</label>
                  <input type="text" placeholder="e.g. 4th Floor, Tech Park, Bangalore OR Remote" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-green-500 outline-none" onChange={e => setOffer({...offer, location: e.target.value})}/>
              </div>

              <div>
                  <label className="text-gray-400 block mb-1">Personal Note</label>
                  <textarea rows="2" placeholder="Welcome to the team..." className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white resize-none focus:border-green-500 outline-none" onChange={e => setOffer({...offer, message: e.target.value})}></textarea>
              </div>
              
              <button onClick={handleOfferSubmit} className="w-full bg-green-600 hover:bg-green-500 text-white rounded py-2 font-bold flex items-center justify-center gap-2 transition-colors mt-2">
                  <Send size={14}/> Release Offer
              </button>
          </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        {status === 'applied' && (
            <>
                <button onClick={() => onUpdateStatus(application._id, 'rejected')} className="bg-gray-800 border border-gray-700 text-gray-400 py-2 rounded text-xs font-bold hover:bg-red-900/20 hover:text-red-400 hover:border-red-500/30 transition-all">Reject</button>
                <button onClick={() => onUpdateStatus(application._id, 'shortlisted')} className="bg-primary/10 border border-primary/20 text-primary py-2 rounded text-xs font-bold hover:bg-primary/20 transition-all">Shortlist</button>
            </>
        )}
        
        {status === 'shortlisted' && !showSchedule && !showOfferForm && (
            <button onClick={() => setShowSchedule(true)} className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-xs font-bold flex justify-center gap-2 transition-all items-center">
                <Calendar size={14}/> Schedule Interview
            </button>
        )}

        {status === 'interview' && !showOfferForm && (
            <button onClick={() => setShowOfferForm(true)} className="col-span-2 bg-green-600 hover:bg-green-500 text-white py-2 rounded text-xs font-bold flex justify-center gap-2 transition-all items-center shadow-lg shadow-green-900/20">
                <Trophy size={14}/> Finalize & Send Offer
            </button>
        )}

        {status === 'offered' && (
             <div className="col-span-2 text-center text-[10px] text-green-400 bg-green-900/20 py-2 rounded border border-green-500/20 flex flex-col items-center">
                 <span>🎉 Offer Letter Sent.</span>
                 <span className="opacity-70">Awaiting Candidate Response.</span>
             </div>
        )}

        {status === 'flagged' && (
             <div className="col-span-2 text-center text-[10px] text-red-400 italic">
                 Flagged by automated fraud detection.
             </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantCard;