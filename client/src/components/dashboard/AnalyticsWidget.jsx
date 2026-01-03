import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data (In production, backend would send 7-day history array)
const data = [
  { name: 'Mon', views: 2 },
  { name: 'Tue', views: 5 },
  { name: 'Wed', views: 3 },
  { name: 'Thu', views: 8 },
  { name: 'Fri', views: 12 },
  { name: 'Sat', views: 9 },
  { name: 'Sun', views: 15 },
];

const AnalyticsWidget = ({ totalViews }) => {
  return (
    <div className="bg-card border border-white/5 p-6 rounded-xl h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="font-bold text-gray-200">Profile Traffic</h3>
            <p className="text-xs text-gray-400">Last 7 Days Activity</p>
        </div>
        <div className="text-right">
            <p className="text-2xl font-bold text-white">{totalViews}</p>
            <span className="text-xs text-green-400">+12% vs last week</span>
        </div>
      </div>

      <div className="flex-1 min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#3B82F6' }}
            />
            <Area type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsWidget;