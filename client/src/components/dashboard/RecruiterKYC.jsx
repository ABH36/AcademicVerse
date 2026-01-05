import React, { useState, useEffect } from 'react';
import { submitRecruiterKYC, getKYCStatus } from '../../services/verificationService';
import { Upload, FileText, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const RecruiterKYC = () => {
  const [loading, setLoading] = useState(true); // Page loading
  const [submitting, setSubmitting] = useState(false); // Form submitting
  
  // States: 'not_submitted', 'pending', 'approved', 'rejected'
  const [kycStatus, setKycStatus] = useState('not_submitted'); 
  const [adminComment, setAdminComment] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    businessRegNumber: '',
  });
  const [file, setFile] = useState(null);

  // 1. Check Status on Mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await getKYCStatus();
      setKycStatus(data.status);
      if (data.status === 'rejected') {
        setAdminComment(data.adminComments);
      }
    } catch (error) {
      console.error("Failed to fetch KYC status");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please upload a document');
    
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('companyName', formData.companyName);
      data.append('businessRegNumber', formData.businessRegNumber);
      data.append('document', file); 

      await submitRecruiterKYC(data);
      
      // Update UI immediately
      setKycStatus('pending');
      toast.success('KYC Submitted for Review!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader className="animate-spin mx-auto text-blue-500"/></div>;

  // --- VIEW 1: APPROVED ---
  if (kycStatus === 'approved') {
    return (
      <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-xl text-center">
        <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
        <h3 className="text-2xl font-bold text-white">Verified Recruiter</h3>
        <p className="text-gray-300 mt-2">Your company identity has been verified. You now have the Blue Tick badge.</p>
      </div>
    );
  }

  // --- VIEW 2: PENDING ---
  if (kycStatus === 'pending') {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 p-8 rounded-xl text-center">
        <Clock className="mx-auto text-yellow-400 mb-4" size={64} />
        <h3 className="text-2xl font-bold text-white">Verification in Progress</h3>
        <p className="text-gray-300 mt-2">Our admin team is reviewing your documents.</p>
        <p className="text-sm text-gray-400 mt-1">This usually takes 24-48 hours. Please check back later.</p>
      </div>
    );
  }

  // --- VIEW 3: REJECTED (Show Form again but with error) ---
  return (
    <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FileText className="text-blue-400" /> Company Verification (KYC)
      </h3>

      {kycStatus === 'rejected' && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mb-6 flex items-start gap-3">
          <XCircle className="text-red-400 shrink-0" />
          <div>
            <h4 className="text-red-400 font-bold">Verification Failed</h4>
            <p className="text-red-300 text-sm mt-1">Reason: {adminComment || 'Document invalid or unclear.'}</p>
            <p className="text-red-300 text-sm mt-1">Please re-upload valid documents.</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="text-xs text-gray-400 uppercase">Registered Company Name</label>
            <input 
                type="text" 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mt-1"
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                required
            />
        </div>
        <div>
            <label className="text-xs text-gray-400 uppercase">Business Registration / CIN Number</label>
            <input 
                type="text" 
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mt-1"
                value={formData.businessRegNumber}
                onChange={e => setFormData({...formData, businessRegNumber: e.target.value})}
                required
            />
        </div>
        
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-blue-500/50 transition-colors cursor-pointer relative">
            <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => setFile(e.target.files[0])}
                accept=".pdf,.jpg,.png,.jpeg"
            />
            <Upload className="mx-auto text-gray-500 mb-2" />
            <p className="text-sm text-gray-300">{file ? file.name : "Click to upload Registration Proof (PDF/IMG)"}</p>
        </div>

        <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
        >
            {submitting ? <Loader className="animate-spin" /> : "Submit for Verification"}
        </button>
      </form>
    </div>
  );
};

export default RecruiterKYC;