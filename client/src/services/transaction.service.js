import api from './api';

// Get all transactions (paginated)
export const getTransactions = async (page = 1, limit = 10) => {
  const response = await api.get(`/transactions?page=${page}&limit=${limit}`);
  return response.data;
};

// Create a new transaction
export const createTransaction = async (transactionData) => {
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

// Delete a transaction by ID
export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

// Update an existing transaction by ID
export const updateTransaction = async (id, transactionData) => {
  const response = await api.put(`/transactions/${id}`, transactionData);
  return response.data;
};
