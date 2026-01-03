import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // <--- Import from Context
import { Shield, Smartphone, Monitor, Globe } from 'lucide-react';
import { format } from 'date-fns';

const LoginHistoryWidget = () => {
  // FIX: Destructure getLoginHistory from useAuth
  const { getLoginHistory } = useAuth(); 
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
         // FIX: Call function directly from Context
         const data = await getLoginHistory();
         setLogs(data);
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [getLoginHistory]); // Dependency added

  const getDeviceIcon = (device) => {
    if (device === 'Mobile' || device === 'Tablet') return <Smartphone size={16} className="text-blue-400" />;
    return <Monitor size={16} className="text-gray-400" />;
  };

  if (loading) return <div className="text-xs text-gray-500 animate-pulse">Loading security logs...</div>;

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="text-green-400" size={18} />
        <h3 className="text-sm font-bold text-white">Recent Security Activity</h3>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <p className="text-xs text-gray-500">No logs found.</p>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="flex items-center justify-between text-xs p-2 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-md">
                   {getDeviceIcon(log.device)}
                </div>
                <div>
                  <p className="text-gray-200 font-medium">
                    {log.os} • {log.browser}
                  </p>
                  <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                    <Globe size={10} />
                    <span>{log.city}, {log.country}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.loginStatus === 'Success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {log.loginStatus}
                </span>
                <p className="text-gray-500 mt-1">
                  {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LoginHistoryWidget;