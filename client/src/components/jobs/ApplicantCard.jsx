import React, { useState } from 'react';
import { CheckCircle, XCircle, Shield, ExternalLink, Clock, Calendar, Trophy } from 'lucide-react';

const ApplicantCard = ({ application, onUpdateStatus }) => {
  const { applicant, trustSnapshot, status } = application;
  const [showSchedule, setShowSchedule] = useState(false);
  const [interview, setInterview] = useState({
      type: 'online', link: '', datetime: '', message: ''
  });

  const handleScheduleSubmit = () => {
      onUpdateStatus(application._id, 'interview', interview);
      setShowSchedule(false);
  };

  // Color Logic
  const score = trustSnapshot?.score || 0;
  const scoreColor = score >= 90 ? 'text-yellow-400' : score >= 70 ? 'text-blue-400' : 'text-gray-500';

  return (
    <div className="bg-gray-900 border border-white/10 p-4 rounded-xl flex flex-col gap-4 shadow-lg">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">{applicant?.avatar ? <img src={applicant.avatar} className="w-full h-full object-cover"/> : <div className="p-2 text-center text-xs">{applicant?.name?.[0]}</div>}</div>
          <div>
            <h4 className="font-bold text-white text-sm">{applicant?.name}</h4>
            <a href={`/u/${applicant?.username}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">Profile <ExternalLink size={10}/></a>
          </div>
        </div>
        <div className={`text-xl font-black ${scoreColor} flex items-center gap-1`}>{score} <Shield size={14}/></div>
      </div>

      <div className="text-xs text-center border bg-gray-800 p-1 rounded uppercase font-bold text-gray-400">{status}</div>

      {/* SCHEDULING FORM */}
      {showSchedule && (
          <div className="bg-black/50 p-3 rounded space-y-2 text-xs">
              <input type="datetime-local" className="w-full bg-gray-800 rounded p-1 text-white" onChange={e => setInterview({...interview, datetime: e.target.value})} />
              <select className="w-full bg-gray-800 rounded p-1 text-white" onChange={e => setInterview({...interview, type: e.target.value})}>
                  <option value="online">Online (Zoom/Meet)</option>
                  <option value="offline">In-Person</option>
              </select>
              <input type="text" placeholder="Link or Address" className="w-full bg-gray-800 rounded p-1 text-white" onChange={e => setInterview({...interview, link: e.target.value})} />
              <button onClick={handleScheduleSubmit} className="w-full bg-blue-600 text-white rounded py-1 font-bold">Send Invite</button>
          </div>
      )}

      {/* ACTIONS */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        {status === 'applied' && (
            <>
                <button onClick={() => onUpdateStatus(application._id, 'rejected')} className="bg-gray-800 text-red-400 py-2 rounded text-xs font-bold hover:bg-red-900/20">Reject</button>
                <button onClick={() => onUpdateStatus(application._id, 'shortlisted')} className="bg-primary/20 text-primary py-2 rounded text-xs font-bold hover:bg-primary/30">Shortlist</button>
            </>
        )}
        {status === 'shortlisted' && (
            <button onClick={() => setShowSchedule(!showSchedule)} className="col-span-2 bg-blue-600 text-white py-2 rounded text-xs font-bold flex justify-center gap-2"><Calendar size={14}/> Schedule Interview</button>
        )}
        {status === 'interview' && (
            <button onClick={() => onUpdateStatus(application._id, 'offered')} className="col-span-2 bg-green-600 text-white py-2 rounded text-xs font-bold flex justify-center gap-2"><Trophy size={14}/> Send Offer</button>
        )}
      </div>
    </div>
  );
};

export default ApplicantCard;