import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api'; 
import { motion } from 'framer-motion';
import { 
  MapPin, Calendar, Link as LinkIcon, Github, Linkedin, 
  ExternalLink, Award, BookOpen, CheckCircle, Shield 
} from 'lucide-react';
import ShareProfile from '../components/ShareProfile';
import TrustBadge from '../components/TrustBadge'; // Ensure this file exists

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const { data } = await api.get(`/public/u/${username}`);
        setProfile(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Profile not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-mono text-sm">Accessing AcademicVerse Network...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 text-center">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 max-w-md">{error}</p>
        <button onClick={() => window.location.href = '/'} className="mt-6 text-primary hover:underline">Return to Home</button>
    </div>
  );

  // Theme Handling (Safe Fallback)
  const themeColor = profile.theme?.accentColor || '#3B82F6';

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-primary/30 relative overflow-x-hidden">
        {/* SEO Injection */}
        <Helmet>
            <title>{profile.identity.name} - AcademicVerse</title>
            <meta name="description" content={profile.identity.bio || `View ${profile.identity.name}'s verified academic portfolio and projects.`} />
            
            {/* Open Graph */}
            <meta property="og:type" content="profile" />
            <meta property="og:title" content={`${profile.identity.name} | Verified Student Portfolio`} />
            <meta property="og:description" content={profile.identity.bio || "View my academic credentials and projects."} />
            <meta property="og:image" content={profile.identity.avatar || "https://academicverse.com/social-cover.png"} />
            <meta property="og:url" content={window.location.href} />
        </Helmet>

        {/* Floating Share Button */}
        <ShareProfile username={username} name={profile.identity.name} />

        {/* --- HERO SECTION --- */}
        <header className="relative bg-card border-b border-white/5 pt-20 pb-16">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" style={{ backgroundColor: `${themeColor}20` }} />
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    
                    {/* Avatar */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative group"
                    >
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-800 overflow-hidden bg-gray-700 shadow-2xl">
                            {profile.identity.avatar ? (
                                <img src={profile.identity.avatar} alt={profile.identity.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500">
                                    {profile.identity.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        {/* Online Status Dot */}
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                    </motion.div>
                    
                    {/* Identity Info */}
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{profile.identity.name}</h1>
                            {profile.identity.verification?.isVerified && (
                                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                    <CheckCircle size={12} /> Verified Student
                                </span>
                            )}
                        </div>
                        
                        <p className="text-lg text-gray-400 mb-6 max-w-2xl font-light leading-relaxed">
                            {profile.identity.bio || "No bio added yet."}
                        </p>

                        {/* --- NEW TRUST BADGE INSERTED HERE --- */}
                        <div className="mb-6 max-w-md mx-auto md:mx-0">
                            <TrustBadge verification={profile.identity.verification} />
                        </div>
                        {/* ------------------------------------- */}

                        {/* Metadata Row */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 mb-6">
                            {profile.academic?.semesters && (
                                <span className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-white/5">
                                    <BookOpen size={14} className="text-gray-400"/> 
                                    {profile.academic.collegeName || "College Student"}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-white/5">
                                <Calendar size={14} className="text-gray-400"/> 
                                Joined {new Date(profile.identity.joinedAt).getFullYear()}
                            </span>
                            <span className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-white/5">
                                <MapPin size={14} className="text-gray-400"/> 
                                India
                            </span>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            {profile.socials?.github && (
                                <a href={profile.socials.github} target="_blank" rel="noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-white hover:text-black transition-all">
                                    <Github size={20} />
                                </a>
                            )}
                            {profile.socials?.linkedin && (
                                <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-[#0077b5] hover:text-white transition-all">
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {profile.socials?.website && (
                                <a href={profile.socials.website} target="_blank" rel="noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-primary hover:text-white transition-all">
                                    <LinkIcon size={20} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* LEFT COLUMN: Skills & Certs */}
            <div className="lg:col-span-1 space-y-10">
                
                {/* 1. SKILLS */}
                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        Technical Arsenal
                        <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-full">{profile.skills.technicalSkills.length}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.skills.technicalSkills.map((skill, idx) => (
                            <span key={idx} className="bg-gray-800/50 hover:bg-gray-800 border border-white/5 hover:border-white/20 text-gray-300 text-sm px-3 py-1.5 rounded-md transition-colors cursor-default">
                                {skill.name}
                            </span>
                        ))}
                    </div>
                    {profile.skills.technicalSkills.length === 0 && <p className="text-gray-600 text-sm italic">No skills listed.</p>}
                </section>

                {/* 2. CERTIFICATES (Verified Only) */}
                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        Verified Credentials
                        <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-full">{profile.certificates.length}</span>
                    </h3>
                    <div className="space-y-3">
                        {profile.certificates.map((cert) => (
                            <div key={cert._id} className="bg-card border border-white/5 p-4 rounded-xl flex gap-3 group hover:border-primary/30 transition-colors">
                                <div className="mt-1">
                                    <Award className="text-yellow-500 w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-200 group-hover:text-primary transition-colors">{cert.title}</h4>
                                    <p className="text-xs text-gray-500">{cert.issuingOrganization}</p>
                                    <p className="text-[10px] text-gray-600 mt-1">{new Date(cert.issueDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                        {profile.certificates.length === 0 && <p className="text-gray-600 text-sm italic">No verified certificates visible.</p>}
                    </div>
                </section>

                {/* 3. SOFT SKILLS */}
                {profile.skills.softSkills.length > 0 && (
                    <section>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Core Competencies</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.softSkills.map((skill, idx) => (
                                <span key={idx} className="text-xs text-gray-400 bg-gray-800/30 px-3 py-1 rounded-full border border-white/5">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* RIGHT COLUMN: Projects & Timeline */}
            <div className="lg:col-span-2 space-y-12">
                
                {/* 1. FEATURED PROJECTS */}
                <section>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        Featured Projects
                        <div className="h-px flex-1 bg-gray-800"></div>
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {profile.projects.map((project, index) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={project._id} 
                                className="group bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all shadow-lg hover:shadow-primary/5 flex flex-col md:flex-row"
                            >
                                {/* Project Thumbnail */}
                                <div className="md:w-48 h-48 md:h-auto bg-gray-800 overflow-hidden relative shrink-0">
                                    {project.images && project.images[0] ? (
                                        <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                                            <Github size={32} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{project.title}</h4>
                                            <p className="text-xs text-primary font-medium tracking-wide mb-2">{project.tagline}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {project.links.github && <a href={project.links.github} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white"><Github size={18}/></a>}
                                            {project.links.liveDemo && <a href={project.links.liveDemo} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white"><ExternalLink size={18}/></a>}
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{project.description}</p>

                                    <div className="mt-auto flex flex-wrap gap-2">
                                        {project.techStack.map((tech, i) => (
                                            <span key={i} className="text-[10px] font-mono bg-white/5 text-gray-300 px-2 py-1 rounded border border-white/5">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {profile.projects.length === 0 && (
                            <div className="p-8 border border-dashed border-gray-800 rounded-xl text-center text-gray-500">
                                No public projects available.
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. ACADEMIC JOURNEY (If Public) */}
                {profile.academic && (
                    <section>
                         <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            Academic Journey
                            <div className="h-px flex-1 bg-gray-800"></div>
                        </h3>
                        
                        <div className="space-y-4">
                            {profile.academic.timeline?.map((event, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full mt-2 ${event.category === 'achievement' ? 'bg-yellow-500' : 'bg-primary'}`}></div>
                                        <div className="w-0.5 flex-1 bg-gray-800 my-1"></div>
                                    </div>
                                    <div className="pb-6">
                                        <p className="text-xs text-gray-500 mb-1">{new Date(event.date).toLocaleDateString()}</p>
                                        <h5 className="font-bold text-gray-200 text-lg">{event.title}</h5>
                                        <p className="text-sm text-gray-400">{event.description}</p>
                                    </div>
                                </div>
                            ))}
                            {(!profile.academic.timeline || profile.academic.timeline.length === 0) && (
                                <p className="text-gray-600 text-sm italic">Timeline is private or empty.</p>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 mt-20 py-8 text-center">
            <p className="text-gray-600 text-sm">
                Identity Verified by <span className="font-bold text-gray-500">AcademicVerse</span> • 
                <a href="/" className="ml-1 text-primary hover:underline">Create your profile</a>
            </p>
        </footer>
    </div>
  );
};

export default PublicProfile;