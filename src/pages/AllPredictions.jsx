import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Check, Lock, ArrowRight } from 'lucide-react';
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
    <img src={src} alt={team?.code || ''}
      style={{ width: size, height: 'auto', borderRadius: 2, display: 'block' }}
      onError={e => { e.target.style.display = 'none'; }} />
  );
}

function MatchRow({ match, pred, teamMap }) {
  const home = match.home || teamMap[match.homeTeam];
  const away = match.away || teamMap[match.awayTeam];
  const done = match.status === 'completed';
  const hasPred = !!pred;

  return (
    <Link to="/predict" style={{
      display: 'grid',
      gridTemplateColumns: '130px 1fr auto 1fr 100px 110px',
      gap: '1rem', alignItems: 'center',
      padding: '0.85rem 1.25rem',
      borderBottom: '1px solid var(--chalk)',
      background: 'transparent', textDecoration: 'none', color: 'inherit',
      transition: 'background 0.12s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

      <div>
        <p className="h-mono" style={{ fontSize: '0.72rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {new Date(match.kickoff).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </p>
        <p className="h-mono" style={{ fontSize: '0.72rem', color: 'var(--grey-light)' }}>
          {new Date(match.kickoff).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{home?.name}</span>
        <Flag team={home} size={24} />
      </div>

      <span className="h-mono" style={{ fontSize: '0.85rem', color: 'var(--grey-light)' }}>
        {done ? `${match.result?.homeScore}-${match.result?.awayScore}` : 'vs'}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Flag team={away} size={24} />
        <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{away?.name}</span>
      </div>

      <div style={{ textAlign: 'center' }}>
        {hasPred ? (
          <span className="h-mono" style={{
            display: 'inline-block', padding: '0.25rem 0.6rem',
            background: 'var(--lime-faint)', border: '1.5px solid var(--turf-deep)',
            borderRadius: 6, fontSize: '0.82rem', fontWeight: 800, color: 'var(--turf-deep)',
          }}>
            {pred.homeScore}–{pred.awayScore}
          </span>
        ) : (
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.78rem', color: 'var(--grey-light)' }}>—</span>
        )}
      </div>

      <div style={{ textAlign: 'right' }}>
        {done ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'Inter', fontSize: '0.76rem', fontWeight: 700, color: 'var(--grey-light)' }}>
            <Lock size={11} /> Locked
          </span>
        ) : hasPred ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'Inter', fontSize: '0.76rem', fontWeight: 700, color: 'var(--turf-deep)' }}>
            <Check size={12} strokeWidth={3} /> Saved
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'Inter', fontSize: '0.76rem', fontWeight: 700, color: 'var(--ink)' }}>
            Predict <ArrowRight size={11} strokeWidth={2.4} />
          </span>
        )}
      </div>
    </Link>
  );
}

export default function AllPredictions() {
  const { matches, teams, getMyPredictions } = useApp();
  const [myPreds, setMyPreds] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const teamMap = useMemo(() => Object.fromEntries(teams.map(t => [t.id, t])), [teams]);
  useEffect(() => { getMyPredictions().then(setMyPreds); }, []);

  const filtered = useMemo(() => {
    return matches.filter(m => {
      if (filter === 'predicted' && !myPreds[m.id]) return false;
      if (filter === 'open' && (myPreds[m.id] || m.status === 'completed')) return false;
      if (filter === 'completed' && m.status !== 'completed') return false;
      if (search) {
        const a = (m.home?.name || teamMap[m.homeTeam]?.name || '').toLowerCase();
        const b = (m.away?.name || teamMap[m.awayTeam]?.name || '').toLowerCase();
        const q = search.toLowerCase();
        if (!a.includes(q) && !b.includes(q) && !m.stage.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [matches, myPreds, filter, search, teamMap]);

  const byStage = useMemo(() => {
    const groups = {};
    filtered.forEach(m => {
      if (!groups[m.stage]) groups[m.stage] = [];
      groups[m.stage].push(m);
    });
    Object.values(groups).forEach(arr => arr.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)));
    return groups;
  }, [filtered]);

  const stageKeys = Object.keys(byStage).sort();

  const total = matches.length;
  const predictedCount = Object.keys(myPreds).length;

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>FIFA World Cup 2026</p>
        <h1 className="display" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: 0.95 }}>All predictions</h1>
        <p style={{ fontFamily: 'Inter', fontSize: '0.95rem', color: 'var(--grey)', marginTop: '0.6rem' }}>
          Every fixture, every prediction in one place. <strong>{predictedCount}</strong> of <strong>{total}</strong> locked in.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--white)', border: '1.5px solid var(--chalk)',
          borderRadius: 6, padding: '0.55rem 0.85rem', flex: '1 1 280px', maxWidth: 360,
        }}>
          <Search size={14} color="var(--grey-light)" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search team or stage…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Inter', fontSize: '0.88rem' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            ['all', 'All'],
            ['open', 'Open'],
            ['predicted', 'My predictions'],
            ['completed', 'Completed'],
          ].map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{
                padding: '0.5rem 1rem',
                background: filter === k ? 'var(--ink)' : 'var(--white)',
                color: filter === k ? 'var(--pitch)' : 'var(--grey)',
                border: `1.5px solid ${filter === k ? 'var(--ink)' : 'var(--chalk)'}`,
                borderRadius: 999,
                fontFamily: 'Inter', fontWeight: 700, fontSize: '0.78rem',
                cursor: 'pointer',
              }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Stage table */}
      {stageKeys.length === 0 && (
        <div style={{ padding: '4rem 0', textAlign: 'center', fontFamily: 'Inter', color: 'var(--grey-light)' }}>
          Nothing matches your filters.
        </div>
      )}

      {stageKeys.map(stageName => (
        <section key={stageName} style={{
          background: 'var(--white)', border: '1.5px solid var(--chalk)',
          borderRadius: 10, overflow: 'hidden', marginBottom: '1rem',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--surface)', padding: '0.7rem 1.25rem',
            borderBottom: '1.5px solid var(--chalk)',
          }}>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '0.82rem', color: 'var(--ink)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{stageName}</h2>
            <span className="h-mono" style={{ fontSize: '0.72rem', color: 'var(--grey)' }}>{byStage[stageName].length} matches</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '130px 1fr auto 1fr 100px 110px',
            gap: '1rem', padding: '0.55rem 1.25rem',
            background: 'var(--white)',
            borderBottom: '1px solid var(--chalk)',
            fontFamily: 'Inter', fontWeight: 700, fontSize: '0.66rem',
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--grey-light)',
          }}>
            <span>Kickoff</span>
            <span style={{ textAlign: 'right' }}>Home</span>
            <span></span>
            <span>Away</span>
            <span style={{ textAlign: 'center' }}>My pick</span>
            <span style={{ textAlign: 'right' }}>Status</span>
          </div>

          {byStage[stageName].map(m => (
            <MatchRow key={m.id} match={m} pred={myPreds[m.id]} teamMap={teamMap} />
          ))}
        </section>
      ))}
    </main>
  );
}
