import React from 'react';
import { Shield, ShieldCheck, AlertCircle, ShieldAlert } from 'lucide-react';

const TrustBadge = ({ verification, scoreOverride }) => {
  // FLEXIBILITY: Ye component ab object (Dashboard) ya direct score (Registry) dono le sakta hai
  // Agar 'scoreOverride' pass kiya hai (Registry page ke liye), toh wo use karega
  // Warna verification object se nikaalega
  
  let trustScore = scoreOverride !== undefined 
    ? scoreOverride 
    : (verification?.trustScore || 0);

  let isVerified = verification?.isVerified || false;

  // --- LOGIC UPDATE (0-1000 Scale) ---
  let tier = 'Unverified';
  let colorClass = "bg-gray-800 border-gray-700 text-gray-500";
  let Icon = AlertCircle;
  let label = "Identity Unverified";

  if (trustScore >= 700) {
    tier = 'Elite';
    colorClass = "bg-yellow-500/10 border-yellow-500/50 text-yellow-400";
    Icon = ShieldCheck;
    label = "Elite Verified Identity";
  } else if (trustScore >= 400) {
    tier = 'Verified';
    colorClass = "bg-blue-500/10 border-blue-500/50 text-blue-400";
    Icon = Shield;
    label = "Verified Identity";
  } else if (trustScore >= 200) {
    tier = 'Basic';
    colorClass = "bg-green-500/10 border-green-500/50 text-green-400";
    Icon = Shield;
    label = "Basic Verification";
  } else if (trustScore < 200 && trustScore > 0) {
     tier = 'Low Trust';
     colorClass = "bg-red-500/10 border-red-500/50 text-red-400";
     Icon = ShieldAlert;
     label = "Low Trust Score";
  }

  return (
    <div className={`border rounded-xl p-4 backdrop-blur-sm flex items-center justify-between gap-4 ${colorClass} transition-all`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-black/20">
          <Icon size={24} />
        </div>
        <div>
            <h4 className="font-bold text-sm uppercase tracking-wider">{tier} Account</h4>
            <p className="text-xs opacity-80">
                {label}
            </p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-3xl font-black">{trustScore}</div>
        <div className="text-[10px] uppercase font-bold opacity-60">Trust Score</div>
      </div>
    </div>
  );
};

export default TrustBadge;