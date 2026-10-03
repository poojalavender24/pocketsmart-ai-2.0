import { useState } from 'react'; import { api } from '../api';
const FIELDS = {
  login: [['email', 'Email', 'email'], ['password', 'Password', 'password']],
  register: [['name', 'Full name', 'text'], ['email', 'Gmail address', 'email'], ['password', 'Password (6+ characters)', 'password']],
  forgot: [['email', 'Registered email', 'email']],
  reset: [['otp', 'Email OTP', 'text'], ['password', 'New password', 'password']],
};
const TITLE = { login: 'Log in', register: 'Create account', forgot: 'Forgot password', reset: 'Reset password' };
export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'), [f, setF] = useState({}), [msg, setMsg] = useState(''), [err, setErr] = useState('');
  const go = (m, note = '') => { setMode(m); setErr(''); setMsg(note); };
  const done = d => { localStorage.setItem('token', d.token); onLogin(d.user); };
  const submit = async e => {
    e.preventDefault(); setErr('');
    try {
      if (mode === 'login') done(await api('/auth/login', 'POST', f));
      else if (mode === 'register') done(await api('/auth/register', 'POST', f));
      else if (mode === 'forgot') { await api('/auth/forgot', 'POST', f); go('reset', 'If that email is registered, a code was sent.'); }
      else { await api('/auth/reset', 'POST', f); go('login', 'Password updated. Log in with your new password.'); }
    } catch (x) { setErr(x.message); }
  };
  return (<>
    <div className="hero"><h1>💜 PocketSmart AI</h1><p>Your simple personal money assistant</p></div>
    <form className="card" onSubmit={submit}>
      <h2>{TITLE[mode]}</h2>
      {msg && <div className="note ok">{msg}</div>}{err && <div className="note bad">{err}</div>}
      {FIELDS[mode].map(([k, label, type]) => <label key={k}>{label}<input type={type} value={f[k] || ''} onChange={e => setF({ ...f, [k]: e.target.value })} required /></label>)}
      <button className="btn">{TITLE[mode]}</button>
      <div className="links">
        {mode === 'login' && <><a onClick={() => go('register')}>New here? Register</a><a onClick={() => go('forgot')}>Forgot password?</a></>}
        {mode !== 'login' && <a onClick={() => go('login')}>Back to log in</a>}
      </div>
    </form></>);
}
