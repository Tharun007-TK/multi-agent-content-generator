import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const contentApi = {
  generate: (context) => api.post('/content/generate', { context }),
};

export const exportApi = {
  toLinkedIn: (payload) => api.post('/export/linkedin', payload),
  toEmail: (payload) => api.post('/export/email', payload),
  toCall: (payload) => api.post('/export/call', payload),
};

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  pipelines: (limit = 50) => api.get('/dashboard/pipelines', { params: { limit } }),
  activity: (channel, limit = 100) => api.get('/dashboard/activity', { params: { channel, limit } }),
  getCallQueue: () => api.get('/dashboard/call-queue'),
  updateCallStatus: (id, status) => api.patch(`/dashboard/call-queue/${id}`, null, { params: { status } }),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (payload) => api.patch('/settings', payload),
};

export default api;
