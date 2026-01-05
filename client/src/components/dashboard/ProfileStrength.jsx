import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertCircle, CheckCircle, ShieldCheck, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileStrength = ({ profile, skills, projects, certs }) => {
  // --- 1. BACKEND TRUST SCORE (The Real Metric) ---
  // Default to 0 if profile not loaded yet
  const trustScore = profile?.trustScore || 0;
  const isVerified = profile?.verification?.isVerified || false;

  // Calculate Tier
  let tier = { name: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
  if (trustScore >= 700) {
      tier = { name: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
  } else if (trustScore >= 400) {
      tier = { name: 'Silver', color: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
  }

  // --- 2. FRONTEND COMPLETENESS LOGIC (Guide for User) ---
  let completeness = 0;
  const missing = [];

  // A. Identity (20%)
  if (profile?.avatar) completeness += 10; else missing.push({ txt: "Upload Profile Photo", link: "/dashboard/profile" });
  if (profile?.bio && profile.bio.length > 50) completeness += 10; else missing.push({ txt: "Add a Detailed Bio", link: "/dashboard/profile" });

  // B. Skills (20%)
  if (skills?.technicalSkills?.length >= 3) completeness += 20; 
  else missing.push({ txt: "Add 3+ Technical Skills", link: "/dashboard/skills" });

  // C. Projects (30%)
  if (projects?.length >= 1) completeness += 15; else missing.push({ txt: "Add your first Project", link: "/dashboard/projects" });
  if (projects?.length >= 2) completeness += 15;

  // D. Academic/Timeline (20%)
  if (profile?.academicDetails?.collegeName) completeness += 10;
  if (certs?.length >= 1) completeness += 10; else missing.push({ txt: "Upload a Certificate", link: "/dashboard/certificates" });

  // E. Socials (10%)
  if (profile?.socialLinks?.linkedin) completeness += 10; else missing.push({ txt: "Link LinkedIn Profile", link: "/dashboard/profile" });


  // --- HELPERS ---
  const getBarColor = () => {
    if (completeness < 40) return "bg-red-500";
    if (completeness < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-4">
        
        {/* --- PART 1: REAL TRUST SCORE (For Jobs) --- */}
        <div className={`p-4 rounded-xl border ${tier.border} ${tier.bg} flex items-center justify-between`}>
            <div>
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Trust Score (Job Access)</p>
                <div className="flex items-end gap-2">
                    <h2 className={`text-3xl font-black ${tier.color} flex items-center gap-2`}>
                        <ShieldCheck size={28} /> {trustScore}
                    </h2>
                    <span className="text-gray-500 text-sm mb-1">/ 1000</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded border ${tier.border} ${tier.color} font-bold uppercase`}>
                        {tier.name} Tier
                    </span>
                    {isVerified && (
                        <span className="text-xs px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 font-bold flex items-center gap-1">
                            <CheckCircle size={10} /> Verified
                        </span>
                    )}
                </div>
            </div>

            {/* Visual Lock/Unlock Indicator */}
            <div className="text-right">
                {trustScore < 500 ? (
                    <div className="flex flex-col items-end text-gray-500">
                        <Lock size={24} className="mb-1 opacity-50"/>
                        <span className="text-xs">Premium Jobs Locked</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-end text-green-400">
                        <Zap size={24} className="mb-1"/>
                        <span className="text-xs">High Access</span>
                    </div>
                )}
            </div>
        </div>

        {/* --- PART 2: COMPLETENESS BAR (Guide) --- */}
        <div className="bg-card border border-white/5 p-6 rounded-xl">
            <div className="flex justify-between items-end mb-2">
                <h3 className="font-bold text-gray-200 flex items-center gap-2 text-sm uppercase">
                    Profile Completeness
                </h3>
                <span className="text-xl font-bold text-white">{completeness}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-4">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completeness}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full ${getBarColor()}`}
                />
            </div>

            {/* AI Recommendations */}
            {completeness < 100 && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-2">To Boost Trust Score:</p>
                    <div className="space-y-2">
                        {missing.slice(0, 3).map((item, i) => (
                            <Link key={i} to={item.link} className="flex items-center gap-2 text-xs text-gray-300 hover:text-white group transition-colors">
                                <AlertCircle size={12} className="text-primary group-hover:text-white shrink-0" />
                                {item.txt}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {completeness === 100 && (
                <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-2 rounded justify-center">
                    <CheckCircle size={16} /> Profile Fully Optimized!
                </div>
            )}
        </div>
    </div>
  );
};

export default ProfileStrength;