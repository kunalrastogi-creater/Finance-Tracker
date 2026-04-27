import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Education', 'Bills', 'Salary', 'Freelance', 'Other'
];

// Props:
//   transaction - the existing transaction object to pre-fill the form
//   onClose     - function to close the modal
//   onSubmit    - function to call with the updated data
function EditTransactionModal({ transaction, onClose, onSubmit }) {
  // Pre-fill the form with the existing transaction's values
  const [amount, setAmount] = useState(transaction.amount);
  const [type, setType] = useState(transaction.type);
  const [category, setCategory] = useState(transaction.category);
  const [description, setDescription] = useState(transaction.description || '');
  const [date, setDate] = useState(transaction.date.split('T')[0]); // format: YYYY-MM-DD

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(transaction.id, { amount, type, category, description, date });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button type="button" onClick={() => setType('INCOME')}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${type === 'INCOME' ? 'bg-green-500 text-white' : 'bg-white text-gray-500'}`}>
                Income
              </button>
              <button type="button" onClick={() => setType('EXPENSE')}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${type === 'EXPENSE' ? 'bg-red-500 text-white' : 'bg-white text-gray-500'}`}>
                Expense
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50">
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditTransactionModal;
