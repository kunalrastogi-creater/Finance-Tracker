import api from './api';

// Get the high-level overview (total income, expense, balance)
export const getOverview = async () => {
  const response = await api.get('/analytics/overview');
  return response.data;
};

// Get expense breakdown by category (for pie chart)
export const getCategoryBreakdown = async () => {
  const response = await api.get('/analytics/category');
  return response.data;
};

// Get monthly income vs expense trends (for bar chart)
export const getTrends = async () => {
  const response = await api.get('/analytics/trends');
  return response.data;
};
