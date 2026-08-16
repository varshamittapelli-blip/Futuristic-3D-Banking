const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const user = await User.findById(req.user.userId);
    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      userId: req.user.userId,
      amount,
      type: 'deposit'
    });
    await transaction.save();

    res.json({ balance: user.balance, message: 'Deposit successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.userId);
    if (amount > user.balance) return res.status(400).json({ message: 'Insufficient balance' });

    user.balance -= amount;
    await user.save();

    const transaction = new Transaction({
      userId: req.user.userId,
      amount,
      type: 'withdraw'
    });
    await transaction.save();

    res.json({ balance: user.balance, message: 'Withdrawal successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId }).sort({ date: -1 });
    const user = await User.findById(req.user.userId).select('balance');
    res.json({ transactions, balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
