import api from './api';

// --- DASHBOARD STATS ---

// Get Overview Stats (Users, Revenue, Pending Work)
export const getAdminStats = async () => {
    const { data } = await api.get('/admin/stats');
    return data;
};

// --- USER MANAGEMENT ---

// Get All Users (Paginated)
export const getUsers = async (pageNumber = 1) => {
    const { data } = await api.get(`/admin/users?pageNumber=${pageNumber}`);
    return data; // Returns { users, page, pages }
};

// Legacy: Simple Freeze Toggle
export const toggleUserFreeze = async (userId) => {
    const { data } = await api.put(`/admin/user/${userId}/freeze`);
    return data;
};

// Phase-17: Advanced Action (Ban, Unban, Verify Identity, Verify Company)
export const manageUser = async (userId, action) => {
    const { data } = await api.patch(`/admin/users/${userId}/action`, { action });
    return data;
};

// --- CERTIFICATES ---

// Get Pending Certificates
export const getPendingCertificates = async () => {
    const { data } = await api.get('/admin/certificates/pending');
    return data;
};

// Verify or Reject Certificate
export const verifyCertificate = async (certId, status) => {
    // status = 'approved' or 'rejected'
    const { data } = await api.put(`/admin/certificate/${certId}/verify`, { status });
    return data;
};

// --- TRUST & SAFETY CENTER (PHASE-17) ---

// Get All Pending Reports
export const getReports = async () => {
    const { data } = await api.get('/admin/reports');
    return data;
};

// Resolve a Report
export const resolveReport = async (reportId, action) => {
    // action = 'dismiss', 'ban_recruiter', 'remove_job'
    const { data } = await api.patch(`/admin/reports/${reportId}/resolve`, { action });
    return data;
};