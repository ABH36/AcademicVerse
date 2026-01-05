import React from 'react';
import { Shield, ShieldCheck, AlertCircle, ShieldAlert, Zap } from 'lucide-react';

const TrustBadge = ({ verification, scoreOverride }) => {
  // FLEXIBILITY: Ye component object (Dashboard) ya direct score (Registry) dono le sakta hai
  let trustScore = scoreOverride !== undefined 
    ? scoreOverride 
    : (verification?.trustScore || 0);

  // --- LOGIC UPDATE: SYNC WITH JOB CONTROLLER (Gold/Silver/Bronze) ---
  let tier = {
      name: 'Unverified',
      color: 'text-gray-500',
      bg: 'bg-gray-800 border-gray-700',
      icon: AlertCircle,
      label: 'Complete Profile to Score'
  };

  if (trustScore >= 700) {
    tier = {
        name: 'Gold Tier',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10 border-yellow-500/50',
        icon: ShieldCheck,
        label: 'Elite Verified Identity'
    };
  } else if (trustScore >= 400) {
    tier = {
        name: 'Silver Tier',
        color: 'text-blue-300', // Blue-ish Silver for "Verified" feel
        bg: 'bg-blue-500/10 border-blue-500/40',
        icon: Shield,
        label: 'Verified Identity'
    };
  } else if (trustScore > 0) {
    tier = {
        name: 'Bronze Tier',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10 border-orange-500/40',
        icon: ShieldAlert, // Alert because score is low
        label: 'Building Trust'
    };
  }

  return (
    <div className={`border rounded-xl p-4 backdrop-blur-sm flex items-center justify-between gap-4 ${tier.bg} ${tier.color} transition-all shadow-lg`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full bg-black/20 ${tier.color === 'text-yellow-400' ? 'shadow-[0_0_15px_rgba(250,204,21,0.3)]' : ''}`}>
          <tier.icon size={24} />
        </div>
        <div>
            <h4 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                {tier.name}
                {trustScore >= 700 && <Zap size={12} className="fill-yellow-400 text-yellow-400 animate-pulse"/>}
            </h4>
            <p className="text-xs opacity-80 font-medium">
                {tier.label}
            </p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-3xl font-black tracking-tight">{trustScore}</div>
        <div className="text-[10px] uppercase font-bold opacity-60">Trust Score</div>
      </div>
    </div>
  );
};

export default TrustBadge;