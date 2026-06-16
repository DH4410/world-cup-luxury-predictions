import { useState } from 'react';
import { X, Check, Mail, Trophy, BarChart3, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SIDE_IMAGES = [
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80',
  'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200&q=80',
];

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sideImg] = useState(() => SIDE_IMAGES[Math.floor(Math.random() * SIDE_IMAGES.length)]);

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
    border: '1.5px solid #E0E0DE',
    borderRadius: 8,
    background: '#fff',
    padding: '0.75rem 0.9rem',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#14201A',
    outline: 'none',
    transition: 'border-color 0.18s, box-shadow 0.18s',
  };

  const benefits = [
    { icon: BarChart3, title: 'See your live results',     desc: 'Track points the moment a match ends.' },
    { icon: Mail,      title: 'Email match updates',       desc: 'Kickoff reminders & result summaries.' },
    { icon: Trophy,    title: 'Win exclusive prizes',      desc: 'Top the leaderboard, claim rewards.' },
    { icon: Sparkles,  title: 'Create private rooms',      desc: 'Play against friends in your own league.' },
  ];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(13,31,13,0.78)',
        backdropFilter: 'blur(10px)',
        padding: '1rem',
        animation: 'fadeIn 0.22s ease both',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff', borderRadius: 16,
          width: '100%', maxWidth: 920,
          overflow: 'hidden',
          animation: 'fadeUp 0.36s cubic-bezier(0.4,0,0.2,1) both',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          minHeight: 560,
        }}
      >
        {/* Left: marketing pane with football imagery */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          color: '#fff',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '2rem 1.75rem',
          minHeight: 560,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${sideImg})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            transform: 'scale(1.05)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(155deg, rgba(20,32,26,0.92) 0%, rgba(79,110,27,0.85) 100%)',
          }} />

          {/* Content */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.35rem 0.75rem', background: 'rgba(245,248,236,0.15)', borderRadius: 999, fontFamily: 'Inter', fontWeight: 700, fontSize: '0.66rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--turf, #9BCA35)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--turf, #9BCA35)', boxShadow: '0 0 0 4px rgba(155,202,53,0.25)' }} />
              World Cup 2026
            </div>
            <h2 style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', fontSize: '2.6rem', lineHeight: 0.95, marginTop: 14, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Predict the cup.<br />Top the table.
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: '0.92rem', color: 'rgba(245,248,236,0.78)', marginTop: 10, maxWidth: 320 }}>
              Free to play. Lock in scores, scorers and MOTM. Climb the global leaderboard.
            </p>
          </div>

          <ul style={{ position: 'relative', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <li key={title} className="anim-fade-up" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, animationDelay: `${0.05 + i * 0.07}s` }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(155,202,53,0.18)', border: '1.5px solid var(--turf, #9BCA35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} color="var(--turf, #9BCA35)" strokeWidth={2.4} />
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.88rem' }}>{title}</p>
                  <p style={{ fontFamily: 'Inter', fontSize: '0.78rem', color: 'rgba(245,248,236,0.65)', marginTop: 1 }}>{desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Inter', fontSize: '0.78rem', color: 'rgba(245,248,236,0.7)' }}>
            <Check size={12} color="var(--turf, #9BCA35)" strokeWidth={3} />
            10,000+ predictors and counting.
          </div>
        </div>

        {/* Right: form */}
        <div style={{ position: 'relative', padding: '2rem 2rem 1.75rem', display: 'flex', flexDirection: 'column' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'var(--surface, #F6F7F1)', border: 'none', cursor: 'pointer',
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--grey, #66705F)', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--chalk, #E7E9DF)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface, #F6F7F1)'; }}
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.4} />
          </button>

          <div style={{ display: 'inline-flex', background: 'var(--surface, #F6F7F1)', border: '1.5px solid var(--chalk, #E7E9DF)', borderRadius: 999, padding: 4, marginBottom: '1.25rem', alignSelf: 'flex-start' }}>
            {['signup', 'signin'].map(k => (
              <button key={k} type="button" onClick={() => setMode(k)}
                style={{
                  padding: '0.45rem 1rem',
                  background: mode === k ? 'var(--ink, #14201A)' : 'transparent',
                  color: mode === k ? 'var(--pitch, #F5F8EC)' : 'var(--grey, #66705F)',
                  border: 'none', borderRadius: 999,
                  fontFamily: 'Inter', fontWeight: 700, fontSize: '0.78rem',
                  cursor: 'pointer',
                }}>
                {k === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            ))}
          </div>

          <h3 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.5rem', color: 'var(--ink, #14201A)', marginBottom: 4 }}>
            {mode === 'signup' ? 'Join the tournament' : 'Welcome back'}
          </h3>
          <p style={{ fontFamily: 'Inter', fontSize: '0.86rem', color: 'var(--grey, #66705F)', marginBottom: '1.25rem' }}>
            {mode === 'signup' ? 'Free forever. Takes 20 seconds.' : 'Pick up where you left off.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {mode === 'signup' && (
              <div className="anim-fade-up">
                <label style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--grey, #66705F)', display: 'block', marginBottom: 6 }}>Username</label>
                <input type="text" required value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="YourGameName"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--turf-deep, #4F6E1B)'; e.target.style.boxShadow = '0 0 0 3px rgba(155,202,53,0.18)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E0E0DE'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}
            <div>
              <label style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--grey, #66705F)', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--turf-deep, #4F6E1B)'; e.target.style.boxShadow = '0 0 0 3px rgba(155,202,53,0.18)'; }}
                onBlur={e => { e.target.style.borderColor = '#E0E0DE'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--grey, #66705F)', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--turf-deep, #4F6E1B)'; e.target.style.boxShadow = '0 0 0 3px rgba(155,202,53,0.18)'; }}
                onBlur={e => { e.target.style.borderColor = '#E0E0DE'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {mode === 'signup' && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 2, cursor: 'pointer' }}>
                <input type="checkbox" checked={emailUpdates} onChange={e => setEmailUpdates(e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--turf-deep, #4F6E1B)' }} />
                <span style={{ fontFamily: 'Inter', fontSize: '0.78rem', color: 'var(--grey, #66705F)', lineHeight: 1.4 }}>
                  Email me kickoff reminders, my results & prize drops. Unsubscribe anytime.
                </span>
              </label>
            )}

            <button type="submit" disabled={loading}
              style={{
                background: 'var(--ink, #14201A)', color: 'var(--pitch, #F5F8EC)',
                border: 'none', borderRadius: 8,
                padding: '0.85rem 1.25rem',
                fontFamily: 'Inter', fontWeight: 800, fontSize: '0.92rem',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '0.4rem',
                boxShadow: '0 10px 24px rgba(20,32,26,0.25)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              {loading ? 'Please wait…' : mode === 'signup' ? <>Create account <Sparkles size={13} /></> : 'Sign in'}
            </button>

            <p style={{ fontFamily: 'Inter', fontSize: '0.72rem', color: 'var(--grey-light, #9CA39A)', textAlign: 'center', marginTop: '0.25rem' }}>
              By continuing you agree to our terms. We never sell your data.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
