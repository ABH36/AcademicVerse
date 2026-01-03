import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Lock, Mail, User, AtSign, ArrowRight, Loader } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic Client Validation
    if (formData.password.length < 6) {
        toast.warning("Password must be at least 6 characters.");
        setLoading(false);
        return;
    }

    const result = await register(formData);
    
    if (result.success) {
      toast.success('Account Created! Welcome to the Verse.');
      // Redirect to Profile Editor to complete setup
      navigate('/dashboard/profile');
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden p-4">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md bg-card/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Join AcademicVerse</h1>
          <p className="text-gray-400 text-sm">Create your verifiable student identity.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                name="name" type="text" placeholder="John Doe" required
                value={formData.name} onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Username</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                name="username" type="text" placeholder="john_dev" required
                value={formData.username} onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all lowercase"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                name="email" type="email" placeholder="student@college.edu" required
                value={formData.email} onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <input
                name="password" type="password" placeholder="••••••••" required
                value={formData.password} onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <Loader className="animate-spin h-5 w-5" /> : (
              <>
                Initialize Account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
                Already have an identity? <Link to="/login" className="text-primary hover:underline">Log In</Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;