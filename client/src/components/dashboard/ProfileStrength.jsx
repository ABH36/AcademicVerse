import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileStrength = ({ profile, skills, projects, certs }) => {
  // AI SCORING LOGIC
  let score = 0;
  const missing = [];

  // 1. Identity (20%)
  if (profile?.avatar) score += 10; else missing.push({ txt: "Upload Profile Photo", link: "/dashboard/profile" });
  if (profile?.bio && profile.bio.length > 50) score += 10; else missing.push({ txt: "Add a Detailed Bio", link: "/dashboard/profile" });

  // 2. Skills (20%)
  if (skills?.technicalSkills?.length >= 5) score += 20; 
  else missing.push({ txt: `Add ${5 - (skills?.technicalSkills?.length || 0)} more Technical Skills`, link: "/dashboard/skills" });

  // 3. Projects (30%)
  if (projects?.length >= 1) score += 15; else missing.push({ txt: "Add your first Project", link: "/dashboard/projects" });
  if (projects?.length >= 3) score += 15;

  // 4. Academic/Timeline (20%)
  if (profile?.academicDetails?.collegeName) score += 10;
  if (certs?.length >= 1) score += 10; else missing.push({ txt: "Upload a Certificate", link: "/dashboard/certificates" });

  // 5. Socials (10%)
  if (profile?.socialLinks?.linkedin || profile?.socialLinks?.github) score += 10;

  // Determine Color
  const getColor = () => {
    if (score < 40) return "text-red-500";
    if (score < 75) return "text-yellow-500";
    return "text-green-500";
  };

  const getBarColor = () => {
    if (score < 40) return "bg-red-500";
    if (score < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-card border border-white/5 p-6 rounded-xl">
      <div className="flex justify-between items-end mb-2">
        <h3 className="font-bold text-gray-200 flex items-center gap-2">
            <Zap className="text-yellow-400 fill-yellow-400" size={18} /> Profile Strength
        </h3>
        <span className={`text-2xl font-bold ${getColor()}`}>{score}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-4">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${getBarColor()}`}
        />
      </div>

      {/* AI Recommendations */}
      {score < 100 && (
        <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 uppercase font-bold mb-2">AI Recommendations:</p>
            <div className="space-y-2">
                {missing.slice(0, 3).map((item, i) => (
                    <Link key={i} to={item.link} className="flex items-center gap-2 text-xs text-gray-300 hover:text-white group">
                        <AlertCircle size={12} className="text-primary group-hover:text-white" />
                        {item.txt}
                    </Link>
                ))}
            </div>
        </div>
      )}

      {score === 100 && (
          <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-2 rounded">
              <CheckCircle size={16} /> Profile Optimized for Search!
          </div>
      )}
    </div>
  );
};

export default ProfileStrength;