import React, { useState, useEffect, useRef } from 'react';
import { Shield, FileText, ChevronLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const LegalDocs = () => {
  const [activeTab, setActiveTab] = useState('privacy'); // 'privacy' or 'terms'
  const contentRef = useRef(null);

  // Scroll to top when tab changes
  useEffect(() => {
    if (contentRef.current) {
        contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white font-sans selection:bg-primary/30 overflow-hidden">
      
      {/* Header (Fixed at Top) */}
      <header className="shrink-0 border-b border-gray-800 bg-gray-900/95 backdrop-blur z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                <ChevronLeft size={16}/> Back to App
            </Link>
            <h1 className="font-bold text-xl flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-xs text-white">AV</div>
                Academic<span className="text-primary">Verse</span> <span className="text-gray-500 font-normal">Legal</span>
            </h1>
        </div>
      </header>

      {/* Main Content (Scrollable Area) */}
      <main ref={contentRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent p-6 pb-20">
        <div className="max-w-4xl mx-auto py-4">
            
            {/* Tab Switcher */}
            <div className="flex justify-center mb-10">
                <div className="bg-gray-800 p-1 rounded-xl inline-flex sticky top-0 shadow-lg z-10">
                    <button 
                        onClick={() => setActiveTab('privacy')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'privacy' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <Shield size={16}/> Privacy Policy
                    </button>
                    <button 
                        onClick={() => setActiveTab('terms')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'terms' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        <FileText size={16}/> Terms of Service
                    </button>
                </div>
            </div>

            <div className="bg-card border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl animate-fade-in-up">
                
                {/* ---------------- PRIVACY POLICY ---------------- */}
                {activeTab === 'privacy' && (
                    <div className="space-y-8 text-gray-300 leading-relaxed">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Lock className="text-primary"/> Privacy Policy</h2>
                            <p className="text-sm text-gray-500 mb-4">Last Updated: January 2026</p>
                            <p>Welcome to AcademicVerse. We value your trust and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data.</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">1. Information We Collect</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Personal Identity:</strong> Name, Email address, Profile picture (via Google Auth or direct upload).</li>
                                <li><strong>Academic Data:</strong> Marks, Skills, Project details, Resumes uploaded by students.</li>
                                <li><strong>Usage Data:</strong> Login times, interactions with jobs, and application history.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">2. How We Use Your Data</h3>
                            <p>We use your data solely to facilitate the hiring process:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>To match Students with potential Recruiters.</li>
                                <li>To calculate "Trust Scores" based on academic performance.</li>
                                
                                {/* UPGRADE 2: Identity Trust Clause */}
                                <li>
                                    To operate <strong>AcademicVerse Identity Trust Engine™</strong> which verifies academic authenticity, recruiter legitimacy and protects students from fraud.
                                </li>

                                <li>To send notifications regarding interviews and job offers.</li>
                                <li>We <strong>do not</strong> sell your data to third-party advertisers.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">3. Data Security</h3>
                            <p>We implement industry-standard security measures (Encryption, Secure Socket Layers) to protect your data. However, no method of transmission over the internet is 100% secure.</p>
                        </div>

                        {/* UPGRADE 1: Regulatory Compliance */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">4. Regulatory Compliance</h3>
                            <p>
                                AcademicVerse complies with applicable data protection regulations including the Information Technology Act (India),
                                GDPR (European Union) and other global privacy standards where applicable.
                                All data is processed lawfully, fairly and transparently.
                            </p>
                        </div>
                    </div>
                )}

                {/* ---------------- TERMS OF SERVICE ---------------- */}
                {activeTab === 'terms' && (
                    <div className="space-y-8 text-gray-300 leading-relaxed">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><FileText className="text-primary"/> Terms of Service</h2>
                            <p className="text-sm text-gray-500 mb-4">Last Updated: January 2026</p>
                            <p>By accessing or using AcademicVerse, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">1. User Accounts</h3>
                            <p>You are responsible for safeguarding the password that you use to access the service. You agree not to disclose your password to any third party.</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">2. Acceptable Use</h3>
                            <p>You agree not to misuse the platform. Prohibited actions include:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Posting fake jobs or fake academic records.</li>
                                <li>Scraping data from the platform.</li>
                                <li>Harassing other users or recruiters.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">3. Termination</h3>
                            <p>We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                        </div>

                        {/* UPGRADE 3: Consent Enforcement */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">4. Consent & Verification</h3>
                            <p>
                                By creating an account, you explicitly consent to verification of your academic, professional and identity information.
                                Providing false information may lead to permanent suspension and legal reporting.
                            </p>
                        </div>
                    </div>
                )}

            </div>

            <footer className="mt-10 text-center text-gray-500 text-sm">
                <p>&copy; 2026 AcademicVerse Inc. All rights reserved.</p>
                <p className="mt-2">Contact us at: support@academicverse.com</p>
            </footer>

        </div>
      </main>
    </div>
  );
};

export default LegalDocs;