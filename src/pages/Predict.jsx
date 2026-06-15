import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Check, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEAMS, PLAYERS } from '../data/mockData';

function getTeam(id) { return TEAMS.find(t => t.id === id); }
function getPlayers(a, b) { return [...(PLAYERS[a] || []), ...(PLAYERS[b] || [])]; }

function ScoreCounter({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button onClick={() => onChange(Math.min(value + 1, 20))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', color: 'var(--ink-soft)', transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--lime-dark)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-soft)'}>
        <ChevronUp size={20} strokeWidth={2.5} />
      </button>
      <input
        type="number" className="score-input"
        value={value} min={0} max={20}
        onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 0 && v <= 20) onChange(v); }}
      />
      <button onClick={() => onChange(Math.max(value - 1, 0))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', color: 'var(--ink-soft)', transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--lime-dark)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-soft)'}>
        <ChevronDown size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function PlayerGrid({ players, selected, onSelect, label, pts }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <p className="label-caps" style={{ color: 'var(--ink-soft)' }}>{label}</p>
        <span className="badge-lime">{pts}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
        {players.map(p => (
          <button
            key={p}
            onClick={() => onSelect(selected === p ? '' : p)}
            style={{
              textAlign: 'left', padding: '0.6rem 0.85rem',
              border: `2px solid ${selected === p ? 'var(--lime-dark)' : '#DEDEDE'}`,
              borderRadius: 8,
              background: selected === p ? 'var(--lime)' : '#fff',
              fontFamily: 'Barlow', fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--ink)', cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { if (selected !== p) e.currentTarget.style.borderColor = 'var(--ink)'; }}
            onMouseLeave={e => { if (selected !== p) e.currentTarget.style.borderColor = '#DEDEDE'; }}
          >
            {selected === p && <Check size={11} strokeWidth={3} style={{ display: 'inline', marginRight: 5 }} />}
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match, expanded, onToggle, myPreds }) {
  const { session, savePrediction } = useApp();
  const home = getTeam(match.homeTeam);
  const away = getTeam(match.awayTeam);
  const players = getPlayers(match.homeTeam, match.awayTeam);
  const existing = myPreds[match.id];

  const [homeScore, setHomeScore] = useState(existing?.homeScore ?? 1);
  const [awayScore, setAwayScore] = useState(existing?.awayScore ?? 1);
  const [scorer, setScorer] = useState(existing?.scorer ?? '');
  const [assister, setAssister] = useState(existing?.assister ?? '');
  const [motm, setMotm] = useState(existing?.motm ?? '');
  const [saved, setSaved] = useState(!!existing);

  async function handleSave() {
    await savePrediction(match.id, { homeScore, awayScore, scorer, assister, motm });
    setSaved(true);
  }

  const done = match.status === 'completed';

  return (
    <div
      style={{
        border: `2px solid ${expanded ? 'var(--ink)' : '#DEDEDE'}`,
        borderRadius: 'var(--radius-lg)',
        background: '#fff',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: expanded ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
    >
      {/* Row */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', textAlign: 'left', padding: '1rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: expanded ? '2px solid #EBEBEB' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{home?.flag}</span>
            <span style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{home?.name}</span>
          </div>
          <span className="heading-display" style={{ fontSize: '1.25rem', color: 'var(--ink-soft)' }}>VS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{away?.name}</span>
            <span style={{ fontSize: '1.5rem' }}>{away?.flag}</span>
          </div>
          <span className="label-caps hidden sm:inline" style={{ color: 'var(--ink-soft)' }}>{match.stage}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {done && <span className="badge-ink">FT {match.result.homeScore}–{match.result.awayScore}</span>}
          {saved && !done && <span className="badge-lime">✓ Saved</span>}
          <span style={{ color: 'var(--ink-soft)', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'block' }}>
            <ChevronDown size={16} strokeWidth={2.5} />
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeUp 0.25s ease both' }}>
          {!session && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', border: '2px solid var(--lime-dark)', borderRadius: 10, background: 'rgba(202,255,3,0.08)' }}>
              <span style={{ fontSize: '1.1rem' }}>🔐</span>
              <p style={{ fontFamily: 'Barlow', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Sign in to lock in your prediction.</p>
            </div>
          )}

          {done && (
            <div style={{ padding: '1rem', background: '#F8F8F6', border: '2px solid #DEDEDE', borderRadius: 10 }}>
              <p className="label-caps" style={{ color: 'var(--ink-soft)', marginBottom: '0.5rem' }}>Full Time Result</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                <span className="heading-display" style={{ fontSize: '2.5rem' }}>{match.result.homeScore} – {match.result.awayScore}</span>
                <span style={{ fontFamily: 'Barlow', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-mid)' }}>⚽ {match.result.scorer}</span>
                <span style={{ fontFamily: 'Barlow', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-mid)' }}>🏅 {match.result.motm}</span>
              </div>
            </div>
          )}

          {/* Score */}
          <div style={{ background: '#F8F8F6', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
            <p className="label-caps" style={{ color: 'var(--ink-soft)', marginBottom: '1.25rem' }}>
              Exact Full-Time Score <span style={{ color: 'var(--lime-dark)' }}>+5 pts</span>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Barlow', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>{home?.name}</p>
                <ScoreCounter value={homeScore} onChange={setHomeScore} />
              </div>
              <span className="heading-display" style={{ fontSize: '3rem', color: '#DEDEDE', marginTop: '1.5rem' }}>–</span>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Barlow', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>{away?.name}</p>
                <ScoreCounter value={awayScore} onChange={setAwayScore} />
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: '#EBEBEB' }} />
          <PlayerGrid players={players} selected={scorer} onSelect={setScorer} label="Goalscorer" pts="+2 pts" />
          <div style={{ height: 1, background: '#EBEBEB' }} />
          <PlayerGrid players={players} selected={assister} onSelect={setAssister} label="Assist Maker" pts="+1 pt" />
          <div style={{ height: 1, background: '#EBEBEB' }} />
          <PlayerGrid players={players} selected={motm} onSelect={setMotm} label="Man of the Match" pts="+1 pt" />

          <div style={{ paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
            {saved && !done && (
              <span style={{ fontFamily: 'Barlow', fontSize: '0.85rem', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={13} strokeWidth={2.5} /> Prediction saved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!session || done}
              className={done ? 'btn-ghost' : 'btn-primary'}
              style={{ opacity: !session ? 0.5 : 1, cursor: (!session || done) ? 'not-allowed' : 'pointer' }}
            >
              {done ? <><Lock size={13} strokeWidth={2} /> Locked</> : saved ? <><Check size={13} strokeWidth={2.5} /> Update</> : 'Lock In Prediction'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Predict() {
  const { matches, getMyPredictions } = useApp();
  const [myPreds, setMyPreds] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { getMyPredictions().then(setMyPreds); }, []);

  const shown = filter === 'upcoming' ? matches.filter(m => m.status === 'upcoming')
    : filter === 'completed' ? matches.filter(m => m.status === 'completed')
    : matches;

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-10 py-10">
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-caps" style={{ color: 'var(--ink-soft)', marginBottom: '0.25rem' }}>World Cup 2026</p>
        <h1 className="heading-display" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', lineHeight: 0.95 }}>Prediction Suite</h1>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', marginBottom: '1.5rem', border: '2px solid var(--ink)', borderRadius: 10, overflow: 'hidden', width: 'fit-content' }}>
        {[['all', 'All'], ['upcoming', 'Upcoming'], ['completed', 'Completed']].map(([val, label], i) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className="label-caps"
            style={{
              padding: '0.5rem 1.25rem',
              background: filter === val ? 'var(--ink)' : '#fff',
              color: filter === val ? '#fff' : 'var(--ink-soft)',
              border: 'none', borderRight: i < 2 ? '2px solid var(--ink)' : 'none',
              cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
            }}
          >{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {shown.map(m => (
          <MatchCard
            key={m.id} match={m} myPreds={myPreds}
            expanded={expanded === m.id}
            onToggle={() => setExpanded(expanded === m.id ? null : m.id)}
          />
        ))}
      </div>
    </main>
  );
}
