import React, { useState, useEffect } from 'react';
import { getMySkills, updateSkill, deleteSkill } from '../../services/profileService';
import { toast } from 'react-toastify';
import { X, Check, Award } from 'lucide-react';

const levels = ['Beginner', 'Intermediate', 'Advanced']; // Expert is hidden/admin only

const SkillManager = () => {
  const [skillData, setSkillData] = useState({ technicalSkills: [], softSkills: [], badges: [] });
  const [loading, setLoading] = useState(true);
  
  // Input State
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState('Beginner');
  const [activeTab, setActiveTab] = useState('technical'); // 'technical' or 'soft'

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await getMySkills();
      setSkillData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    try {
      await updateSkill({ type: activeTab, name: newSkill, level: newLevel });
      toast.success('Skill Added!');
      setNewSkill('');
      loadSkills();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleRemove = async (type, name) => {
    try {
      await deleteSkill(type, name);
      toast.success('Skill Removed');
      loadSkills();
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  if (loading) return <div className="p-10 text-white">Loading Skills...</div>;

  return (
    <div className="text-white p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Skill & Badge Engine</h1>
      <p className="text-gray-400 text-sm mb-8">Showcase your technical arsenal and soft skills.</p>

      {/* Verified Badges Section */}
      {skillData.badges.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl">
              <h3 className="text-yellow-400 font-bold mb-4 flex items-center gap-2"><Award size={18}/> Official Verified Badges</h3>
              <div className="flex flex-wrap gap-4">
                  {skillData.badges.map((badge, i) => (
                      <div key={i} className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-yellow-500/30">
                          <i className={`${badge.icon} text-yellow-400`}></i>
                          <div>
                              <p className="text-sm font-bold text-gray-200">{badge.name}</p>
                              <p className="text-[10px] text-gray-400">Issued by {badge.issuedBy}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Main Input Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Input Column */}
         <div className="md:col-span-1 bg-card border border-white/5 p-6 rounded-xl h-fit">
            <h3 className="font-bold mb-4">Add New Skill</h3>
            
            <div className="flex gap-2 mb-4 bg-gray-800 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('technical')}
                    className={`flex-1 text-xs py-2 rounded font-medium transition-colors ${activeTab === 'technical' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    Technical
                </button>
                <button 
                    onClick={() => setActiveTab('soft')}
                    className={`flex-1 text-xs py-2 rounded font-medium transition-colors ${activeTab === 'soft' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    Soft Skill
                </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Skill Name</label>
                    <input 
                        type="text" placeholder={activeTab === 'technical' ? "e.g. React.js" : "e.g. Leadership"}
                        className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-sm"
                        value={newSkill} onChange={e => setNewSkill(e.target.value)}
                        required
                    />
                </div>
                <div>
                     <label className="text-xs text-gray-400 block mb-1">Proficiency Level</label>
                     <select 
                        className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-sm"
                        value={newLevel} onChange={e => setNewLevel(e.target.value)}
                     >
                        {levels.map(l => <option key={l} value={l}>{l}</option>)}
                     </select>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-blue-600 py-2 rounded font-bold text-sm">
                    Add to Profile
                </button>
            </form>
         </div>

         {/* List Column */}
         <div className="md:col-span-2 space-y-6">
             {/* Tech Skills */}
             <div>
                <h3 className="text-gray-400 text-xs uppercase font-bold mb-3">Technical Skills ({skillData.technicalSkills.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {skillData.technicalSkills.map((s, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg border border-white/5 hover:border-gray-600 transition-colors group">
                            <div>
                                <p className="font-bold text-sm">{s.name}</p>
                                <p className="text-xs text-primary">{s.level}</p>
                            </div>
                            <button onClick={() => handleRemove('technical', s.name)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                    {skillData.technicalSkills.length === 0 && <p className="text-sm text-gray-500 italic">No technical skills added yet.</p>}
                </div>
             </div>

             {/* Soft Skills */}
             <div>
                <h3 className="text-gray-400 text-xs uppercase font-bold mb-3">Soft Skills ({skillData.softSkills.length})</h3>
                <div className="flex flex-wrap gap-3">
                    {skillData.softSkills.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-800/30 px-4 py-2 rounded-full border border-white/5 group">
                            <span className="text-sm">{s.name}</span>
                            <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded text-gray-300">{s.level}</span>
                            <button onClick={() => handleRemove('soft', s.name)} className="text-gray-500 hover:text-red-400">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default SkillManager;