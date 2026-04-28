const prisma = require('../config/db');

// @desc    Get high-level overview (total income, expenses, balance)
// @route   GET /api/analytics/overview
// @access  Private (All roles)
const getOverview = async (req, res) => {
  try {
    const { userId, role } = req.user;
    
    // For admin, if they provide a targetUserId in query, use that.
    // Otherwise, standard users only see their own.
    const targetUserId = (role === 'ADMIN' && req.query.userId) 
      ? parseInt(req.query.userId) 
      : userId;

    const transactions = await prisma.transaction.findMany({
      where: { userId: targetUserId }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'INCOME') totalIncome += t.amount;
      if (t.type === 'EXPENSE') totalExpense += t.amount;
    });

    res.status(200).json({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Get expenses broken down by category (for pie chart)
// @route   GET /api/analytics/category
// @access  Private (All roles)
const getCategoryBreakdown = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const targetUserId = (role === 'ADMIN' && req.query.userId) 
      ? parseInt(req.query.userId) 
      : userId;

    // We only group EXPENSE type for the typical pie chart breakdown
    const expenses = await prisma.transaction.findMany({
      where: { 
        userId: targetUserId,
        type: 'EXPENSE'
      }
    });

    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    res.status(200).json({ categoryTotals });
  } catch (error) {
    console.error('Category breakdown error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Get monthly trends for income and expenses (for line/bar charts)
// @route   GET /api/analytics/trends
// @access  Private (All roles)
const getTrends = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const targetUserId = (role === 'ADMIN' && req.query.userId) 
      ? parseInt(req.query.userId) 
      : userId;

    const transactions = await prisma.transaction.findMany({
      where: { userId: targetUserId },
      orderBy: { date: 'asc' }
    });

    // Group by month-year (e.g., '2023-10')
    const trends = transactions.reduce((acc, curr) => {
      const date = new Date(curr.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!acc[monthYear]) {
        acc[monthYear] = { income: 0, expense: 0 };
      }

      if (curr.type === 'INCOME') {
        acc[monthYear].income += curr.amount;
      } else {
        acc[monthYear].expense += curr.amount;
      }

      return acc;
    }, {});

    res.status(200).json({ trends });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getOverview,
  getCategoryBreakdown,
  getTrends
};
