import React from 'react';
import { Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Formats a number as Indian Rupees currency
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

// Formats a date string to a readable format like "Apr 24, 2026"
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

// Props:
//   transactions - array of transaction objects
//   onDelete     - function to call when the delete button is clicked
function TransactionList({ transactions, onDelete }) {
  const { user } = useAuth();

  // READ_ONLY users cannot delete transactions
  const canDelete = user?.role !== 'READ_ONLY';

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">No transactions yet.</p>
        <p className="text-sm mt-1">Add your first income or expense above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
        >
          {/* Left: Icon + Details */}
          <div className="flex items-center space-x-3">
            {t.type === 'INCOME' ? (
              <ArrowUpCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
            ) : (
              <ArrowDownCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold text-gray-800">{t.category}</p>
              <p className="text-xs text-gray-400">{t.description || 'No description'} · {formatDate(t.date)}</p>
            </div>
          </div>

          {/* Right: Amount + Delete */}
          <div className="flex items-center space-x-4">
            <span className={`font-bold text-base ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
              {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
            </span>
            {canDelete && (
              <button
                onClick={() => onDelete(t.id)}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Delete transaction"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;
