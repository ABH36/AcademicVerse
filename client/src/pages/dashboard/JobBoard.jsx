import React, { useEffect, useState } from 'react';
import { getJobs, getMyApplications } from '../../services/jobService'; // Import new service
import JobCard from '../../components/jobs/JobCard';
import { getMyProfile } from '../../services/profileService';
import { Loader, Search } from 'lucide-react';

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]); // Store applications
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, profileData, appsData] = await Promise.all([
            getJobs(),
            getMyProfile(),
            getMyApplications() // Fetch history
        ]);
        setJobs(jobsData);
        setUserProfile(profileData);
        setMyApps(appsData);
      } catch (error) {
        console.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to check if applied
  const getApplicationStatus = (jobId) => {
      const app = myApps.find(a => a.job?._id === jobId || a.job === jobId);
      return app ? app.status : null;
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader className="animate-spin text-primary"/></div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white">Opportunity Deck</h1>
            <p className="text-gray-400 text-sm">Verified jobs for verified talent.</p>
          </div>
          <div className="hidden md:flex items-center bg-gray-800 rounded-lg px-3 py-2 border border-gray-700">
              <Search size={16} className="text-gray-500 mr-2"/>
              <input type="text" placeholder="Search roles..." className="bg-transparent border-none focus:outline-none text-sm text-white w-48"/>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
            jobs.map(job => (
                <JobCard 
                    key={job._id} 
                    job={job} 
                    userProfile={userProfile} 
                    existingStatus={getApplicationStatus(job._id)} // Pass Status
                />
            ))
        ) : (
            <div className="col-span-full text-center py-20 bg-card border border-white/5 rounded-xl">
                <p className="text-gray-500">No active jobs found. Check back later.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;