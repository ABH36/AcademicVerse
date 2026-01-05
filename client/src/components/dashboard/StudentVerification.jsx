import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Shield, ArrowRight, Loader, CheckCircle } from 'lucide-react';

const StudentVerification = ({ profile, onVerified }) => {
  const [step, setStep] = useState(1); // 1: Email Input, 2: OTP Input, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // --- UI CLEANUP LOGIC ---
  // If already verified, return NULL to hide this card completely.
  // The 'Verified' status is already shown in the top Trust Score card.
  if (profile?.verification?.isVerified) {
    return null;
  }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/verify/initiate', { academicEmail: email });
      toast.success('OTP sent! Check your institutional email inbox.');
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
      toast.success('Verification Successful! Trust Score Updated.');
      setStep(3);
      
      // Delay slightly before hiding the card so user sees success message
      setTimeout(() => {
          if (onVerified) onVerified(); 
      }, 2000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER SUCCESS STATE TEMPORARILY ---
  if (step === 3) {
      return (
        <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl flex flex-col items-center text-center animate-in fade-in zoom-in">
           <div className="bg-green-500/20 p-3 rounded-full text-green-400 mb-3 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
               <CheckCircle size={32} />
           </div>
           <h3 className="font-bold text-white text-lg">Verification Complete!</h3>
           <p className="text-green-400/80 text-sm">Refreshing your dashboard...</p>
        </div>
      );
  }

  return (
    <div className="bg-card border border-white/5 p-6 rounded-xl relative overflow-hidden transition-all hover:border-primary/30">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Shield size={100} />
      </div>

      <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
        <Shield className="text-primary" size={20}/> Get Verified
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Unlock the Blue Tick by verifying your institutional email.
      </p>

      {/* STEP 1: Email Input */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">College Email ID</label>
            <div className="flex gap-2 mt-1">
              <input 
                type="email" 
                placeholder="you@college.edu" 
                className="flex-1 bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-primary outline-none transition-colors placeholder:text-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-2">
                We only accept .edu, .ac.in, or valid institutional domains.
            </p>
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-blue-600 py-3 rounded font-bold text-white flex justify-center items-center gap-2 transition-all shadow-lg hover:shadow-primary/25"
          >
            {loading ? <Loader className="animate-spin h-4 w-4"/> : <>Send OTP <ArrowRight size={16}/></>}
          </button>
        </form>
      )}

      {/* STEP 2: OTP Input */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in slide-in-from-right-4 fade-in">
           <div className="text-center mb-4 bg-blue-500/10 p-2 rounded border border-blue-500/20">
             <span className="text-blue-400 text-xs font-medium">
               OTP sent to <span className="text-white font-bold">{email}</span>
             </span>
           </div>
           
           <div className="flex justify-center gap-2">
             <input 
               type="text" 
               maxLength="6"
               placeholder="000000" 
               className="w-full text-center tracking-[0.5em] text-2xl font-bold bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-green-500 outline-none transition-colors"
               value={otp}
               onChange={(e) => setOtp(e.target.value)}
               required
             />
           </div>

           <button 
            type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 py-3 rounded font-bold text-white flex justify-center items-center gap-2 transition-all shadow-lg hover:shadow-green-500/20"
          >
            {loading ? <Loader className="animate-spin h-4 w-4"/> : 'Confirm & Verify'}
          </button>
          
          <button 
            type="button" 
            onClick={() => setStep(1)}
            className="w-full text-xs text-gray-500 hover:text-white mt-2 underline"
          >
            Change Email
          </button>
        </form>
      )}
    </div>
  );
};

export default StudentVerification;