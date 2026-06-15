import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AuthModal from './AuthModal';

export default function Header() {
  const { session, profile, signOut } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/predict', label: 'Predict' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ];

  const isActive = (p) => (p === '/' ? location.pathname === '/' : location.pathname.startsWith(p));

  return (
    <>
      <header style={{ background: '#0D1F0D', borderBottom: '3px solid var(--lime)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-10" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span className="heading-display" style={{ fontSize: '1.6rem', color: '#fff', letterSpacing: '0.05em' }}>
              ⚽ Prediction Room
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden md:flex">
            {links.map(l => (
              <Link
                key={l.to} to={l.to}
                className="nav-link"
                style={{
                  padding: '0.4rem 0.9rem',
                  color: isActive(l.to) ? 'var(--lime)' : 'rgba(255,255,255,0.65)',
                  background: isActive(l.to) ? 'rgba(202,255,3,0.1)' : 'transparent',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { if (!isActive(l.to)) e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (!isActive(l.to)) e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session && profile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(255,255,255,0.07)', padding: '0.3rem 0.75rem',
                  borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.75rem', color: 'var(--ink)',
                  }}>{profile.avatar_initials}</div>
                  <span className="label-caps" style={{ color: 'rgba(255,255,255,0.8)' }}>{profile.username}</span>
                  <span className="label-caps" style={{ color: 'var(--lime)' }}>{profile.total_points}pts</span>
                </div>
                <button
                  onClick={signOut}
                  style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  <LogOut size={15} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-primary" style={{ padding: '0.4rem 1.1rem', fontSize: '0.8rem' }}>
                Sign In
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(v => !v)}
            style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {menuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden" style={{ background: '#0D1F0D', borderBottom: '2px solid var(--lime)', zIndex: 30, position: 'relative' }}>
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {links.map(l => (
              <Link
                key={l.to} to={l.to}
                onClick={() => setMenuOpen(false)}
                className="nav-link block"
                style={{
                  padding: '0.6rem 0.75rem', borderRadius: 6,
                  color: isActive(l.to) ? 'var(--lime)' : 'rgba(255,255,255,0.65)',
                }}
              >{l.label}</Link>
            ))}
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {session ? (
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="nav-link" style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LogOut size={13} /> Sign Out
                </button>
              ) : (
                <button onClick={() => { setShowAuth(true); setMenuOpen(false); }} className="btn-primary" style={{ fontSize: '0.8rem' }}>
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
