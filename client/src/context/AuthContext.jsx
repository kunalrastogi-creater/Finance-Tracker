import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser as loginApi, logoutUser as logoutApi } from '../services/auth.service';

// Step 1: Create the context object
// This is like a "global store" that any component can read from
const AuthContext = createContext(null);

// Step 2: Create the Provider component
// This wraps around our entire app and provides the auth state
export const AuthProvider = ({ children }) => {
  // user = the logged-in user's info (null if not logged in)
  const [user, setUser] = useState(null);
  // token = the JWT token saved in localStorage
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // When the app loads, check if a token exists in localStorage
  // and try to restore the user session
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // This function is called when the user logs in
  const login = async (email, password) => {
    const data = await loginApi(email, password);
    // Save token and user in localStorage so they persist on page refresh
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // This function is called when the user logs out
  const logout = async () => {
    try {
      await logoutApi(); // tell the backend (optional, it's stateless)
    } catch (error) {
      // Ignore error, still clear local state
    }
    // Clear everything from localStorage and state
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // The value object is what every component can access
  const value = { user, token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Step 3: Create a custom hook for easy access
// Instead of importing useContext everywhere, just call useAuth()
export const useAuth = () => {
  return useContext(AuthContext);
};
