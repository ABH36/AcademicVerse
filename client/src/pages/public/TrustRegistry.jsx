import React, { useState } from 'react';
import { searchTrustRegistry } from '../../services/verificationService';
import TrustBadge from '../../components/TrustBadge';
import { Search, Loader, CheckCircle } from 'lucide-react';

const TrustRegistry = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const data = await searchTrustRegistry(query);
      setResult(data);
    } catch (err) {
      setError('Entity not found in AcademicVerse Registry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20 flex flex-col items-center">
      <div className="w-full max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Trust Registry
        </h1>
        <p className="text-gray-400">Verify any Student, Recruiter, or Certificate ID instantly.</p>

        <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-4 top-4 text-gray-500" />
            <input 
                type="text" 
                placeholder="Enter User ID, Username or Certificate ID..." 
                className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-lg focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-600"
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 px-6 rounded-xl font-bold transition-all">
                {loading ? <Loader className="animate-spin" /> : "Verify"}
            </button>
        </form>

        {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300">
                {error}
            </div>
        )}

        {result && (
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-left animate-fade-in-up shadow-2xl shadow-blue-500/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-800 overflow-hidden border-2 border-gray-600">
                             {result.user.avatar ? (
                                <img src={result.user.avatar} className="w-full h-full object-cover"/>
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                                    {result.user.name[0]}
                                </div>
                             )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {result.user.name}
                                {result.status === 'VERIFIED' && <CheckCircle size={18} className="text-blue-400" />}
                            </h2>
                            <p className="text-gray-500">@{result.user.username}</p>
                            <p className="text-xs text-gray-600 uppercase mt-1">{result.user.role}</p>
                        </div>
                    </div>
                    
                    <TrustBadge scoreOverride={result.trustScore} />
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-500 flex justify-between">
                    <span>Member since {new Date(result.joinedAt).getFullYear()}</span>
                    <span>Registry ID: {result.user._id}</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TrustRegistry;