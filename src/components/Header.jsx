import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
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
      <header className="bg-ink-900 border-b-2 border-lime-500 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-10 flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="heading-display text-2xl text-white tracking-widest">⚽ Prediction Room</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`nav-link px-4 py-1.5 transition-colors ${
                  isActive(l.to)
                    ? 'text-lime-500 bg-white/5'
                    : 'text-ink-200 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session && profile ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 border border-white/10">
                  <div className="w-6 h-6 bg-lime-500 flex items-center justify-center">
                    <span className="font-sans text-xs font-bold text-ink-900">{profile.avatar_initials}</span>
                  </div>
                  <span className="label-caps text-ink-200">{profile.username}</span>
                  <span className="label-caps text-lime-500">{profile.total_points}pts</span>
                </div>
                <button onClick={signOut} className="text-ink-400 hover:text-white transition-colors p-1">
                  <LogOut size={14} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-primary py-1.5 px-4 text-xs">
                Sign In
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-ink-200 hover:text-white" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-ink-900 border-b-2 border-lime-500 z-30 relative">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {links.map(l => (
              <Link
                key={l.to} to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`nav-link block px-3 py-2 ${isActive(l.to) ? 'text-lime-500' : 'text-ink-200'}`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 mt-3">
              {session ? (
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="nav-link text-ink-400 hover:text-white flex items-center gap-2">
                  <LogOut size={13} strokeWidth={2} /> Sign Out
                </button>
              ) : (
                <button onClick={() => { setShowAuth(true); setMenuOpen(false); }} className="btn-primary text-xs py-2">
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
