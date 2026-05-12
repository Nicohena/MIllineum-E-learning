import api from './api';

const getFAQs = async () => {
  const res = await api.get('/help/faqs');
  return res.data.faqs || [];
};

const submitQuery = async (payload) => {
  const res = await api.post('/help/submit', payload);
  return res.data;
};

const getQueries = async (params = {}) => {
  const res = await api.get('/help/queries', { params });
  return res.data.queries || [];
};

export default {
  getFAQs,
  submitQuery,
  getQueries,
};
