import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--black)', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 26, height: 26, background: 'var(--lime)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} fill="var(--black)" color="var(--black)" strokeWidth={0} />
          </div>
          <span className="display" style={{ fontSize: '1.4rem', color: '#fff', letterSpacing: '0.04em' }}>Matchday</span>
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
          {[['/', 'Home'], ['/predict', 'Predict'], ['/insights', 'Insights'], ['/rewards', 'Rewards'], ['/about', 'About']].map(([to, label]) => (
            <Link key={to} to={to}
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >{label}</Link>
          ))}
        </nav>
        <p style={{ fontFamily: 'Barlow', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>
          For fun only · FIFA World Cup 2026
        </p>
      </div>
    </footer>
  );
}
