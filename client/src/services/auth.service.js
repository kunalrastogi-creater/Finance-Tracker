import api from './api';

// --- AUTH SERVICE ---
// These functions talk to our backend /api/auth routes.
// Each function returns the response data from the server.

// Call POST /api/auth/register
export const registerUser = async (name, email, password, role = 'USER') => {
  const response = await api.post('/auth/register', { name, email, password, role });
  return response.data;
};

// Call POST /api/auth/login
export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

// Call POST /api/auth/logout
export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};
