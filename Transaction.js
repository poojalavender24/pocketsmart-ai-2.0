const m = require('mongoose');
module.exports = m.model('Transaction', new m.Schema({
  user: { type: m.Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, enum: ['income', 'expense'] },
  category: String,
  amount: Number,
  note: String,
  date: { type: Date, default: Date.now },
}, { timestamps: true }));
