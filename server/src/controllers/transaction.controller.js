const prisma = require('../config/db');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private (ADMIN, USER)
const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;

    if (!amount || !type || !category) {
      return res.status(400).json({ error: 'Amount, type, and category are required' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.userId,
        amount: parseFloat(amount),
        type, // 'INCOME' or 'EXPENSE'
        category,
        description,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json({ message: 'Transaction created successfully', transaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Get all transactions (Filters by user unless ADMIN)
// @route   GET /api/transactions
// @access  Private (ALL ROLES)
const getTransactions = async (req, res) => {
  try {
    const { role, userId } = req.user;
    
    // Pagination defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Non-admin users only see their own transactions
    if (role !== 'ADMIN') {
      query.where = { userId };
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        ...query,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.transaction.count({ where: query.where })
    ]);

    res.status(200).json({
      transactions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private (ALL ROLES)
const getTransactionById = async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const { role, userId } = req.user;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check ownership if not admin
    if (role !== 'ADMIN' && transaction.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this transaction' });
    }

    res.status(200).json({ transaction });
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private (ADMIN, USER)
const updateTransaction = async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const { role, userId } = req.user;
    const { amount, type, category, description, date } = req.body;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check ownership if not admin
    if (role !== 'ADMIN' && transaction.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this transaction' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        type,
        category,
        description,
        date: date ? new Date(date) : undefined,
      },
    });

    res.status(200).json({ message: 'Transaction updated successfully', transaction: updatedTransaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private (ADMIN, USER)
const deleteTransaction = async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const { role, userId } = req.user;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check ownership if not admin
    if (role !== 'ADMIN' && transaction.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this transaction' });
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};
