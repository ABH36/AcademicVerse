import api from './api';

// --- PUBLIC/STUDENT ROUTES ---

export const getJobs = async () => {
  const { data } = await api.get('/jobs');
  return data;
};

export const getMyApplications = async () => {
  const { data } = await api.get('/jobs/applications/my');
  return data;
};

export const applyForJob = async (jobId) => {
  const { data } = await api.post(`/jobs/${jobId}/apply`);
  return data;
};

// --- RECRUITER ROUTES ---

export const createJob = async (jobData) => {
  const { data } = await api.post('/jobs', jobData);
  return data;
};

// NEW: Fetch jobs posted by the logged-in recruiter
export const getMyPostedJobs = async () => {
  const { data } = await api.get('/jobs/my-jobs');
  return data;
};

// NEW: Fetch applications for a specific job
export const getJobApplications = async (jobId) => {
  const { data } = await api.get(`/jobs/${jobId}/applications`);
  return data;
};

// Update Status (Recruiter) - Updated to accept interview details
export const updateAppStatus = async (appId, status, interviewDetails = null) => {
  const { data } = await api.patch(`/jobs/application/${appId}/status`, { status, interview: interviewDetails });
  return data;
};

// Student Responds to Offer
export const respondToOffer = async (appId, response) => {
  const { data } = await api.patch(`/jobs/application/${appId}/respond`, { response });
  return data;
};
export const reportJob = async (jobId, reportData) => {
  const { data } = await api.post(`/jobs/${jobId}/report`, reportData);
  return data;
};