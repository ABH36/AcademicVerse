import React, { useState } from 'react';
import { Share2, Check, Copy, Linkedin, Twitter } from 'lucide-react';
import { toast } from 'react-toastify';

const ShareProfile = ({ username, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const url = `${window.location.origin}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link Copied to Clipboard!');
    setIsOpen(false);
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-gray-800 border border-gray-700 p-2 rounded-xl shadow-2xl flex flex-col gap-2 w-48 animate-fade-in-up">
            <button onClick={copyToClipboard} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors text-left w-full">
                <Copy size={16} /> Copy Link
            </button>
            <button onClick={shareToLinkedIn} className="flex items-center gap-3 px-4 py-2 hover:bg-blue-900/30 rounded-lg text-sm text-blue-400 transition-colors text-left w-full">
                <Linkedin size={16} /> LinkedIn
            </button>
            <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out my portfolio!&url=${url}`, '_blank')} className="flex items-center gap-3 px-4 py-2 hover:bg-sky-900/30 rounded-lg text-sm text-sky-400 transition-colors text-left w-full">
                <Twitter size={16} /> Twitter
            </button>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary hover:bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-110 active:scale-95"
      >
        {isOpen ? <Check size={24} /> : <Share2 size={24} />}
      </button>
    </div>
  );
};

export default ShareProfile;