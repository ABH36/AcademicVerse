import api from './api';

export const getMyProjects = async () => {
  const { data } = await api.get('/projects/me');
  return data;
};

export const createProject = async (formData) => {
  // Config for multipart (images)
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' }
  };
  const { data } = await api.post('/projects', formData, config);
  return data;
};

export const deleteProject = async (id) => {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
};