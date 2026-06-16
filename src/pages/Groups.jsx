import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { flagUrl } from '../data/mockData';

function flagFor(team) {
  if (team?.flag) return team.flag;
  if (team?.flagCode) return flagUrl(team.flagCode);
  return null;
}

function Flag({ team, size = 24 }) {
  const src = flagFor(team);
  if (!src) return <div style={{ width: size, height: size * 0.66, background: 'var(--surface-2)', borderRadius: 2 }} />;
  return (
    <img src={src} alt={team?.code || team?.name || ''}
      style={{ width: size, height: 'auto', display: 'block', borderRadius: 2 }}
      onError={e => { e.target.style.display = 'none'; }} />
  );
}

function GroupCard({ letter, rows, played }) {
  return (
    <div className="lift" style={{
      background: 'var(--white)', border: '1.5px solid var(--chalk)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{
        background: 'var(--ink)', padding: '0.75rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p className="display" style={{ fontSize: '1.6rem', color: 'var(--pitch)' }}>Group {letter}</p>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {rows.map(r => (
            <div key={r.team.id} style={{ width: 28, height: 19, overflow: 'hidden', borderRadius: 2 }}>
              <Flag team={r.team} size={28} />
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 2rem 2rem 2rem 2.5rem 2.5rem 2.5rem',
        gap: '0.25rem', padding: '0.55rem 1.25rem',
        background: 'var(--surface)', alignItems: 'center',
      }}>
        <span className="caps" style={{ color: 'var(--grey-light)', fontSize: '0.6rem' }}>Team</span>
        {['P', 'W', 'D', 'L', 'GD', 'Pts'].map(h => (
          <span key={h} className="caps" style={{ color: 'var(--grey-light)', fontSize: '0.6rem', textAlign: 'center' }}>{h}</span>
        ))}
      </div>

      {rows.map((r, i) => {
        const isTop2 = i < 2;
        return (
          <div key={r.team.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 2rem 2rem 2rem 2.5rem 2.5rem 2.5rem',
            gap: '0.25rem', padding: '0.65rem 1.25rem',
            borderBottom: i < rows.length - 1 ? '1px solid var(--chalk)' : 'none',
            borderLeft: isTop2 ? '3px solid var(--turf)' : '3px solid transparent',
            background: played && isTop2 ? 'rgba(155,202,53,0.06)' : 'transparent',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Flag team={r.team} size={22} />
              <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink)' }}>{r.team.name}</span>
            </div>
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center', color: 'var(--grey)' }}>{r.mp}</span>
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center', color: 'var(--grey)' }}>{r.w}</span>
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center', color: 'var(--grey)' }}>{r.d}</span>
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center', color: 'var(--grey)' }}>{r.l}</span>
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center', color: 'var(--grey)' }}>{r.gd > 0 ? `+${r.gd}` : r.gd}</span>
            <span className="display" style={{ fontSize: '1.1rem', textAlign: 'center', color: r.pts > 0 ? 'var(--ink)' : 'var(--grey-light)' }}>{r.pts}</span>
          </div>
        );
      })}

      {played && (
        <div style={{ padding: '0.5rem 1.25rem', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--turf)' }} />
          <span style={{ fontFamily: 'Inter', fontSize: '0.72rem', fontWeight: 700, color: 'var(--grey-light)' }}>Top 2 advance · 8 best 3rd-placed sides qualify</span>
        </div>
      )}
    </div>
  );
}

export default function Groups() {
  const { teams, standings, groupsByLetter } = useApp();

  // Build per-letter rows: prefer live standings, fall back to teams list
  const letters = Array.from(new Set(teams.map(t => t.group).filter(Boolean))).sort();

  function rowsFor(letter) {
    if (standings && standings[letter]) {
      return standings[letter].map(r => ({ team: r.team, mp: r.mp, w: r.w, d: r.d, l: r.l, gd: r.gd, pts: r.pts }));
    }
    const src = groupsByLetter?.[letter] || teams.filter(t => t.group === letter);
    return src.map(t => ({ team: t, mp: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 }));
  }

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      <div className="anim-fade-up" style={{ marginBottom: '2.5rem' }}>
        <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>FIFA World Cup 2026</p>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 0.95 }}>Group Stage</h1>
        <p style={{ fontFamily: 'Inter', fontSize: '1rem', color: 'var(--grey)', marginTop: '0.75rem' }}>
          {letters.length} groups · 4 teams each · {teams.length} teams · Top 2 plus the 8 best third-placed sides advance to the Round of 32
        </p>
      </div>

      <div className="anim-fade-up anim-d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {letters.map(L => {
          const rows = rowsFor(L);
          const played = rows.some(r => r.mp > 0);
          return <GroupCard key={L} letter={L} rows={rows} played={played} />;
        })}
      </div>

      <div style={{ textAlign: 'center', padding: '1.75rem', border: '1.5px dashed var(--chalk)', borderRadius: 14 }}>
        <p className="display" style={{ fontSize: '1.5rem', color: 'var(--grey-light)', marginBottom: '0.5rem' }}>
          Predict which teams advance
        </p>
        <Link to="/predict" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--ink)', color: 'var(--pitch)',
          padding: '0.75rem 1.5rem', borderRadius: 8,
          fontFamily: 'Inter', fontWeight: 700, fontSize: '0.88rem',
        }}>
          Make predictions <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}
