import { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf'; import autoTable from 'jspdf-autotable'; import { api } from '../api';
const COLORS = ['#7c5cf0', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#8b5cf6', '#f97316', '#64748b', '#84cc16'];
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
const fmt = d => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export default function Dashboard({ user, setUser, onLogout }) {
  const [list, setList] = useState([]), [cats, setCats] = useState({ expense: [], income: [] }), [toast, setToast] = useState('');
  const [f, setF] = useState({ type: 'expense', category: 'Food', amount: '', note: '', date: nowLocal() }), [limit, setLimit] = useState(user.threshold);
  const load = () => api('/transactions').then(setList);
  useEffect(() => { load(); api('/categories').then(setCats); }, []);
  const income = list.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expense = list.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const pie = useMemo(() => { const m = {}; list.filter(t => t.type === 'expense').forEach(t => m[t.category] = (m[t.category] || 0) + t.amount); return Object.entries(m).map(([name, value]) => ({ name, value })); }, [list]);
  const setType = type => setF({ ...f, type, category: cats[type][0] });
  const add = async e => {
    e.preventDefault();
    try {
      const d = await api('/transactions', 'POST', { ...f, date: new Date(f.date).toISOString() });
      setToast(d.alert ? `⚠️ This payment is above your ${inr(user.threshold)} limit. Alert sent.` : 'Transaction saved. Email sent.');
      setF({ ...f, amount: '', note: '', date: nowLocal() }); load();
    } catch (x) { setToast(x.message); }
  };
  const del = async id => { await api('/transactions/' + id, 'DELETE'); load(); };
  const saveLimit = async () => { setUser(await api('/auth/settings', 'PATCH', { threshold: limit })); setToast('Alert limit updated.'); };
  const pdf = () => {
    const d = new jsPDF(); d.setFontSize(16); d.text('PocketSmart AI - Transactions', 14, 16); d.setFontSize(10);
    d.text(`${user.name} | Income Rs.${income} | Expenses Rs.${expense} | Balance Rs.${income - expense}`, 14, 23);
    autoTable(d, { startY: 28, head: [['Date & time', 'Type', 'Category', 'Note', 'Amount (Rs.)']], headStyles: { fillColor: [124, 92, 240] },
      body: list.map(t => [fmt(t.date), t.type, t.category, t.note || '', t.amount]) });
    d.save('pocketsmart-transactions.pdf');
  };
  return (<>
    <div className="hero row"><div><h1>💜 PocketSmart AI</h1><p>Hi {user.name}, here is your money today</p></div><button className="ghost" onClick={onLogout}>Log out</button></div>
    {toast && <div className="note ok" onClick={() => setToast('')}>{toast}</div>}
    <div className="card"><span className="muted">Total Balance</span><div className="big">{inr(income - expense)}</div>
      <div className="two"><div className="tile"><span className="muted">Income</span><b className="g">{inr(income)}</b></div><div className="tile"><span className="muted">Expenses</span><b className="r">{inr(expense)}</b></div></div></div>
    <form className="card" onSubmit={add}><h2>➕ Add Transaction</h2>
      <label>Type<select value={f.type} onChange={e => setType(e.target.value)}><option value="expense">Expense</option><option value="income">Income</option></select></label>
      <label>Category<select value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{cats[f.type].map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Amount<input type="number" min="1" step="0.01" placeholder="Enter amount" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} required /></label>
      <label>Note<input placeholder="Eg: Lunch, salary, bus ticket" value={f.note} onChange={e => setF({ ...f, note: e.target.value })} /></label>
      <label>Payment date & time<input type="datetime-local" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} required /></label>
      <button className="btn">Add transaction</button></form>
    <div className="card"><h2>📊 Spending by category</h2>
      {pie.length ? <div style={{ height: 280 }}><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" nameKey="name" outerRadius={90} label={e => e.name}>{pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={inr} /><Legend /></PieChart></ResponsiveContainer></div>
        : <p className="muted">Add an expense to see your chart.</p>}</div>
    <div className="card"><h2>🔔 Alert limit</h2><p className="muted">Get an email alert when a single expense is above this amount.</p>
      <div className="row"><input type="number" value={limit} onChange={e => setLimit(e.target.value)} /><button className="btn small" onClick={saveLimit}>Save</button></div></div>
    <div className="card"><div className="row"><h2>🧾 Transactions</h2><button className="btn small" onClick={pdf} disabled={!list.length}>Export PDF</button></div>
      {!list.length && <p className="muted">No transactions yet. Add your first one above.</p>}
      {list.map(t => <div className="tx" key={t._id}><div><b>{t.category}</b><div className="muted">{t.note && t.note + ' · '}{fmt(t.date)}</div></div>
        <div className="row"><b className={t.type === 'income' ? 'g' : 'r'}>{t.type === 'income' ? '+' : '-'}{inr(t.amount)}</b><a onClick={() => del(t._id)} title="Delete">✕</a></div></div>)}</div></>);
}
