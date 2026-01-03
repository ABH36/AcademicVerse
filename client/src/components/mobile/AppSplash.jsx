import React, { useEffect, useState } from 'react';

export default function AppSplash({ children }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // 1.2 seconds baad splash screen hat jayegi
    const timer = setTimeout(() => setShow(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (show) return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-[9999] animate-fade-in">
      {/* App Logo Animation */}
      <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30 animate-pulse">
         <span className="text-4xl font-bold text-primary">AV</span>
      </div>
      <h1 className="text-2xl text-white font-bold tracking-wider">AcademicVerse</h1>
      <p className="text-gray-500 text-xs mt-2">AI-Powered Career Platform</p>
    </div>
  );

  return <>{children}</>;
}