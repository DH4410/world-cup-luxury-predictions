import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Lock, ChevronDown, Minus, Plus, AlertCircle, Sparkles, Mail, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLAYERS } from '../data/mockData';
import CustomDropdown from '../components/CustomDropdown';
import AuthModal from '../components/AuthModal';

function flagSrc(team) {
  if (team?.flag) return team.flag;
  if (team?.flagCode) return `https://flagcdn.com/w80/${team.flagCode}.png`;
  return null;
}

function Flag({ team, size = 32 }) {
  const src = flagSrc(team);
  if (!src) return <div style={{ width: size, height: size * 0.66, background: 'var(--surface-2)', borderRadius: 2 }} />;
  return (
    <img src={src} alt={team?.code || team?.name || ''}
      style={{ width: size, height: 'auto', borderRadius: 2, display: 'block', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}
      onError={e => { e.target.style.visibility = 'hidden'; }} />
  );
}

function fmtDay(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}
function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
function dayKey(iso) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

function ScoreStepper({ value, onChange, accent = 'var(--ink)' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--surface)', borderRadius: 10, border: '1.5px solid var(--chalk)', overflow: 'hidden' }}>
      <button onClick={() => onChange(Math.max(0, value - 1))}
        style={{ width: 34, height: 54, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--grey)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Minus size={14} strokeWidth={2.4} />
      </button>
      <div style={{ width: 50, textAlign: 'center', fontFamily: 'Inter', fontWeight: 800, fontSize: '1.9rem', color: accent, lineHeight: 1 }}>
        {value}
      </div>
      <button onClick={() => onChange(Math.min(20, value + 1))}
        style={{ width: 34, height: 54, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--turf-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Plus size={14} strokeWidth={2.4} />
      </button>
    </div>
  );
}

function PickerRow({ label, points, value, onChange, options }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'minmax(120px, 180px) 1fr 60px',
      gap: '1rem', alignItems: 'center',
      padding: '0.8rem 0',
      borderBottom: '1px solid var(--chalk)',
    }}>
      <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)' }}>{label}</p>
      <CustomDropdown value={value} onChange={onChange} options={['', ...options]} placeholder="— No pick —" />
      <span className="h-mono" style={{ textAlign: 'right', fontSize: '0.78rem', fontWeight: 700, color: 'var(--turf-deep)' }}>{points}</span>
    </div>
  );
}

function SignInCard({ onOpen }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 12, padding: '1.25rem 1.5rem',
      background: 'linear-gradient(115deg, rgba(20,32,26,0.96) 0%, rgba(79,110,27,0.9) 100%)',
      color: 'var(--pitch)',
      display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.25rem', alignItems: 'center',
      boxShadow: '0 16px 40px rgba(20,32,26,0.18)',
    }}>
      <div>
        <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--turf)' }}>Sign in to play</p>
        <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.1rem', marginTop: 4, marginBottom: 8 }}>Lock in your call & climb the leaderboard.</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontFamily: 'Inter', fontSize: '0.82rem' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={13} strokeWidth={3} color="var(--turf)" /> See your live results</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} color="var(--turf)" /> Email match updates</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Trophy size={13} color="var(--turf)" /> Win exclusive prizes</li>
        </ul>
      </div>
      <button onClick={onOpen}
        style={{
          background: 'var(--turf)', color: 'var(--ink)',
          border: 'none', borderRadius: 8,
          padding: '0.75rem 1.4rem',
          fontFamily: 'Inter', fontWeight: 800, fontSize: '0.88rem',
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          boxShadow: '0 8px 24px rgba(155,202,53,0.4)',
        }}>
        <Sparkles size={14} strokeWidth={2.4} /> Sign in / Sign up
      </button>
    </div>
  );
}

