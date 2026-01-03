import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Globe, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-tight">
          Academic<span className="text-primary">Verse</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="text-gray-300 hover:text-white font-medium px-4 py-2">Login</Link>
          <Link to="/register" className="bg-primary hover:bg-blue-600 text-white px-5 py-2 rounded-full font-bold transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
            Your Academic <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Identity Operating System.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0">
            Stop using PDF resumes. Build a verifiable, futuristic portfolio that proves your skills to recruiters instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/login" className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              Create Profile <ArrowRight size={20}/>
            </Link>
            <Link to="/u/demo_user" className="border border-gray-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-colors">
              View Demo
            </Link>
          </div>
        </div>
        
        {/* Hero Visual */}
        <div className="relative">
           <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
           <img 
             src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
             alt="Dashboard Preview" 
             className="relative z-10 rounded-2xl border border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700"
           />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-gray-800/50 py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
           <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4"><Shield size={24}/></div>
              <h3 className="text-xl font-bold">Verifiable Trust</h3>
              <p className="text-gray-400">Upload certificates and proofs. We lock them on the timeline so recruiters know they are real.</p>
           </div>
           <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4"><Zap size={24}/></div>
              <h3 className="text-xl font-bold">Skill Engine</h3>
              <p className="text-gray-400">Don't just list skills. Level them up. Earn system badges for verified achievements.</p>
           </div>
           <div className="space-y-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 mb-4"><Globe size={24}/></div>
              <h3 className="text-xl font-bold">Global Identity</h3>
              <p className="text-gray-400">One link for everything. Your resume, your portfolio, your academic history. SEO optimized.</p>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-gray-500 text-sm">
        <p>© 2025 AcademicVerse Inc. Built for the Future of Education.</p>
      </footer>
    </div>
  );
};

export default LandingPage;