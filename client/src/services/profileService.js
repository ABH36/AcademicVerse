import api from './api';

export const getMyProfile = async () => {
  const { data } = await api.get('/profile/me');
  return data;
};

export const updateProfile = async (formData) => {
  // Config for multipart/form-data
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' }
  };
  const { data } = await api.post('/profile', formData, config);
  return data;
};

export const updateTheme = async (settings) => {
  const { data } = await api.put('/profile/theme', settings);
  return data;
};

export const getAcademicRecord = async () => {
  const { data } = await api.get('/academic/me');
  return data;
};

export const addSemester = async (semesterData) => {
  const { data } = await api.post('/academic/semester', semesterData);
  return data;
};

export const addTimelineEvent = async (formData) => {
  // Config for multipart (image proof)
  const config = { headers: { 'Content-Type': 'multipart/form-data' } };
  const { data } = await api.post('/academic/timeline', formData, config);
  return data;
};

// SKILL SERVICES
export const getMySkills = async () => {
  const { data } = await api.get('/skills/me');
  return data;
};

export const updateSkill = async (skillData) => {
  // { type: 'technical', name: 'Python', level: 'Intermediate' }
  const { data } = await api.post('/skills/update', skillData);
  return data;
};

export const deleteSkill = async (type, name) => {
  const { data } = await api.delete(`/skills/${type}/${name}`);
  return data;
};