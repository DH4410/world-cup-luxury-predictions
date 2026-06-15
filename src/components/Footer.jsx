import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-ink-900 border-t-2 border-lime-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <span className="heading-display text-2xl text-white">⚽ Prediction Room</span>
        <nav className="flex flex-wrap gap-6">
          {[['/', 'Home'], ['/predict', 'Predict'], ['/rooms', 'Rooms'], ['/leaderboard', 'Leaderboard']].map(([to, label]) => (
            <Link key={to} to={to} className="nav-link text-ink-400 hover:text-lime-500 transition-colors">
              {label}
            </Link>
          ))}
        </nav>
        <p className="label-caps text-ink-600">FIFA World Cup 2026</p>
      </div>
    </footer>
  );
}
