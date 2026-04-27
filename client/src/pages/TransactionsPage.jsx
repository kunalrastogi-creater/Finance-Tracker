import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/transaction.service';

// Helper: Format number as currency
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

// Helper: Format date to readable string
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

function TransactionsPage() {
  const { user } = useAuth();
  const canEdit = user?.role !== 'READ_ONLY'; // READ_ONLY users cannot add/edit/delete

  // --- State ---
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); // null = modal closed

  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL | INCOME | EXPENSE

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 8; // show 8 transactions per page

  // --- Fetch transactions from backend ---
  const fetchTransactions = async (currentPage = 1) => {
    try {
      setLoading(true);
      const data = await getTransactions(currentPage, LIMIT);
      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever the page number changes
  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  // --- Handlers ---
  const handleAdd = async (data) => {
    await createTransaction(data);
    fetchTransactions(page); // refresh current page
  };

  const handleEdit = async (id, data) => {
    await updateTransaction(id, data);
    fetchTransactions(page); // refresh current page
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
      fetchTransactions(page); // refresh current page
    }
  };

  // --- Client-side filtering (search + type filter) ---
  // We filter from what the current page returned from the API
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const search = searchText.toLowerCase();
    const matchesSearch =
      t.category.toLowerCase().includes(search) ||
      (t.description || '').toLowerCase().includes(search);
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your income and expenses</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by category or description..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type filter buttons */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          {['ALL', 'INCOME', 'EXPENSE'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No transactions found.</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Type</th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Category</th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Description</th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Date</th>
                <th className="text-right px-6 py-3 text-gray-500 font-semibold">Amount</th>
                {canEdit && <th className="text-right px-6 py-3 text-gray-500 font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  {/* Type icon */}
                  <td className="px-6 py-4">
                    {t.type === 'INCOME' ? (
                      <span className="flex items-center space-x-1 text-green-600 font-medium">
                        <ArrowUpCircle className="h-4 w-4" />
                        <span>Income</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-red-600 font-medium">
                        <ArrowDownCircle className="h-4 w-4" />
                        <span>Expense</span>
                      </span>
                    )}
                  </td>
                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {t.category}
                    </span>
                  </td>
                  {/* Description */}
                  <td className="px-6 py-4 text-gray-500">{t.description || '—'}</td>
                  {/* Date */}
                  <td className="px-6 py-4 text-gray-500">{formatDate(t.date)}</td>
                  {/* Amount */}
                  <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  {/* Actions (edit + delete) */}
                  {canEdit && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingTransaction(t)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          <span className="text-sm text-gray-500">
            Page <span className="font-semibold text-gray-800">{page}</span> of{' '}
            <span className="font-semibold text-gray-800">{totalPages}</span>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal onClose={() => setShowAddModal(false)} onSubmit={handleAdd} />
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
}

export default TransactionsPage;
