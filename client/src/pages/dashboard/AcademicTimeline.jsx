import React, { useState, useEffect } from 'react';
import { getAcademicRecord, addTimelineEvent, addSemester } from '../../services/profileService';
import { toast } from 'react-toastify';
import { Plus, BookOpen, Calendar, Award, Upload, X } from 'lucide-react'; // Added X for close icon
import { motion } from 'framer-motion';

const AcademicTimeline = () => {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false); // NEW: Semester Modal State
  
  // Event Form State
  const [eventData, setEventData] = useState({ title: '', description: '', category: 'achievement', date: '' });
  const [proofFile, setProofFile] = useState(null);

  // Semester Form State (NEW)
  const [semData, setSemData] = useState({ semesterNumber: '', sgpa: '', status: 'completed' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAcademicRecord();
      setRecord(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE TIMELINE EVENT ---
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', eventData.title);
      formData.append('description', eventData.description);
      formData.append('category', eventData.category);
      formData.append('date', eventData.date);
      if (proofFile) formData.append('proof', proofFile);

      await addTimelineEvent(formData);
      toast.success('Milestone Added!');
      setShowEventModal(false);
      loadData(); // Refresh
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  // --- HANDLE SEMESTER SUBMIT (NEW FIX) ---
  const handleSemesterSubmit = async (e) => {
    e.preventDefault();
    try {
        // Basic validation
        if(!semData.semesterNumber || !semData.sgpa) {
            return toast.warning("Semester No. and SGPA are required");
        }

        const payload = {
            semesterNumber: semData.semesterNumber,
            sgpa: semData.sgpa,
            status: semData.status,
            subjects: [] // Sending empty subjects array for now as per minimal requirement
        };

        await addSemester(payload);
        toast.success(`Semester ${semData.semesterNumber} Result Added!`);
        setShowSemesterModal(false);
        
        // Reset Form
        setSemData({ semesterNumber: '', sgpa: '', status: 'completed' });
        
        loadData(); // Refresh UI
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to add semester');
    }
  };

  if (loading) return <div className="p-10 text-white">Loading Academic History...</div>;

  return (
    <div className="text-white p-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
           <h1 className="text-2xl font-bold">Academic Timeline</h1>
           <p className="text-gray-400 text-sm">Your educational journey & milestones.</p>
        </div>
        <button 
           onClick={() => setShowEventModal(true)}
           className="bg-primary hover:bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
        >
           <Plus size={16} /> Add Milestone
        </button>
      </header>
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
         <div className="bg-card border border-white/5 p-4 rounded-xl">
            <span className="text-gray-400 text-xs uppercase">Current CGPA</span>
            <p className="text-2xl font-bold text-green-400">{record?.currentCgpa || 'N/A'}</p>
         </div>
         <div className="bg-card border border-white/5 p-4 rounded-xl">
            <span className="text-gray-400 text-xs uppercase">Semesters</span>
            <p className="text-2xl font-bold">{record?.semesters?.length || 0}</p>
         </div>
         <div className="bg-card border border-white/5 p-4 rounded-xl">
            <span className="text-gray-400 text-xs uppercase">Active Backlogs</span>
            <p className="text-2xl font-bold text-red-400">{record?.totalBacklogs || 0}</p>
         </div>
         <div className="bg-card border border-white/5 p-4 rounded-xl">
            <span className="text-gray-400 text-xs uppercase">Milestones</span>
            <p className="text-2xl font-bold">{record?.timeline?.length || 0}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left: Timeline Events */}
         <div className="lg:col-span-2 space-y-6 relative">
             <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800" /> {/* Vertical Line */}
             
             {record?.timeline?.map((ev, index) => (
                 <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={ev._id} 
                    className="relative pl-12"
                 >
                    {/* Dot Icon */}
                    <div className="absolute left-0 top-1 w-8 h-8 bg-gray-900 border-2 border-primary rounded-full flex items-center justify-center z-10">
                        {ev.category === 'achievement' ? <Award size={14} className="text-primary"/> : <BookOpen size={14} className="text-blue-400"/>}
                    </div>
                    
                    {/* Content Card */}
                    <div className="bg-card border border-white/5 p-5 rounded-xl hover:border-primary/30 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{ev.title}</h3>
                            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{new Date(ev.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{ev.description}</p>
                        
                        {/* Proof Preview */}
                        {ev.proofUrl && (
                             <div className="mt-3">
                                <a href={ev.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline flex items-center gap-1">
                                    View Proof <Upload size={12}/>
                                </a>
                             </div>
                        )}
                    </div>
                 </motion.div>
             ))}
             
             {(!record?.timeline || record.timeline.length === 0) && (
                 <p className="pl-12 text-gray-500 italic">No milestones yet. Add your first achievement!</p>
             )}
         </div>

         {/* Right: Quick Semester List (Mini) */}
         <div className="space-y-4">
            <h3 className="font-bold text-lg border-b border-white/5 pb-2">Academic History</h3>
            {record?.semesters?.map((sem) => (
                <div key={sem._id} className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-bold">Semester {sem.semesterNumber}</p>
                        <p className="text-xs text-gray-400">{sem.subjects.length} Subjects</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-primary">SGPA: {sem.sgpa}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${sem.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {sem.status}
                        </span>
                    </div>
                </div>
            ))}
            
            {/* FIXED: CLICKABLE BUTTON */}
            <button 
                onClick={() => setShowSemesterModal(true)}
                className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 text-sm hover:text-white hover:border-white transition-colors"
            >
                + Add Semester Results
            </button>
         </div>
      </div>

      {/* MODAL 1: Add Event */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-md p-6 rounded-xl relative">
                <button onClick={() => setShowEventModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                <h2 className="text-xl font-bold mb-4">Add Milestone</h2>
                <form onSubmit={handleEventSubmit} className="space-y-4">
                    <input 
                        type="text" placeholder="Title (e.g. Won Hackathon)" 
                        className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white focus:border-primary outline-none"
                        value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})}
                        required
                    />
                    <textarea 
                        placeholder="Description" rows={3}
                        className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white focus:border-primary outline-none"
                        value={eventData.description} onChange={e => setEventData({...eventData, description: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <select 
                             className="bg-gray-800 border border-gray-700 p-2 rounded text-white focus:border-primary outline-none"
                             value={eventData.category} onChange={e => setEventData({...eventData, category: e.target.value})}
                        >
                            <option value="achievement">Achievement</option>
                            <option value="certification">Certification</option>
                            <option value="workshop">Workshop</option>
                            <option value="internship">Internship</option>
                        </select>
                        <input 
                            type="date" 
                            className="bg-gray-800 border border-gray-700 p-2 rounded text-white focus:border-primary outline-none"
                            value={eventData.date} onChange={e => setEventData({...eventData, date: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Upload Proof (Image/PDF)</label>
                        <input type="file" onChange={e => setProofFile(e.target.files[0])} className="text-sm text-gray-400" />
                    </div>
                    <button type="submit" className="w-full bg-primary py-2 rounded font-bold hover:bg-blue-600 transition-colors">Save Event</button>
                </form>
            </div>
        </div>
      )}

      {/* MODAL 2: Add Semester (NEW) */}
      {showSemesterModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-sm p-6 rounded-xl relative">
                <button onClick={() => setShowSemesterModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                <h2 className="text-xl font-bold mb-4">Add Semester Result</h2>
                <form onSubmit={handleSemesterSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Semester Number</label>
                        <input 
                            type="number" placeholder="e.g. 1" min="1" max="10"
                            className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white focus:border-primary outline-none"
                            value={semData.semesterNumber} onChange={e => setSemData({...semData, semesterNumber: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">SGPA / Grade</label>
                        <input 
                            type="number" placeholder="e.g. 8.5" step="0.01" min="0" max="10"
                            className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white focus:border-primary outline-none"
                            value={semData.sgpa} onChange={e => setSemData({...semData, sgpa: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Status</label>
                        <select 
                             className="w-full bg-gray-800 border border-gray-700 p-2 rounded text-white focus:border-primary outline-none"
                             value={semData.status} onChange={e => setSemData({...semData, status: e.target.value})}
                        >
                            <option value="completed">Completed (Pass)</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="declared">Result Declared</option>
                        </select>
                    </div>
                    
                    <button type="submit" className="w-full bg-green-600 py-2 rounded font-bold hover:bg-green-700 transition-colors">Update Result</button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default AcademicTimeline;