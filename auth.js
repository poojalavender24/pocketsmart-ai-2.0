const r = require('express').Router(), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken'), crypto = require('crypto');
const User = require('../models/User'), { email } = require('../services/notify'), auth = require('../middleware/auth');

const h = s => crypto.createHash('sha256').update(String(s)).digest('hex');
const code = () => String(crypto.randomInt(100000, 1000000));
const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
const pub = u => ({ id: u._id, name: u.name, email: u.email, threshold: u.threshold });
const valid = (u, k, c) => u.otp?.[k] && u.otp[k].exp > Date.now() && u.otp[k].h === h(c);

async function sendOtp(u, reset) {
  const e = code(), exp = Date.now() + 10 * 60000;
  u.otp = { email: { h: h(e), exp } };
  u.markModified('otp'); await u.save();
  await email(u.email, reset ? 'PocketSmart password reset code' : 'PocketSmart verification code', `Your code is ${e}. It expires in 10 minutes.`);
}
const wrap = f => (q, s) => f(q, s).catch(e => s.status(500).json({ error: e.code === 11000 ? 'Email already registered' : e.message }));

r.post('/register', wrap(async (q, s) => {
  const { name, email: em, password } = q.body;
  if (!name || !/^[^@\s]+@gmail\.com$/i.test(em || '') || (password || '').length < 6)
    return s.status(400).json({ error: 'Enter your name, a Gmail address (@gmail.com), and a password of 6+ characters' });
  const u = await User.create({ name, email: em, password: await bcrypt.hash(password, 10), emailVerified: true });
  s.json({ token: sign(u), user: pub(u) });
}));
r.post('/login', wrap(async (q, s) => {
  const u = await User.findOne({ email: (q.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(q.body.password || '', u.password))) return s.status(401).json({ error: 'Wrong email or password' });
  s.json({ token: sign(u), user: pub(u) });
}));
r.post('/forgot', wrap(async (q, s) => {
  const u = await User.findOne({ email: (q.body.email || '').toLowerCase() });
  if (u) await sendOtp(u, true);
  s.json({ ok: true }); // same reply either way so accounts can't be probed
}));
r.post('/reset', wrap(async (q, s) => {
  const u = await User.findOne({ email: (q.body.email || '').toLowerCase() });
  if (!u || !valid(u, 'email', q.body.otp) || (q.body.password || '').length < 6) return s.status(400).json({ error: 'Invalid OTP or password too short' });
  u.password = await bcrypt.hash(q.body.password, 10); u.otp = null; await u.save(); s.json({ ok: true });
}));
r.get('/me', auth, wrap(async (q, s) => s.json(pub(await User.findById(q.uid)))));
r.patch('/settings', auth, wrap(async (q, s) => {
  const u = await User.findByIdAndUpdate(q.uid, { threshold: Math.max(0, Number(q.body.threshold) || 0) }, { new: true });
  s.json(pub(u));
}));
module.exports = r;
