import { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const ok = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password, username);
    setLoading(false);
    if (ok) onClose();
  }

  const inputStyle = {
    width: '100%',
    border: '2px solid #E0E0DE',
    borderRadius: 8,
    background: '#F8F8F6',
    padding: '0.65rem 0.9rem',
    fontFamily: 'Barlow, sans-serif',
    fontSize: '0.9rem',
    color: '#0F0F0F',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(13,31,13,0.75)',
        backdropFilter: 'blur(8px)',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease both',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff', borderRadius: 'var(--radius-xl)',
          border: '2px solid var(--ink)', width: '100%', maxWidth: 420,
          overflow: 'hidden',
          animation: 'fadeUp 0.3s cubic-bezier(0.4,0,0.2,1) both',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div style={{ background: '#0D1F0D', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="heading-display" style={{ fontSize: '2rem', color: '#fff' }}>
            {mode === 'signin' ? 'Sign In' : 'Join Up'}
          </span>
          <button
            onClick={onClose}
            style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '0.25rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'signup' && (
            <div>
              <label className="label-caps" style={{ color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>Username</label>
              <input
                type="text" required value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="YourGameName"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--lime-dark)'}
                onBlur={e => e.target.style.borderColor = '#E0E0DE'}
              />
            </div>
          )}
          <div>
            <label className="label-caps" style={{ color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--lime-dark)'}
              onBlur={e => e.target.style.borderColor = '#E0E0DE'}
            />
          </div>
          <div>
            <label className="label-caps" style={{ color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>Password</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--lime-dark)'}
              onBlur={e => e.target.style.borderColor = '#E0E0DE'}
            />
          </div>

          {mode === 'signup' && (
            <p style={{ fontFamily: 'Barlow', fontSize: '0.8rem', color: 'var(--ink-soft)', lineHeight: 1.5, background: '#F8F8F6', borderRadius: 6, padding: '0.65rem 0.85rem' }}>
              After signing up, verify your email before signing in.
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.25rem', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <div style={{ borderTop: '1px solid var(--surface-2)', paddingTop: '0.75rem', textAlign: 'center' }}>
            <span style={{ fontFamily: 'Barlow', fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              style={{ fontFamily: 'Barlow', fontSize: '0.9rem', fontWeight: 700, color: 'var(--pitch)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
