import api from './api'; // Assuming you have a base axios instance

// Existing Student Verification
export const initiateVerification = async (academicEmail) => {
  const response = await api.post('/verify/initiate', { academicEmail });
  return response.data;
};

export const confirmVerification = async (otp) => {
  const response = await api.post('/verify/confirm', { otp });
  return response.data;
};

// --- PHASE-20 NEW CALLS ---

// 1. Recruiter KYC
export const submitRecruiterKYC = async (formData) => {
  // Note: FormData object is passed directly for file upload
  const response = await api.post('/verify/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// 2. Report User (Fraud Engine)
export const reportUser = async (data) => {
  const response = await api.post('/verify/report', data);
  return response.data;
};

// 3. Public Registry Search
export const searchTrustRegistry = async (query) => {
  const response = await api.get(`/verify/registry?q=${query}`);
  return response.data;
};