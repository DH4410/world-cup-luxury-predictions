import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-cream-200 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Trophy size={14} className="text-gold-500" strokeWidth={1.5} />
            <span className="editorial-heading tracking-widest uppercase text-sm text-charcoal-900">
              Prediction Room
            </span>
          </div>
          <nav className="flex flex-wrap gap-6">
            {[
              { to: '/', label: 'Front Page' },
              { to: '/predict', label: 'Predict' },
              { to: '/rooms', label: 'Rooms' },
              { to: '/leaderboard', label: 'Leaderboard' },
            ].map(l => (
              <Link key={l.to} to={l.to} className="editorial-label text-charcoal-400 hover:text-charcoal-800 transition-colors no-underline">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="editorial-label text-charcoal-400">
            FIFA World Cup 2026 &mdash; USA · Canada · Mexico
          </p>
        </div>
        <div className="mt-8 pt-6 border-t border-cream-200">
          <p className="editorial-label text-charcoal-400 text-center">
            For entertainment purposes only. &copy; 2026 Prediction Room.
          </p>
        </div>
      </div>
    </footer>
  );
}
