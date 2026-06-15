import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#0D1F0D', borderTop: '3px solid var(--lime)', marginTop: 'auto' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-8" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <span className="heading-display" style={{ fontSize: '1.75rem', color: '#fff' }}>⚽ Prediction Room</span>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          {[['/', 'Home'], ['/predict', 'Predict'], ['/rooms', 'Rooms'], ['/leaderboard', 'Leaderboard']].map(([to, label]) => (
            <Link key={to} to={to} className="nav-link" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--lime)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
            >{label}</Link>
          ))}
        </nav>
        <p className="label-caps" style={{ color: 'rgba(255,255,255,0.25)' }}>FIFA World Cup 2026</p>
      </div>
    </footer>
  );
}
