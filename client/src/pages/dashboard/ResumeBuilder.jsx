import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { getMyProfile, getMySkills } from '../../services/profileService';
import { getMyProjects } from '../../services/projectService';
import { Printer, Download, Mail, Phone, MapPin, Github, Linkedin } from 'lucide-react';

// The Printable Component
const PrintableResume = React.forwardRef(({ profile, skills, projects }, ref) => {
  if (!profile) return null;
  
  return (
    <div ref={ref} className="bg-white text-gray-800 p-10 w-[210mm] min-h-[297mm] mx-auto shadow-2xl print:shadow-none print:w-full">
      {/* Header */}
      <header className="border-b-2 border-gray-800 pb-6 mb-6">
        <h1 className="text-4xl font-bold uppercase tracking-wider text-gray-900">{profile.user?.name}</h1>
        <p className="text-xl text-gray-600 font-medium mt-1">{profile.academicDetails?.branch} Student</p>
        
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            {profile.user?.email && <span className="flex items-center gap-1"><Mail size={14}/> {profile.user.email}</span>}
            {profile.socialLinks?.linkedin && <span className="flex items-center gap-1"><Linkedin size={14}/> {profile.socialLinks.linkedin.replace('https://', '')}</span>}
            {profile.socialLinks?.github && <span className="flex items-center gap-1"><Github size={14}/> {profile.socialLinks.github.replace('https://', '')}</span>}
        </div>
      </header>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-3 gap-8">
         {/* Left Column (Skills & Education) */}
         <div className="col-span-1 space-y-8">
            <section>
                <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Education</h3>
                <div className="mb-2">
                    <p className="font-bold">{profile.academicDetails?.collegeName}</p>
                    <p className="text-sm">{profile.academicDetails?.branch}</p>
                    <p className="text-sm text-gray-500">{profile.academicDetails?.batchYear}</p>
                    {profile.themeSettings?.showCGPA && <p className="text-sm font-medium mt-1">CGPA: {profile.academicDetails?.cgpa || 'N/A'}</p>}
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {skills?.technicalSkills?.map((s, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded border border-gray-200 block w-full text-center">
                            {s.name}
                        </span>
                    ))}
                </div>
            </section>
         </div>

         {/* Right Column (Projects & Experience) */}
         <div className="col-span-2 space-y-8">
            <section>
                <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Professional Summary</h3>
                <p className="text-sm leading-relaxed text-gray-700">{profile.bio}</p>
            </section>

            <section>
                <h3 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 pb-1">Projects</h3>
                {projects?.map((p, i) => (
                    <div key={i} className="mb-4">
                        <div className="flex justify-between items-baseline">
                            <h4 className="font-bold text-gray-900">{p.title}</h4>
                            <div className="text-xs text-gray-500">{p.techStack.slice(0,3).join(', ')}</div>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{p.description}</p>
                        {p.links?.liveDemo && <a href={p.links.liveDemo} className="text-xs text-blue-600 underline mt-1 block">Live Demo</a>}
                    </div>
                ))}
            </section>
         </div>
      </div>
    </div>
  );
});

// The Page Wrapper
const ResumeBuilder = () => {
  const componentRef = useRef();
  const [data, setData] = useState({ profile: null, skills: null, projects: null });
  const [loading, setLoading] = useState(true);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Resume_${data.profile?.user?.name || 'AcademicVerse'}`,
  });

  useEffect(() => {
    const loadAll = async () => {
        const [profile, skills, projects] = await Promise.all([
            getMyProfile(), getMySkills(), getMyProjects()
        ]);
        setData({ profile, skills, projects });
        setLoading(false);
    };
    loadAll();
  }, []);

  if (loading) return <div className="p-10 text-white">Generating PDF Preview...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
        <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold">Resume Studio</h1>
                <p className="text-gray-400 text-sm">ATS-Friendly Format. Auto-generated from your profile.</p>
            </div>
            <button 
                onClick={handlePrint}
                className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
                <Printer size={18} /> Print / Save as PDF
            </button>
        </header>

        <div className="max-w-5xl mx-auto bg-gray-800 p-8 rounded-xl border border-gray-700 overflow-auto">
            <div className="scale-90 origin-top">
                <PrintableResume 
                    ref={componentRef} 
                    profile={data.profile} 
                    skills={data.skills} 
                    projects={data.projects} 
                />
            </div>
        </div>
    </div>
  );
};

export default ResumeBuilder;