import React, { useState } from 'react';
import { reportUser } from '../../services/verificationService';
import { AlertTriangle, X, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

const ReportModal = ({ targetUserId, onClose }) => {
  const [reason, setReason] = useState('Spam');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reportUser({ reportedUserId: targetUserId, reason, description: desc });
      toast.info('Report submitted. We will investigate.');
      onClose();
    } catch (error) {
      toast.error('Failed to report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-red-500/30 w-full max-w-md rounded-xl p-6 relative shadow-2xl shadow-red-900/20">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X size={20}/>
        </button>
        
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" /> Report Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-xs text-gray-400 uppercase font-bold">Reason</label>
                <select 
                    className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white mt-1 focus:border-red-500 outline-none"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                >
                    <option>Spam</option>
                    <option>Fake Profile</option>
                    <option>Scam</option>
                    <option>Harassment</option>
                    <option>Other</option>
                </select>
            </div>
            <div>
                <label className="text-xs text-gray-400 uppercase font-bold">Description</label>
                <textarea 
                    className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white mt-1 h-24 resize-none focus:border-red-500 outline-none"
                    placeholder="Please provide details about why you are reporting this user..."
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    required
                />
            </div>
            <button 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
                {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Submit Report'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;