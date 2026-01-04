import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { getMyProfile, getMySkills } from '../../services/profileService';
import { getMyProjects } from '../../services/projectService';
import { Printer, Mail, Github, Linkedin, Loader, AlertCircle } from 'lucide-react';

// --- COMPONENT 1: THE RESUME CONTENT (Pure UI) ---
// Note: No forwardRef needed here anymore. We handle ref in the parent.
const PrintableResume = ({ profile, skills, projects }) => {
  
  // Safe Defaults if data is missing
  const user = profile?.user || {};
  const academic = profile?.academicDetails || {};
  const socials = profile?.socialLinks || {};
  const techSkills = skills?.technicalSkills || [];
  const softSkills = skills?.softSkills || [];
  const projList = projects || [];

  return (
    <div 
        className="bg-white text-gray-800 p-10 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none print:w-full print:m-0 print:p-8"
        style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
    >
      {/* Header */}
      <header className="border-b-2 border-gray-800 pb-6 mb-6">
        <h1 className="text-4xl font-bold uppercase tracking-wider text-gray-900">
            {user.name || "Your Name"}
        </h1>
        <p className="text-xl text-gray-600 font-medium mt-1">
            {academic.branch || 'Student'} 
        </p>
        
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            {user.email && <span className="flex items-center gap-1"><Mail size={14}/> {user.email}</span>}
            {socials.linkedin && <span className="flex items-center gap-1"><Linkedin size={14}/> {socials.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
            {socials.github && <span className="flex items-center gap-1"><Github size={14}/> {socials.github.replace(/^https?:\/\/(www\.)?/, '')}</span>}
        </div>
      </header>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-3 gap-8">
         
         {/* Left Column (Skills & Education) */}
         <div className="col-span-1 space-y-8">
            <section>
                <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Education</h3>
                <div className="mb-2">
                    <p className="font-bold">{academic.collegeName || 'University Name'}</p>
                    <p className="text-sm">{academic.branch || 'Branch / Major'}</p>
                    <p className="text-sm text-gray-500">{academic.batchYear || 'Batch Year'}</p>
                    {profile?.themeSettings?.showCGPA && academic.cgpa && (
                        <p className="text-sm font-medium mt-1">CGPA: {academic.cgpa}</p>
                    )}
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {techSkills.length > 0 ? (
                        techSkills.map((s, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded border border-gray-200 block w-full text-center print:bg-gray-100 print:border-gray-300">
                                {s.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-gray-400">Add skills in Profile</span>
                    )}
                </div>
            </section>

            {/* Soft Skills (Optional) */}
            {softSkills.length > 0 && (
                <section>
                    <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Competencies</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                        {softSkills.map((s, i) => <li key={i}>{s.name}</li>)}
                    </ul>
                </section>
            )}
         </div>

         {/* Right Column (Projects & Experience) */}
         <div className="col-span-2 space-y-8">
            <section>
                <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Professional Summary</h3>
                <p className="text-sm leading-relaxed text-gray-700 text-justify">
                    {profile?.bio || "A motivated student ready to leverage academic knowledge in practical software development environments. Eager to learn and contribute."}
                </p>
            </section>

            <section>
                <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Projects</h3>
                {projList.length > 0 ? (
                    projList.map((p, i) => (
                        <div key={i} className="mb-5 break-inside-avoid">
                            <div className="flex justify-between items-baseline">
                                <h4 className="font-bold text-gray-900">{p.title}</h4>
                                <div className="text-xs text-gray-500 italic">
                                    {p.techStack ? p.techStack.slice(0,4).join(', ') : ''}
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 mt-1 text-justify">{p.description}</p>
                            {p.links?.liveDemo && (
                                <a href={p.links.liveDemo} className="text-xs text-blue-600 underline mt-1 block print:no-underline print:text-gray-500">Live Project Link</a>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 italic">Add projects to showcase your work.</p>
                )}
            </section>
         </div>
      </div>
      
      {/* Footer for ATS/Print */}
      <div className="mt-10 pt-4 border-t border-gray-200 text-center text-xs text-gray-400 hidden print:block">
            Verified Resume generated by AcademicVerse
      </div>
    </div>
  );
};

// --- COMPONENT 2: THE PAGE WRAPPER ---
const ResumeBuilder = () => {
  const componentRef = useRef(null);
  const [data, setData] = useState({ profile: null, skills: null, projects: null });
  const [loading, setLoading] = useState(true);

  // Hook configuration with Safety Check
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Resume_${data.profile?.user?.name || 'Student'}`,
    onPrintError: (errorLocation, error) => console.log("Print Error:", error),
  });

  useEffect(() => {
    const loadAll = async () => {
        try {
            // Using Promise.allSettled to handle partial failures gracefully
            const [profileRes, skillsRes, projectsRes] = await Promise.allSettled([
                getMyProfile(), getMySkills(), getMyProjects()
            ]);

            setData({ 
                profile: profileRes.status === 'fulfilled' ? profileRes.value : {}, 
                skills: skillsRes.status === 'fulfilled' ? skillsRes.value : {}, 
                projects: projectsRes.status === 'fulfilled' ? projectsRes.value : [] 
            });
        } catch (error) {
            console.error("Resume Load Error", error);
        } finally {
            setLoading(false);
        }
    };
    loadAll();
  }, []);

  if (loading) return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
          <Loader className="animate-spin mr-2"/> Creating Resume Studio...
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-white overflow-x-hidden">
        <header className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-bold">Resume Studio</h1>
                <p className="text-gray-400 text-sm">ATS-Friendly Format. Auto-generated from your profile.</p>
            </div>
            <button 
                onClick={handlePrint}
                className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
                <Printer size={18} /> Print / Save as PDF
            </button>
        </header>

        {/* Scrollable Preview Area */}
        <div className="max-w-5xl mx-auto bg-gray-800 p-4 md:p-8 rounded-xl border border-gray-700 overflow-auto shadow-inner">
            <div className="transform scale-[0.6] md:scale-90 origin-top w-fit mx-auto">
                {/* CRITICAL FIX: 
                   The ref is attached to this wrapper DIV. 
                   This DIV always exists, so 'react-to-print' never gets null.
                */}
                <div ref={componentRef}>
                    <PrintableResume 
                        profile={data.profile} 
                        skills={data.skills} 
                        projects={data.projects} 
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default ResumeBuilder;