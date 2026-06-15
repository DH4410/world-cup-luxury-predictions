import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Trophy, LogIn, LogOut, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { isLoggedIn, login, logout, user } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Front Page' },
    { to: '/predict', label: 'Predict' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className="bg-cream-50 border-b border-cream-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <Trophy size={16} className="text-gold-500" strokeWidth={1.5} />
            <span className="editorial-heading text-lg tracking-widest uppercase text-charcoal-900">
              Prediction Room
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`editorial-label transition-colors no-underline ${
                  isActive(link.to)
                    ? 'text-charcoal-900 border-b border-charcoal-900 pb-0.5'
                    : 'text-charcoal-400 hover:text-charcoal-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-charcoal-900 flex items-center justify-center">
                    <span className="text-cream-50 text-xs font-medium font-sans">{user.avatar}</span>
                  </div>
                  <span className="editorial-label text-charcoal-600">{user.name}</span>
                </div>
                <button onClick={logout} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1">
                  <LogOut size={12} strokeWidth={1.5} />
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={login} className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5">
                <LogIn size={12} strokeWidth={1.5} />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-charcoal-800"
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-cream-200 bg-cream-50 px-6 py-4 space-y-3">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block editorial-label no-underline ${
                isActive(link.to) ? 'text-charcoal-900' : 'text-charcoal-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-cream-200">
            {isLoggedIn ? (
              <button onClick={() => { logout(); setMenuOpen(false); }} className="editorial-label text-charcoal-400 hover:text-charcoal-800 flex items-center gap-1.5">
                <LogOut size={12} strokeWidth={1.5} /> Sign Out
              </button>
            ) : (
              <button onClick={() => { login(); setMenuOpen(false); }} className="editorial-label text-charcoal-800 flex items-center gap-1.5">
                <LogIn size={12} strokeWidth={1.5} /> Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
