import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AuthModal from './AuthModal';

const NAV = [
  { to: '/',            label: 'Home' },
  { to: '/predict',     label: 'Predict' },
  { to: '/rooms',       label: 'Rooms' },
  { to: '/leaderboard', label: 'Rankings' },
];

export default function Header() {
  const { session, profile, signOut } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { pathname } = useLocation();

  const active = (p) => p === '/' ? pathname === '/' : pathname.startsWith(p);

  return (
    <>
      <header style={{
        background: 'var(--white)',
        borderBottom: '1.5px solid var(--surface-3)',
        position: 'sticky', top: 0, zIndex: 40,
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '2rem', height: 60 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, background: 'var(--lime)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={16} fill="var(--black)" color="var(--black)" strokeWidth={0} />
            </div>
            <span className="display" style={{ fontSize: '1.5rem', color: 'var(--black)', letterSpacing: '0.04em' }}>
              Matchday
            </span>
          </Link>

          {/* Desktop nav tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }} className="hidden md:flex">
            {NAV.map(l => (
              <Link
                key={l.to} to={l.to}
                style={{
                  padding: '0.45rem 1rem',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '0.88rem', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: active(l.to) ? 'var(--black)' : 'var(--grey-light)',
                  borderBottom: active(l.to) ? '2.5px solid var(--lime-dark)' : '2.5px solid transparent',
                  marginBottom: '-1.5px',
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active(l.to)) e.currentTarget.style.color = 'var(--black)'; }}
                onMouseLeave={e => { if (!active(l.to)) e.currentTarget.style.color = 'var(--grey-light)'; }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right side auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto', flexShrink: 0 }} className="hidden md:flex">
            {session && profile ? (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--surface)', padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--r-full)', border: '1.5px solid var(--surface-3)',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Barlow', fontWeight: 800, fontSize: '0.7rem', color: 'var(--black)',
                  }}>{profile.avatar_initials}</div>
                  <span style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.85rem', color: 'var(--black)' }}>{profile.username}</span>
                  <span className="caps" style={{ color: 'var(--grey)', fontSize: '0.65rem' }}>{profile.total_points}pts</span>
                </div>
                <button onClick={signOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-light)', padding: '0.3rem', borderRadius: 6, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--grey-light)'}>
                  <LogOut size={15} strokeWidth={2} />
                </button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn btn-lime" style={{ padding: '0.4rem 1.1rem', fontSize: '0.8rem' }}>
                Sign In
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black)', marginLeft: 'auto', padding: '0.25rem' }}>
            {menuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden anim-fade-in" style={{ background: 'var(--white)', borderBottom: '1.5px solid var(--surface-3)', zIndex: 39, position: 'relative' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {NAV.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                style={{
                  padding: '0.65rem 0.75rem', borderRadius: 'var(--r-sm)',
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.95rem',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: active(l.to) ? 'var(--black)' : 'var(--grey)',
                  background: active(l.to) ? 'var(--surface)' : 'transparent',
                  borderLeft: active(l.to) ? '3px solid var(--lime-dark)' : '3px solid transparent',
                }}
              >{l.label}</Link>
            ))}
            <div style={{ borderTop: '1.5px solid var(--surface-3)', paddingTop: '0.65rem', marginTop: '0.25rem' }}>
              {session ? (
                <button onClick={() => { signOut(); setMenuOpen(false); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--grey)', display: 'flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.75rem' }}>
                  <LogOut size={13} /> Sign Out
                </button>
              ) : (
                <button onClick={() => { setShowAuth(true); setMenuOpen(false); }} className="btn btn-lime" style={{ fontSize: '0.8rem', padding: '0.5rem 1.1rem' }}>
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
