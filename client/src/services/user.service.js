import api from './api';

// Get the currently logged-in user's profile
export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Get all users - Admin only
export const getAllUsers = async (page = 1, limit = 10) => {
  const response = await api.get(`/users?page=${page}&limit=${limit}`);
  return response.data;
};

// Update a user's role - Admin only
export const updateUserRole = async (userId, role) => {
  const response = await api.put(`/users/${userId}/role`, { role });
  return response.data;
};
