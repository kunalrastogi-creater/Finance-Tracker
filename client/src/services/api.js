import axios from 'axios';

// This is our main Axios instance.
// All API calls in the app will use this instead of plain fetch().
// The baseURL points to our Express backend.
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// This is called an "interceptor".
// It runs automatically before EVERY request we make.
// It checks if there is a token saved in localStorage,
// and if so, attaches it to the request headers.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
