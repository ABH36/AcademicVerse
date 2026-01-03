import React, { useState, useEffect } from 'react';
import { createJob, getMyPostedJobs, getJobApplications, updateAppStatus } from '../../services/jobService';
import { toast } from 'react-toastify';
import { PlusCircle, Loader, ShieldCheck, Briefcase, Users } from 'lucide-react';
import ApplicantCard from '../../components/jobs/ApplicantCard';

const RecruiterHub = () => {
  const [activeTab, setActiveTab] = useState('post'); // 'post' or 'manage'
  const [loading, setLoading] = useState(false);
  
  // Post Job State
  const [formData, setFormData] = useState({
    companyName: '', title: '', description: '', type: 'Full-Time', location: '',
    minSalary: '', maxSalary: '', minTrustScore: 0, verifiedOnly: false
  });

  // Manage State
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(false);

  // FETCH MY JOBS (When switching to Manage tab)
  useEffect(() => {
    if (activeTab === 'manage') {
        const fetchJobs = async () => {
            try {
                const data = await getMyPostedJobs();
                setMyJobs(data);
            } catch (error) {
                console.error("Failed to fetch jobs");
            }
        };
        fetchJobs();
    }
  }, [activeTab]);

  // FETCH APPLICANTS (When a job is selected)
  useEffect(() => {
    if (selectedJobId) {
        const fetchApps = async () => {
            setAppLoading(true);
            try {
                const data = await getJobApplications(selectedJobId);
                setApplications(data);
            } catch (error) {
                toast.error("Failed to load applicants");
            } finally {
                setAppLoading(false);
            }
        };
        fetchApps();
    }
  }, [selectedJobId]);

  // --- HANDLERS ---
  const handlePostJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert inputs
    const payload = {
        company: { name: formData.companyName },
        title: formData.title,
        description: formData.description,
        type: formData.type,
        location: formData.location,
        salary: { min: Number(formData.minSalary), max: Number(formData.maxSalary) },
        minTrustScore: Number(formData.minTrustScore),
        verifiedOnly: formData.verifiedOnly
    };

    try {
        await createJob(payload);
        toast.success('Job Posted Successfully!');
        // Reset essential fields
        setFormData({ ...formData, title: '', description: '' }); 
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to post job');
    } finally {
        setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, status) => {
      try {
          await updateAppStatus(appId, status);
          toast.success(`Candidate ${status}`);
          // Optimistic UI Update (List refresh karo bina API call ke)
          setApplications(prev => prev.map(app => 
              app._id === appId ? { ...app, status } : app
          ));
      } catch (error) {
          toast.error("Failed to update status");
      }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
        
        {/* HEADER & TABS SWITCHER */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Recruiter Command Center</h1>
                <p className="text-gray-300 text-sm">Post opportunities & Analyze Talent Intelligence.</p>
            </div>
            
            {/* Custom Tab Switcher */}
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                <button 
                    onClick={() => setActiveTab('post')}
                    className={`px-5 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all 
                    ${activeTab === 'post' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Briefcase size={16}/> Post Job
                </button>
                <button 
                    onClick={() => setActiveTab('manage')}
                    className={`px-5 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all 
                    ${activeTab === 'manage' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Users size={16}/> Applications
                </button>
            </div>
        </div>

        {/* === TAB 1: POST JOB FORM === */}
        {activeTab === 'post' && (
             <form onSubmit={handlePostJob} className="bg-card border border-white/5 p-6 rounded-xl space-y-5 shadow-2xl">
                <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3 mb-2 flex items-center gap-2">
                    <PlusCircle size={20} className="text-primary"/> Create New Listing
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-bold">Company Name</label>
                        <input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Google" required className="w-full bg-gray-800 border-gray-700 rounded p-3 text-white focus:border-primary outline-none transition-colors" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-bold">Location</label>
                        <input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Remote / Bangalore" required className="w-full bg-gray-800 border-gray-700 rounded p-3 text-white focus:border-primary outline-none transition-colors" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase font-bold">Job Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Junior React Developer" required className="w-full bg-gray-800 border-gray-700 rounded p-3 text-white focus:border-primary outline-none transition-colors" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-bold">Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded p-3 text-white focus:border-primary outline-none">
                            <option>Full-Time</option><option>Internship</option><option>Contract</option><option>Remote</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-bold">Min Salary (₹)</label>
                        <input name="minSalary" type="number" value={formData.minSalary} onChange={handleChange} placeholder="0" className="w-full bg-gray-800 border-gray-700 rounded p-3 text-white focus:border-primary outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-bold">Max Salary (₹)</label>
                        <input name="maxSalary" type="number" value={formData.maxSalary} onChange={handleChange} placeholder="0" className="w-full bg-gray-800 border-gray-700 rounded p-3 text-white focus:border-primary outline-none" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase font-bold">Description & Requirements</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the role..." rows="5" className="w-full bg-gray-800 border-gray-700 rounded p-3 text-white focus:border-primary outline-none" />
                </div>
                
                {/* TRUST FILTER SECTION */}
                <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-500/20 space-y-3">
                    <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2"><ShieldCheck size={18}/> Quality Filters (Trust Layer)</h3>
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                            <input type="checkbox" name="verifiedOnly" checked={formData.verifiedOnly} onChange={handleChange} className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-primary focus:ring-primary" />
                            Only Verified Students (Blue Tick)
                        </label>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-300">Minimum Trust Score:</span>
                            <input type="number" name="minTrustScore" value={formData.minTrustScore} onChange={handleChange} className="w-20 bg-gray-800 border-gray-600 rounded p-2 text-white text-sm text-center focus:border-blue-500 outline-none" />
                            <span className="text-xs text-gray-500">(0-100)</span>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-blue-600 py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2 transition-all shadow-lg hover:shadow-primary/25">
                    {loading ? <Loader className="animate-spin h-5 w-5"/> : <><PlusCircle size={20}/> Publish Opportunity</>}
                </button>
            </form>
        )}

        {/* === TAB 2: MANAGE APPLICATIONS === */}
        {activeTab === 'manage' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
                
                {/* Left: Job List (3 Columns) */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Your Jobs</h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {myJobs.map(job => (
                            <div 
                                key={job._id} 
                                onClick={() => setSelectedJobId(job._id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] 
                                ${selectedJobId === job._id 
                                    ? 'bg-primary border-primary text-white shadow-lg' 
                                    : 'bg-card border-white/5 text-gray-400 hover:bg-gray-800 hover:border-white/10'}`}
                            >
                                <h4 className="font-bold text-sm line-clamp-1">{job.title}</h4>
                                <div className="flex justify-between mt-2 text-xs opacity-80">
                                    <span className="bg-black/20 px-2 py-0.5 rounded">{job.type}</span>
                                    <span className="font-mono">{job.applicantsCount} Candidates</span>
                                </div>
                            </div>
                        ))}
                        {myJobs.length === 0 && (
                            <div className="text-center py-10 bg-card border border-dashed border-gray-700 rounded-xl">
                                <p className="text-gray-500 text-sm">No jobs posted yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Applicants Grid (9 Columns) */}
                <div className="lg:col-span-8 bg-card border border-white/5 rounded-xl p-6 min-h-[500px]">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                         <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                            {selectedJobId ? 'Applicant Intelligence' : 'Select a Job'}
                        </h3>
                        {selectedJobId && (
                            <span className="text-xs text-gray-500">Sorted by Trust Score</span>
                        )}
                    </div>
                    
                    {appLoading ? (
                        <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-primary w-8 h-8"/></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {applications.map(app => (
                                <ApplicantCard key={app._id} application={app} onUpdateStatus={handleStatusUpdate} />
                            ))}
                            
                            {selectedJobId && applications.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                                    <Users size={48} className="mb-4 opacity-20"/>
                                    <p>No applications received yet.</p>
                                    <p className="text-xs mt-2">Wait for the Trust System to bring you talent.</p>
                                </div>
                            )}

                            {!selectedJobId && (
                                <div className="col-span-full flex flex-col items-center justify-center h-full text-gray-500">
                                    <Briefcase size={48} className="mb-4 opacity-20"/>
                                    <p>Select a job from the left to view candidates.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default RecruiterHub;