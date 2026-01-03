import api from './api';

export const getMySubscription = async () => {
  const { data } = await api.get('/subscription/my');
  return data;
};

export const upgradePlan = async (planName) => {
  const { data } = await api.post('/subscription/upgrade', { plan: planName });
  return data;
};