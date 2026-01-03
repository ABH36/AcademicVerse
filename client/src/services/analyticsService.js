import api from './api';

export const getRecruiterAnalytics = async () => {
    const { data } = await api.get('/analytics/recruiter');
    return data;
};