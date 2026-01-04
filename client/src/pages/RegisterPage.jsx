import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, AtSign, ArrowRight, Loader, CheckCircle, Send, ShieldCheck } from 'lucide-react';
import api from '../services/api'; 

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // --- OTP STATE ---
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- SEND OTP HANDLER ---
  const handleSendOTP = async () => {
    if (!formData.email) return toast.warning("Please enter an email address first.");
    if (!formData.email.includes('@')) return toast.warning("Invalid email format.");

    try {
        setLoading(true);
        await api.post('/auth/send-email-otp', { email: formData.email });
        setOtpSent(true);
        toast.info(`OTP sent to ${formData.email}`);
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
        setLoading(false);
    }
  };

  // --- VERIFY OTP HANDLER ---
  const handleVerifyOTP = async () => {
      if (!otp || otp.length < 6) return toast.warning("Enter valid 6-digit OTP");
      
      try {
          setVerifyingOtp(true);
          await api.post('/auth/verify-email-otp', { email: formData.email, otp });
          setIsEmailVerified(true);
          setOtpSent(false); 
          toast.success("Email Verified Successfully! ✅");
      } catch (error) {
          toast.error(error.response?.data?.message || "Invalid OTP");
      } finally {
          setVerifyingOtp(false);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Check Verification First
    if (!isEmailVerified) {
        toast.error("Please verify your email address before registering.");
        return;
    }

    setLoading(true);

    if (formData.password.length < 6) {
        toast.warning("Password must be at least 6 characters.");
        setLoading(false);
        return;
    }

    const result = await register(formData);
    
    if (result.success) {
      toast.success('Account Created! Welcome to the Verse.');
      navigate('/dashboard/profile');
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-y-auto overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Content Wrapper */}
      <div className="relative min-h-full flex items-center justify-center p-4 py-12 z-10">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl"
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

            {/* Email + Verification Logic */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex justify-between">
                    Email Address
                    {isEmailVerified && <span className="text-green-400 flex items-center gap-1"><ShieldCheck size={12}/> Verified</span>}
                </label>
                <div className="relative">
                <Mail className={`absolute left-3 top-3 h-5 w-5 ${isEmailVerified ? 'text-green-500' : 'text-gray-500'}`} />
                <input
                    name="email" type="email" placeholder="student@college.edu" required
                    value={formData.email} onChange={handleChange}
                    disabled={isEmailVerified || otpSent} 
                    className={`w-full bg-gray-800/50 border ${isEmailVerified ? 'border-green-500/50' : 'border-gray-700'} text-white rounded-lg py-2.5 pl-10 pr-24 focus:ring-2 focus:ring-primary/50 outline-none transition-all`}
                />
                
                {/* UPGRADED VERIFY BUTTON */}
                <div className="absolute right-1 top-1 bottom-1">
                    {isEmailVerified ? (
                        <div className="h-full flex items-center px-3 bg-green-500/10 rounded text-green-400 text-xs font-bold border border-green-500/20">
                            <CheckCircle size={16} className="mr-1"/> Verified
                        </div>
                    ) : (
                        !otpSent && (
                            <button 
                                type="button"
                                onClick={handleSendOTP}
                                disabled={loading || !formData.email}
                                // NEW COLOR: Vibrant Blue + Glow Effect
                                className="h-full px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/40 border border-blue-400/20"
                            >
                                {loading ? <Loader className="animate-spin h-3 w-3"/> : "Verify"}
                            </button>
                        )
                    )}
                </div>
                </div>
            </div>

            {/* OTP Input */}
            <AnimatePresence>
                {otpSent && !isEmailVerified && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 space-y-2 mt-2">
                            <label className="text-xs text-blue-300">Enter OTP sent to your email</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-center tracking-widest font-mono focus:border-blue-500 outline-none"
                                    maxLength={6}
                                />
                                <button 
                                    type="button"
                                    onClick={handleVerifyOTP}
                                    disabled={verifyingOtp}
                                    className="bg-green-600 hover:bg-green-500 text-white px-4 rounded font-bold text-sm transition-colors shadow-lg shadow-green-900/20"
                                >
                                    {verifyingOtp ? <Loader className="animate-spin h-4 w-4"/> : "Confirm"}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 text-center cursor-pointer hover:text-white" onClick={() => setOtpSent(false)}>
                                Wrong email? Change it.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                whileHover={isEmailVerified ? { scale: 1.02 } : {}}
                whileTap={isEmailVerified ? { scale: 0.98 } : {}}
                type="submit"
                disabled={loading || !isEmailVerified}
                className={`w-full font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6
                    ${isEmailVerified 
                        ? 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/25' 
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-70'}`}
            >
                {loading ? <Loader className="animate-spin h-5 w-5" /> : (
                <>
                    {isEmailVerified ? "Initialize Account" : "Verify Email to Continue"} 
                    {isEmailVerified && <ArrowRight className="h-4 w-4" />}
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
    </div>
  );
};

export default RegisterPage;