function MatchCard({ match, pred, expanded, onToggle, onSaved, onRequireAuth }) {
  const { session, savePrediction } = useApp();
  // Look up players by FIFA code (e.g. 'BRA' → 'bra') — works with both live API and mock data
  const players = [
    ...(PLAYERS[(match.home?.code || '').toLowerCase()] || []),
    ...(PLAYERS[(match.away?.code || '').toLowerCase()] || []),
  ];
  // dedupe
  const playerOpts = Array.from(new Set(players));

  const done = match.status === 'completed';
  const [homeScore, setHomeScore] = useState(pred?.homeScore ?? 1);
  const [awayScore, setAwayScore] = useState(pred?.awayScore ?? 1);
  const [scorer, setScorer] = useState(pred?.scorer ?? '');
  const [assister, setAssister] = useState(pred?.assister ?? '');
  const [motm, setMotm] = useState(pred?.motm ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHomeScore(pred?.homeScore ?? 1);
    setAwayScore(pred?.awayScore ?? 1);
    setScorer(pred?.scorer ?? '');
    setAssister(pred?.assister ?? '');
    setMotm(pred?.motm ?? '');
  }, [match.id, pred]);

  async function handleSave() {
    if (!session) { onRequireAuth?.(); return; }
    setSaving(true);
    await savePrediction(match.id, { homeScore, awayScore, scorer, assister, motm });
    setSaving(false);
    onSaved?.();
  }

  const saved = !!pred;
  const status = done ? 'done' : saved ? 'saved' : 'open';

  const statusPill = {
    open: { bg: 'rgba(220,80,40,0.08)', col: '#A93C12', border: '#A93C12', label: 'Needs prediction', icon: AlertCircle },
    saved: { bg: 'var(--lime-faint)', col: 'var(--turf-deep)', border: 'var(--turf-deep)', label: 'Saved', icon: Check },
    done: { bg: 'var(--surface-2)', col: 'var(--grey)', border: 'var(--surface-3)', label: `FT ${match.result?.homeScore}–${match.result?.awayScore}`, icon: Lock },
  }[status];
  const StatusIcon = statusPill.icon;

  return (
    <div className="lift" style={{
      background: 'var(--white)',
      border: `1.5px solid ${expanded ? 'var(--ink)' : status === 'open' ? '#F1C5B0' : 'var(--chalk)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: expanded ? '0 24px 60px rgba(20,32,26,0.12)' : '0 4px 12px rgba(20,32,26,0.04)',
    }}>
      {/* Header (clickable summary) */}
      <button onClick={onToggle} style={{
        width: '100%', textAlign: 'left',
        display: 'grid',
        gridTemplateColumns: '110px 1fr auto 1fr 160px 18px',
        gap: '1rem', alignItems: 'center',
        padding: '1rem 1.25rem',
        background: 'transparent', border: 'none', cursor: 'pointer',
      }}>
        <div>
          <p className="h-mono" style={{ fontSize: '0.7rem', color: 'var(--turf-deep)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{match.stage}</p>
          <p className="h-mono" style={{ fontSize: '0.74rem', color: 'var(--grey-light)' }}>{fmtTime(match.kickoff)}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{match.home?.name || '—'}</span>
          <Flag team={match.home} size={30} />
        </div>
        <span className="h-mono" style={{ fontSize: '0.85rem', color: 'var(--grey-light)' }}>vs</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <Flag team={match.away} size={30} />
          <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{match.away?.name || '—'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: statusPill.bg,
            color: statusPill.col,
            border: `1.5px solid ${statusPill.border}`,
            borderRadius: 999,
            padding: '0.3rem 0.7rem',
            fontFamily: 'Inter', fontWeight: 800, fontSize: '0.72rem',
            letterSpacing: '0.04em',
          }}>
            <StatusIcon size={11} strokeWidth={3} />
            {saved && !done ? (
              <>Saved <span className="h-mono" style={{ marginLeft: 4 }}>{pred.homeScore}–{pred.awayScore}</span></>
            ) : statusPill.label}
          </span>
        </div>
        <ChevronDown size={16} strokeWidth={2.4}
          style={{ color: 'var(--grey)', transition: 'transform 0.22s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="anim-slide-down" style={{
          borderTop: '1.5px solid var(--chalk)',
          padding: '1.25rem 1.5rem 1.5rem',
          background: 'var(--surface)',
        }}>
          {!session && <div style={{ marginBottom: '1rem' }}><SignInCard onOpen={onRequireAuth} /></div>}

          {/* Scores */}
          <div style={{
            background: 'var(--white)', border: '1.5px solid var(--chalk)',
            borderRadius: 10, padding: '1.25rem',
            display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem',
            marginBottom: '0.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)' }}>{match.home?.name}</p>
                <p className="h-mono" style={{ fontSize: '0.66rem', color: 'var(--grey-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Home</p>
              </div>
              <Flag team={match.home} size={50} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ScoreStepper value={homeScore} onChange={setHomeScore} />
              <span className="h-mono" style={{ fontSize: '1.4rem', color: 'var(--grey-light)' }}>:</span>
              <ScoreStepper value={awayScore} onChange={setAwayScore} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Flag team={match.away} size={50} />
              <div>
                <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)' }}>{match.away?.name}</p>
                <p className="h-mono" style={{ fontSize: '0.66rem', color: 'var(--grey-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Away</p>
              </div>
            </div>
          </div>

          {playerOpts.length > 0 ? (
            <div style={{ background: 'var(--white)', border: '1.5px solid var(--chalk)', borderRadius: 10, padding: '0.4rem 1.25rem 0.6rem', marginTop: '0.85rem' }}>
              <PickerRow label="Goal scorer" points="+2 pts" value={scorer} onChange={setScorer} options={playerOpts} />
              <PickerRow label="Assister" points="+1 pt" value={assister} onChange={setAssister} options={playerOpts} />
              <PickerRow label="Man of the Match" points="+1 pt" value={motm} onChange={setMotm} options={playerOpts} />
            </div>
          ) : (
            <p style={{ fontFamily: 'Inter', fontSize: '0.82rem', color: 'var(--grey-light)', marginTop: '0.85rem', padding: '0.75rem', background: 'var(--white)', border: '1.5px dashed var(--chalk)', borderRadius: 8 }}>
              Player picks unlock once squads are confirmed.
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <p style={{ fontFamily: 'Inter', fontSize: '0.78rem', color: 'var(--grey)' }}>
              <strong style={{ color: 'var(--turf-deep)' }}>+5 pts</strong> exact score · <strong style={{ color: 'var(--turf-deep)' }}>+2 pts</strong> correct outcome
            </p>
            <button onClick={handleSave} disabled={done || saving}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: done ? 'var(--surface-2)' : 'var(--ink)',
                color: done ? 'var(--grey-light)' : 'var(--pitch)',
                border: 'none', borderRadius: 8,
                padding: '0.75rem 1.6rem',
                fontFamily: 'Inter', fontWeight: 800, fontSize: '0.88rem',
                cursor: done || saving ? 'not-allowed' : 'pointer',
                boxShadow: done ? 'none' : '0 8px 20px rgba(20,32,26,0.25)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => { if (!done && !saving) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
              {done ? <><Lock size={12} strokeWidth={2.4} /> Locked</>
                : !session ? <>Sign in to lock in</>
                : saved ? <>Update pick</>
                : <>Lock in prediction</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Predict() {
  const { matches, getMyPredictions, session } = useApp();
  const [myPreds, setMyPreds] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('open');
  const [stage, setStage] = useState('all');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => { getMyPredictions().then(setMyPreds); }, [session]);
  const refresh = () => getMyPredictions().then(setMyPreds);

  const upcoming = useMemo(
    () => matches.filter(m => m.status !== 'completed')
      .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff)),
    [matches],
  );

  const stages = useMemo(() => {
    const set = new Set(upcoming.map(m => m.stage));
    return ['all', ...Array.from(set)];
  }, [upcoming]);

  const filtered = useMemo(() => {
    return upcoming.filter(m => {
      if (stage !== 'all' && m.stage !== stage) return false;
      if (filter === 'open' && myPreds[m.id]) return false;
      if (filter === 'saved' && !myPreds[m.id]) return false;
      return true;
    });
  }, [upcoming, stage, filter, myPreds]);

  // Group by day
  const byDay = useMemo(() => {
    const m = {};
    filtered.forEach(x => {
      const k = dayKey(x.kickoff);
      if (!m[k]) m[k] = [];
      m[k].push(x);
    });
    return m;
  }, [filtered]);
  const days = Object.keys(byDay).sort();

  const total = upcoming.length;
  const savedCount = upcoming.filter(m => myPreds[m.id]).length;
  const openCount = total - savedCount;
  const pct = total ? Math.round((savedCount / total) * 100) : 0;

  return (
    <>
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
        <div className="anim-fade-up" style={{ marginBottom: '1.5rem' }}>
          <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>FIFA World Cup 2026</p>
          <h1 className="display" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: 0.95 }}>Predict matches</h1>
        </div>

        {/* Progress / overview */}
        <div className="anim-fade-up anim-d1" style={{
          display: 'grid', gridTemplateColumns: 'minmax(260px, 1.4fr) 1fr 1fr 1fr',
          gap: '0.85rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            background: 'var(--ink)', color: 'var(--pitch)',
            borderRadius: 12, padding: '1rem 1.25rem',
            position: 'relative', overflow: 'hidden',
          }}>
            <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--turf)' }}>Your progress</p>
            <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.7rem', marginTop: 4 }}>{savedCount} <span style={{ color: 'rgba(245,248,236,0.45)', fontSize: '1rem', fontWeight: 600 }}>/ {total} predicted</span></p>
            <div style={{ marginTop: 10, height: 6, background: 'rgba(245,248,236,0.15)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--turf)', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
          </div>
          {[
            ['Open', openCount, '#A93C12', AlertCircle, () => setFilter('open')],
            ['Saved', savedCount, 'var(--turf-deep)', Check, () => setFilter('saved')],
            ['All upcoming', total, 'var(--ink)', Sparkles, () => setFilter('all')],
          ].map(([label, n, col, Icon, click]) => (
            <button key={label} onClick={click} className="lift" style={{
              background: 'var(--white)', border: `1.5px solid var(--chalk)`,
              borderRadius: 12, padding: '1rem 1.25rem',
              textAlign: 'left', cursor: 'pointer',
              outline: filter === label.toLowerCase().split(' ')[0] ? `2px solid ${col}` : 'none',
              outlineOffset: -2,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon size={14} strokeWidth={2.4} color={col} />
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: col }}>{label}</p>
              </div>
              <p style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '1.7rem', marginTop: 4, color: 'var(--ink)' }}>{n}</p>
            </button>
          ))}
        </div>

        {/* Stage filter chips */}
        <div className="anim-fade-up anim-d2" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {stages.map(s => (
            <button key={s} onClick={() => setStage(s)}
              style={{
                padding: '0.45rem 0.95rem',
                background: stage === s ? 'var(--ink)' : 'var(--white)',
                color: stage === s ? 'var(--pitch)' : 'var(--grey)',
                border: `1.5px solid ${stage === s ? 'var(--ink)' : 'var(--chalk)'}`,
                borderRadius: 999,
                fontFamily: 'Inter', fontWeight: 700, fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              {s === 'all' ? 'All stages' : s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', fontFamily: 'Inter', color: 'var(--grey-light)' }}>
            {filter === 'open' ? 'You\'re all caught up! No open matches in this filter.' : 'No matches to show.'}
          </div>
        ) : (
          days.map(d => (
            <section key={d} style={{ marginBottom: '1.75rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.7rem',
                paddingBottom: '0.5rem', borderBottom: '1.5px solid var(--chalk)',
              }}>
                <h3 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '0.95rem', color: 'var(--ink)' }}>{fmtDay(byDay[d][0].kickoff)}</h3>
                <span className="h-mono" style={{ fontSize: '0.72rem', color: 'var(--grey-light)' }}>{byDay[d].length} {byDay[d].length === 1 ? 'match' : 'matches'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {byDay[d].map(m => (
                  <MatchCard key={m.id} match={m} pred={myPreds[m.id]}
                    expanded={expanded === m.id}
                    onToggle={() => setExpanded(expanded === m.id ? null : m.id)}
                    onSaved={refresh}
                    onRequireAuth={() => setShowAuth(true)} />
                ))}
              </div>
            </section>
          ))
        )}

      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
