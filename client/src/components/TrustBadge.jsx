import React from 'react';
import { Shield, ShieldCheck, AlertCircle } from 'lucide-react';

const TrustBadge = ({ verification }) => {
  const { isVerified, trustScore, trustTier } = verification || { isVerified: false, trustScore: 0, trustTier: 'Unverified' };

  // Color Logic
  const getColors = () => {
    if (trustScore >= 90) return "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"; // Elite
    if (trustScore >= 70) return "bg-blue-500/10 border-blue-500/50 text-blue-400"; // Gold/Verified
    if (isVerified) return "bg-green-500/10 border-green-500/50 text-green-400"; // Standard Verified
    return "bg-gray-800 border-gray-700 text-gray-500"; // Unverified
  };

  return (
    <div className={`border rounded-xl p-4 backdrop-blur-sm flex items-center justify-between gap-4 ${getColors()}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-black/20">
          {isVerified ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
        </div>
        <div>
            <h4 className="font-bold text-sm uppercase tracking-wider">{trustTier} Account</h4>
            <p className="text-xs opacity-80">
                {isVerified ? "Identity Verified by Institution" : "Identity Unverified"}
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