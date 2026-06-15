import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Check, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEAMS, PLAYERS, flagUrl } from '../data/mockData';

function getTeam(id) { return TEAMS.find(t => t.id === id); }
function getPlayers(a, b) { return [...(PLAYERS[a] || []), ...(PLAYERS[b] || [])]; }

function Flag({ code, size = 40 }) {
  return (
    <img src={flagUrl(code)} alt={code} className="flag-img"
      style={{ width: size, height: 'auto' }}
      onError={e => { e.target.style.display = 'none'; }} />
  );
}

function ScoreCounter({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <button onClick={() => onChange(Math.min(value + 1, 20))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: 'var(--grey-light)', borderRadius: 4, transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--lime-dark)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--grey-light)'}>
        <ChevronUp size={18} strokeWidth={2.5} />
      </button>
      <input type="number" className="score-box" value={value} min={0} max={20}
        onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 0 && v <= 20) onChange(v); }} />
      <button onClick={() => onChange(Math.max(value - 1, 0))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem', color: 'var(--grey-light)', borderRadius: 4, transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--lime-dark)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--grey-light)'}>
        <ChevronDown size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function PlayerGrid({ players, selected, onSelect, label, pts }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <p className="caps" style={{ color: 'var(--grey)' }}>{label}</p>
        <span className="badge badge-lime">{pts}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '0.4rem' }}>
        {players.map(p => (
          <button key={p} onClick={() => onSelect(selected === p ? '' : p)}
            style={{
              textAlign: 'left', padding: '0.55rem 0.8rem',
              border: `1.5px solid ${selected === p ? 'var(--lime-dark)' : 'var(--surface-3)'}`,
              borderRadius: 'var(--r-sm)',
              background: selected === p ? 'var(--lime)' : 'var(--white)',
              fontFamily: 'Barlow', fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--black)', cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { if (selected !== p) e.currentTarget.style.borderColor = 'var(--grey)'; }}
            onMouseLeave={e => { if (selected !== p) e.currentTarget.style.borderColor = 'var(--surface-3)'; }}
          >
            {selected === p && <Check size={10} strokeWidth={3} style={{ display: 'inline', marginRight: 4 }} />}
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
  const done = match.status === 'completed';

  async function handleSave() {
    await savePrediction(match.id, { homeScore, awayScore, scorer, assister, motm });
    setSaved(true);
  }

  return (
    <div className="card-flat" style={{
      borderColor: expanded ? 'var(--black)' : 'var(--surface-3)',
      boxShadow: expanded ? 'var(--shadow-md)' : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      <button onClick={onToggle} style={{
        width: '100%', textAlign: 'left', padding: '1rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: expanded ? '1.5px solid var(--surface-3)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flag code={home?.flagCode} size={28} />
            <span style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.9rem', color: 'var(--black)' }}>{home?.name}</span>
          </div>
          <span className="display" style={{ fontSize: '1rem', color: 'var(--grey-light)' }}>VS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.9rem', color: 'var(--black)' }}>{away?.name}</span>
            <Flag code={away?.flagCode} size={28} />
          </div>
          <span className="caps hidden sm:inline" style={{ color: 'var(--grey-light)' }}>{match.stage}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {done && <span className="badge badge-dark">FT {match.result.homeScore}–{match.result.awayScore}</span>}
          {saved && !done && <span className="badge badge-lime">✓ Saved</span>}
          <span style={{ color: 'var(--grey-light)', display: 'block', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronDown size={16} strokeWidth={2.5} />
          </span>
        </div>
      </button>

      {expanded && (
        <div className="anim-fade-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!session && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', border: '1.5px solid var(--lime-dark)', borderRadius: 'var(--r-md)', background: 'rgba(200,255,0,0.07)' }}>
              <span>🔐</span>
              <p style={{ fontFamily: 'Barlow', fontSize: '0.9rem', fontWeight: 600, color: 'var(--black)' }}>Sign in to save your prediction.</p>
            </div>
          )}

          {done && (
            <div style={{ padding: '1rem', background: 'var(--surface)', border: '1.5px solid var(--surface-3)', borderRadius: 'var(--r-md)' }}>
              <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.5rem' }}>Full Time</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
                <span className="display" style={{ fontSize: '2.25rem' }}>{match.result.homeScore} – {match.result.awayScore}</span>
                <span style={{ fontFamily: 'Barlow', fontSize: '0.9rem', fontWeight: 600, color: 'var(--grey)' }}>⚽ {match.result.scorer}</span>
                <span style={{ fontFamily: 'Barlow', fontSize: '0.9rem', fontWeight: 600, color: 'var(--grey)' }}>🏅 {match.result.motm}</span>
              </div>
            </div>
          )}

          {/* Score */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '1.25rem 1.5rem' }}>
            <p className="caps" style={{ color: 'var(--grey)', marginBottom: '1.25rem' }}>
              Score Prediction — <span style={{ color: 'var(--lime-dark)' }}>+5 pts for exact</span>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <Flag code={home?.flagCode} size={36} />
                <p style={{ fontFamily: 'Barlow', fontSize: '0.82rem', fontWeight: 700, marginTop: '0.4rem', marginBottom: '0.5rem' }}>{home?.name}</p>
                <ScoreCounter value={homeScore} onChange={setHomeScore} />
              </div>
              <span className="display" style={{ fontSize: '2.5rem', color: 'var(--surface-3)', marginTop: '2rem' }}>–</span>
              <div style={{ textAlign: 'center' }}>
                <Flag code={away?.flagCode} size={36} />
                <p style={{ fontFamily: 'Barlow', fontSize: '0.82rem', fontWeight: 700, marginTop: '0.4rem', marginBottom: '0.5rem' }}>{away?.name}</p>
                <ScoreCounter value={awayScore} onChange={setAwayScore} />
              </div>
            </div>
          </div>

          <div className="divider" />
          <PlayerGrid players={players} selected={scorer} onSelect={setScorer} label="Goalscorer" pts="+2 pts" />
          <div className="divider" />
          <PlayerGrid players={players} selected={assister} onSelect={setAssister} label="Assist Maker" pts="+1 pt" />
          <div className="divider" />
          <PlayerGrid players={players} selected={motm} onSelect={setMotm} label="Man of the Match" pts="+1 pt" />

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', paddingTop: '0.25rem' }}>
            {saved && !done && (
              <span style={{ fontFamily: 'Barlow', fontSize: '0.85rem', color: 'var(--grey-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={12} strokeWidth={2.5} /> Saved
              </span>
            )}
            <button onClick={handleSave} disabled={!session || done} className={`btn ${done ? 'btn-outline' : 'btn-lime'}`}
              style={{ opacity: !session ? 0.5 : 1, cursor: !session || done ? 'not-allowed' : 'pointer' }}>
              {done ? <><Lock size={12} strokeWidth={2} /> Locked</> : saved ? <><Check size={12} strokeWidth={2.5} /> Update</> : 'Lock In'}
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
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>World Cup 2026</p>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 0.95 }}>Predict Matches</h1>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1.5px solid var(--surface-3)', overflow: 'hidden', width: 'fit-content' }}>
        {[['all', 'All'], ['upcoming', 'Upcoming'], ['completed', 'Completed']].map(([val, label], i) => (
          <button key={val} onClick={() => setFilter(val)} className="caps"
            style={{
              padding: '0.6rem 1.25rem',
              background: filter === val ? 'var(--black)' : 'transparent',
              color: filter === val ? '#fff' : 'var(--grey-light)',
              border: 'none', borderRight: i < 2 ? '1.5px solid var(--surface-3)' : 'none',
              cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
            }}
          >{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {shown.map(m => (
          <MatchCard key={m.id} match={m} myPreds={myPreds}
            expanded={expanded === m.id}
            onToggle={() => setExpanded(expanded === m.id ? null : m.id)} />
        ))}
      </div>
    </main>
  );
}
