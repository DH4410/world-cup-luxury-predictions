import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { flagUrl } from '../data/mockData';
import CustomDropdown from '../components/CustomDropdown';

function flagFor(team) {
  if (team?.flag) return team.flag;
  if (team?.flagCode) return flagUrl(team.flagCode);
  return null;
}
function Flag({ team, size = 26 }) {
  const src = flagFor(team);
  if (!src) return <div style={{ width: size, height: size * 0.66, background: 'var(--surface-2)', borderRadius: 2 }} />;
  return (
    <img src={src} alt={team?.code || ''}
      style={{ width: size, height: 'auto', display: 'block', borderRadius: 2 }}
      onError={e => { e.target.style.display = 'none'; }} />
  );
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function Schedule() {
  const { matches, teams } = useApp();
  const [stage, setStage] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const stages = useMemo(() => {
    const s = new Set(matches.map(m => m.stage));
    return ['all', ...Array.from(s)];
  }, [matches]);

  const teamMap = useMemo(() => Object.fromEntries(teams.map(t => [t.id, t])), [teams]);
  function teamOf(m, side) {
    return m[side] || teamMap[m[side === 'home' ? 'homeTeam' : 'awayTeam']];
  }

  const shown = matches.filter(m => {
    const stageOk = stage === 'all' || m.stage === stage;
    const statusOk = statusFilter === 'all' || m.status === statusFilter;
    return stageOk && statusOk;
  });

  const byDate = shown.reduce((acc, m) => {
    const day = (m.kickoff || '').slice(0, 10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});
  const sortedDates = Object.keys(byDate).sort();

  return (
    <main style={{ maxWidth: 1440, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      <div className="anim-fade-up" style={{ marginBottom: '1.75rem' }}>
        <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>FIFA World Cup 2026</p>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 0.95 }}>Schedule</h1>
        <p style={{ fontFamily: 'Inter', fontSize: '0.95rem', color: 'var(--grey)', marginTop: '0.6rem' }}>
          {matches.length} matches · live data from worldcup26.ir
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ minWidth: 220 }}>
          <CustomDropdown value={stage} onChange={setStage}
            options={stages.map(s => ({ value: s, label: s === 'all' ? 'All stages' : s }))}
            placeholder="Filter by stage" />
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {[['all', 'All'], ['upcoming', 'Upcoming'], ['completed', 'Results']].map(([v, lbl]) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              style={{
                padding: '0.5rem 1rem',
                background: statusFilter === v ? 'var(--ink)' : 'var(--white)',
                color: statusFilter === v ? 'var(--pitch)' : 'var(--grey)',
                border: `1.5px solid ${statusFilter === v ? 'var(--ink)' : 'var(--chalk)'}`,
                borderRadius: 999,
                fontFamily: 'Inter', fontWeight: 700, fontSize: '0.78rem',
                cursor: 'pointer',
              }}>{lbl}</button>
          ))}
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', border: '1.5px dashed var(--chalk)', borderRadius: 14 }}>
          <p className="display" style={{ fontSize: '2rem', color: 'var(--grey-light)' }}>No matches</p>
        </div>
      ) : sortedDates.map(day => (
        <div key={day} style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.7rem', borderBottom: '1.5px solid var(--chalk)', paddingBottom: '0.4rem' }}>
            <h3 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '0.95rem', color: 'var(--ink)' }}>{fmtDate(day + 'T12:00:00')}</h3>
            <span className="h-mono" style={{ fontSize: '0.72rem', color: 'var(--grey-light)' }}>{byDate[day].length} match{byDate[day].length > 1 ? 'es' : ''}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {byDate[day].map(m => {
              const ht = teamOf(m, 'home');
              const at = teamOf(m, 'away');
              const done = m.status === 'completed';
              return (
                <div key={m.id} className="lift" style={{
                  background: 'var(--white)', border: '1.5px solid var(--chalk)',
                  borderRadius: 10,
                  borderLeft: done ? '4px solid var(--surface-3)' : '4px solid var(--turf)',
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr auto 1fr 160px',
                  gap: '0.9rem', padding: '0.85rem 1.25rem',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.85rem', color: done ? 'var(--grey-light)' : 'var(--ink)' }}>
                      {done ? 'FT' : fmtTime(m.kickoff)}
                    </p>
                    <p className="h-mono" style={{ fontSize: '0.66rem', color: 'var(--turf-deep)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{m.stage}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>{ht?.name || '—'}</span>
                    <Flag team={ht} size={26} />
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 60 }}>
                    {done ? (
                      <span className="display" style={{ fontSize: '1.5rem', color: 'var(--ink)' }}>{m.result?.homeScore}–{m.result?.awayScore}</span>
                    ) : (
                      <span className="h-mono" style={{ fontSize: '0.95rem', color: 'var(--grey-light)' }}>vs</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Flag team={at} size={26} />
                    <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>{at?.name || '—'}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {done ? (
                      <span style={{ fontFamily: 'Inter', fontSize: '0.7rem', color: 'var(--grey-light)' }}>{m.city}</span>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
                          <MapPin size={10} strokeWidth={2} color="var(--grey-light)" />
                          <span style={{ fontFamily: 'Inter', fontSize: '0.72rem', fontWeight: 600, color: 'var(--grey-light)' }}>{m.city}</span>
                        </div>
                        <Link to="/predict" style={{
                          color: 'var(--turf-deep)', fontSize: '0.74rem', fontWeight: 800,
                          letterSpacing: '0.08em',
                          display: 'inline-flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end',
                          textTransform: 'uppercase',
                        }}>
                          Predict <ArrowRight size={11} strokeWidth={2.6} />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </main>
  );
}
