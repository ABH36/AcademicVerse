import React, { useState } from 'react';
import { submitRecruiterKYC } from '../../services/verificationService';
import { Upload, FileText, CheckCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const RecruiterKYC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    businessRegNumber: '',
  });
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please upload a document');
    
    setLoading(true);
    try {
      const data = new FormData();
      data.append('companyName', formData.companyName);
      data.append('businessRegNumber', formData.businessRegNumber);
      data.append('document', file); // 'document' matches backend multer config

      await submitRecruiterKYC(data);
      setSubmitted(true);
      toast.success('KYC Submitted for Review!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission Failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl text-center">
        <CheckCircle className="mx-auto text-green-400 mb-2" size={48} />
        <h3 className="text-xl font-bold text-white">KYC Submitted</h3>
        <p className="text-gray-400 text-sm mt-1">Our admin team is verifying your documents. This usually takes 24-48 hours.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FileText className="text-blue-400" /> Company Verification (KYC)
      </h3>
      
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
                accept=".pdf,.jpg,.png"
            />
            <Upload className="mx-auto text-gray-500 mb-2" />
            <p className="text-sm text-gray-300">{file ? file.name : "Click to upload Registration Proof (PDF/IMG)"}</p>
        </div>

        <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
        >
            {loading ? <Loader className="animate-spin" /> : "Submit for Verification"}
        </button>
      </form>
    </div>
  );
};

export default RecruiterKYC;