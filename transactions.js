const r = require('express').Router(), T = require('../models/Transaction'), User = require('../models/User');
const auth = require('../middleware/auth'), { email } = require('../services/notify');
r.use(auth);

r.get('/', async (q, s) => s.json(await T.find({ user: q.uid }).sort({ date: -1 })));
r.post('/', async (q, s) => {
  try {
    const { type, category, amount, note, date } = q.body, a = Number(amount);
    if (!['income', 'expense'].includes(type) || !(a > 0)) return s.status(400).json({ error: 'Enter a valid type and amount' });
    const t = await T.create({ user: q.uid, type, category: category || 'Other', amount: a, note, date: date ? new Date(date) : new Date() });
    const u = await User.findById(q.uid), when = t.date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    email(u.email, 'PocketSmart transaction', `Rs.${a} ${type === 'income' ? 'credited' : 'debited'} (${t.category}) on ${when}`);
    const alert = type === 'expense' && a > u.threshold;
    if (alert) {
      const msg = `Alert: Rs.${a} on ${t.category} is above your limit of Rs.${u.threshold}.`;
      email(u.email, 'PocketSmart spending alert', msg);
    }
    s.json({ transaction: t, alert });
  } catch (e) { s.status(500).json({ error: e.message }); }
});
r.delete('/:id', async (q, s) => { await T.deleteOne({ _id: q.params.id, user: q.uid }); s.json({ ok: true }); });
module.exports = r;
