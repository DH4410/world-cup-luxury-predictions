import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TEAMS, GROUPS, STANDINGS, flagUrl } from '../data/mockData';

function getTeam(id) { return TEAMS.find(t => t.id === id); }

function Flag({ code, size = 24 }) {
  return (
    <img src={flagUrl(code)} alt={code}
      style={{ width: size, height: 'auto', display: 'block', borderRadius: 2 }}
      onError={e => { e.target.style.display = 'none'; }} />
  );
}

function GroupCard({ letter, data }) {
  const rows = (STANDINGS[letter] || data.teams.map(id => ({ team: id, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 })))
    .sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
  const played = rows.some(r => r.w + r.d + r.l > 0);

  return (
    <div className="card-flat" style={{ overflow: 'hidden' }}>
      {/* Group header */}
      <div style={{
        background: 'var(--black)', padding: '0.75rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p className="display" style={{ fontSize: '1.5rem', color: '#fff' }}>Group {letter}</p>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {data.teams.map(id => {
            const t = getTeam(id);
            return t ? (
              <div key={id} style={{ width: 28, height: 19, overflow: 'hidden', borderRadius: 2 }}>
                <Flag code={t.flagCode} size={28} />
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 2rem 2rem 2rem 2.5rem 2.5rem 2.5rem',
        gap: '0.25rem', padding: '0.5rem 1.25rem',
        background: 'var(--surface)', alignItems: 'center',
      }}>
        <span className="caps" style={{ color: 'var(--grey-light)', fontSize: '0.6rem' }}>Team</span>
        {['P', 'W', 'D', 'L', 'GD', 'Pts'].map(h => (
          <span key={h} className="caps" style={{ color: 'var(--grey-light)', fontSize: '0.6rem', textAlign: 'center' }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      {rows.map((row, i) => {
        const t = getTeam(row.team);
        if (!t) return null;
        const p = row.w + row.d + row.l;
        const gd = row.gf - row.ga;
        const isTop2 = i < 2;
        return (
          <div key={row.team} style={{
            display: 'grid', gridTemplateColumns: '1fr 2rem 2rem 2rem 2.5rem 2.5rem 2.5rem',
            gap: '0.25rem', padding: '0.65rem 1.25rem',
            borderBottom: i < rows.length - 1 ? '1px solid var(--surface-3)' : 'none',
            borderLeft: isTop2 ? '3px solid var(--lime-dark)' : '3px solid transparent',
            background: played && isTop2 ? 'rgba(200,255,0,0.04)' : 'transparent',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flag code={t.flagCode} size={22} />
              <span style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.85rem', color: 'var(--black)' }}>{t.name}</span>
            </div>
            {[p, row.w, row.d, row.l, gd > 0 ? `+${gd}` : gd, null].map((val, ci) => {
              if (ci === 5) return (
                <span key="pts" className="display" style={{ fontSize: '1.1rem', textAlign: 'center', color: row.pts > 0 ? 'var(--black)' : 'var(--grey-light)' }}>{row.pts}</span>
              );
              return (
                <span key={ci} style={{ fontFamily: 'Barlow', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center', color: 'var(--grey)' }}>{val}</span>
              );
            })}
          </div>
        );
      })}

      {played && (
        <div style={{ padding: '0.5rem 1.25rem', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--lime-dark)' }} />
          <span style={{ fontFamily: 'Barlow', fontSize: '0.72rem', fontWeight: 600, color: 'var(--grey-light)' }}>Qualify for Round of 32</span>
        </div>
      )}
    </div>
  );
}

export default function Groups() {
  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>FIFA World Cup 2026</p>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 0.95 }}>Group Stage</h1>
        <p style={{ fontFamily: 'Barlow', fontSize: '1rem', color: 'var(--grey)', marginTop: '0.75rem' }}>
          8 groups · 3 teams each · Top 2 from every group advance to the Round of 32
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {Object.entries(GROUPS).map(([letter, data]) => (
          <GroupCard key={letter} letter={letter} data={data} />
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '1.5rem', border: '1.5px dashed var(--surface-3)', borderRadius: 'var(--r-xl)' }}>
        <p className="display" style={{ fontSize: '1.5rem', color: 'var(--grey-light)', marginBottom: '0.5rem' }}>
          Predict which teams advance
        </p>
        <p style={{ fontFamily: 'Barlow', fontSize: '0.9rem', color: 'var(--grey)', marginBottom: '1.25rem' }}>
          Lock in your group stage calls before the first whistle.
        </p>
        <Link to="/predict" className="btn btn-lime">
          Make Predictions <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}
