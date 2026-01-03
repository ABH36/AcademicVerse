import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Shield, CheckCircle, Mail, ArrowRight, Loader } from 'lucide-react';

const StudentVerification = ({ profile, onVerified }) => {
  const [step, setStep] = useState(1); // 1: Email Input, 2: OTP Input, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // If already verified, show badge
  if (profile?.verification?.isVerified) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl flex items-center gap-4">
        <div className="bg-green-500/20 p-3 rounded-full text-green-400">
           <CheckCircle size={32} />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Verified Student</h3>
          <p className="text-green-400/80 text-sm">Your academic status is confirmed.</p>
        </div>
      </div>
    );
  }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/verify/initiate', { academicEmail: email });
      toast.success('OTP sent! Check your inbox (or console).');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/verify/confirm', { otp });
      toast.success('Verification Successful!');
      setStep(3);
      if (onVerified) onVerified(); // Refresh parent data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-white/5 p-6 rounded-xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Shield size={100} />
      </div>

      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
        <Shield className="text-primary" size={20}/> Get Verified
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Unlock the Blue Tick by verifying your institutional email.
      </p>

      {/* STEP 1: Email Input */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase">College Email ID</label>
            <div className="flex gap-2 mt-1">
              <input 
                type="email" 
                placeholder="you@college.edu" 
                className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-1 focus:ring-primary outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-blue-600 py-2 rounded font-bold text-white flex justify-center items-center gap-2"
          >
            {loading ? <Loader className="animate-spin h-4 w-4"/> : <>Send OTP <ArrowRight size={16}/></>}
          </button>
        </form>
      )}

      {/* STEP 2: OTP Input */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in-up">
           <div className="text-center mb-4">
             <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
               Sent to {email}
             </span>
           </div>
           
           <div className="flex justify-center gap-2">
             <input 
               type="text" 
               maxLength="6"
               placeholder="123456" 
               className="w-full text-center tracking-[1em] text-2xl font-bold bg-gray-800 border border-gray-700 rounded p-3 text-white focus:ring-1 focus:ring-primary outline-none"
               value={otp}
               onChange={(e) => setOtp(e.target.value)}
               required
             />
           </div>

           <button 
            type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold text-white flex justify-center items-center gap-2"
          >
            {loading ? <Loader className="animate-spin h-4 w-4"/> : 'Confirm & Verify'}
          </button>
          
          <button 
            type="button" 
            onClick={() => setStep(1)}
            className="w-full text-xs text-gray-500 hover:text-white mt-2"
          >
            Change Email
          </button>
        </form>
      )}

      {/* STEP 3: Success */}
      {step === 3 && (
        <div className="text-center py-6 animate-bounce-in">
          <div className="inline-flex bg-green-500 rounded-full p-4 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Verified!</h2>
          <p className="text-gray-400 text-sm mt-2">You now have the Blue Tick.</p>
        </div>
      )}
    </div>
  );
};

export default StudentVerification;