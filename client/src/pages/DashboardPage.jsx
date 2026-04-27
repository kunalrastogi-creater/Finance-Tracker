import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Wallet, PlusCircle } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import TransactionList from '../components/TransactionList';
import AddTransactionModal from '../components/AddTransactionModal';

import { getOverview, getCategoryBreakdown, getTrends } from '../services/analytics.service';
import { getTransactions, createTransaction, deleteTransaction } from '../services/transaction.service';

// Register Chart.js components (required by react-chartjs-2)
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Formats numbers to currency
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

function DashboardPage() {
  const { user } = useAuth();

  // State: analytics overview numbers
  const [overview, setOverview] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  // State: category data for the Doughnut chart
  const [categoryData, setCategoryData] = useState({});
  // State: monthly trends for the Bar chart
  const [trendsData, setTrendsData] = useState({});
  // State: list of transactions
  const [transactions, setTransactions] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Check if user can add transactions (not READ_ONLY)
  const canAdd = user?.role !== 'READ_ONLY';

  // --- Fetch all data from the backend ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel for speed
      const [overviewRes, categoryRes, trendsRes, transactionsRes] = await Promise.all([
        getOverview(),
        getCategoryBreakdown(),
        getTrends(),
        getTransactions(),
      ]);
      setOverview(overviewRes);
      setCategoryData(categoryRes.categoryTotals || {});
      setTrendsData(trendsRes.trends || {});
      setTransactions(transactionsRes.transactions || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run fetchData when the component first loads
  useEffect(() => {
    fetchData();
  }, []);

  // --- Handle adding a new transaction ---
  const handleAddTransaction = async (data) => {
    await createTransaction(data);
    fetchData(); // Re-fetch all data to refresh the dashboard
  };

  // --- Handle deleting a transaction ---
  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
      fetchData(); // Re-fetch all data to refresh the dashboard
    }
  };

  // --- Build Doughnut chart data from the API response ---
  const doughnutChartData = {
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
      ],
      borderWidth: 0,
    }],
  };

  // --- Build Bar chart data from the API response ---
  const trendLabels = Object.keys(trendsData);
  const barChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Income',
        data: trendLabels.map((m) => trendsData[m]?.income || 0),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Expense',
        data: trendLabels.map((m) => trendsData[m]?.expense || 0),
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || user?.email}!</p>
        </div>
        {/* Only show Add button to ADMIN and USER roles */}
        {canAdd && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        )}
      </div>

      {/* Stats Row - 3 summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Income"
          value={formatCurrency(overview.totalIncome)}
          icon={TrendingUp}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(overview.totalExpense)}
          icon={TrendingDown}
          color="bg-red-100 text-red-600"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(overview.netBalance)}
          icon={Wallet}
          color={overview.netBalance >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Doughnut Chart: Expense by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Expenses by Category</h2>
          {Object.keys(categoryData).length > 0 ? (
            <div className="flex justify-center">
              <div style={{ maxWidth: '280px', width: '100%' }}>
                <Doughnut data={doughnutChartData} />
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No expense data yet.</p>
          )}
        </div>

        {/* Bar Chart: Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Income vs Expense</h2>
          {trendLabels.length > 0 ? (
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          ) : (
            <p className="text-gray-400 text-center py-8">No trend data yet.</p>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Transactions</h2>
        <TransactionList
          transactions={transactions}
          onDelete={handleDeleteTransaction}
        />
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddTransaction}
        />
      )}
    </div>
  );
}

export default DashboardPage;
