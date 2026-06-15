import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { TEAMS, MATCHES, flagUrl } from '../data/mockData';

function getTeam(id) { return TEAMS.find(t => t.id === id); }

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' ET';
}

function Flag({ code, size = 28 }) {
  return (
    <img src={flagUrl(code)} alt={code}
      style={{ width: size, height: 'auto', display: 'block', borderRadius: 2 }}
      onError={e => { e.target.style.display = 'none'; }} />
  );
}

const GROUPS = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export default function Schedule() {
  const [filter, setFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

  const shown = MATCHES.filter(m => {
    const groupOk = filter === 'All' || m.stage.includes(`Group ${filter}`);
    const statusOk = statusFilter === 'all' || m.status === statusFilter;
    return groupOk && statusOk;
  });

  // Group matches by date
  const byDate = shown.reduce((acc, m) => {
    const day = new Date(m.kickoff).toISOString().split('T')[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});
  const sortedDates = Object.keys(byDate).sort();

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>FIFA World Cup 2026</p>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 0.95 }}>Schedule</h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {/* Group filter */}
        <div style={{ display: 'flex', gap: 0, background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1.5px solid var(--surface-3)', overflow: 'hidden' }}>
          {GROUPS.map((g, i) => (
            <button key={g} onClick={() => setFilter(g)} className="caps"
              style={{
                padding: '0.55rem 0.8rem', minWidth: 36,
                background: filter === g ? 'var(--black)' : 'transparent',
                color: filter === g ? '#fff' : 'var(--grey-light)',
                border: 'none',
                borderRight: i < GROUPS.length - 1 ? '1px solid var(--surface-3)' : 'none',
                cursor: 'pointer', fontSize: '0.7rem',
                transition: 'background 0.15s, color 0.15s',
              }}
            >{g === 'All' ? 'All' : `Grp ${g}`}</button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 0, background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1.5px solid var(--surface-3)', overflow: 'hidden' }}>
          {[['all', 'All'], ['upcoming', 'Upcoming'], ['completed', 'Results']].map(([val, label], i) => (
            <button key={val} onClick={() => setStatusFilter(val)} className="caps"
              style={{
                padding: '0.55rem 1rem',
                background: statusFilter === val ? 'var(--lime)' : 'transparent',
                color: statusFilter === val ? 'var(--black)' : 'var(--grey-light)',
                border: 'none', borderRight: i < 2 ? '1px solid var(--surface-3)' : 'none',
                cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700,
                transition: 'background 0.15s, color 0.15s',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Match list */}
      {sortedDates.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', border: '1.5px dashed var(--surface-3)', borderRadius: 'var(--r-xl)' }}>
          <p className="display" style={{ fontSize: '2rem', color: 'var(--grey-light)' }}>No matches</p>
        </div>
      ) : sortedDates.map(day => (
        <div key={day} style={{ marginBottom: '2rem' }}>
          {/* Day header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <h3 className="display" style={{ fontSize: '1.35rem', color: 'var(--black)' }}>{fmtDate(day + 'T12:00:00')}</h3>
            <span className="badge badge-dark">{byDate[day].length} match{byDate[day].length > 1 ? 'es' : ''}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {byDate[day].map(m => {
              const ht = getTeam(m.homeTeam);
              const at = getTeam(m.awayTeam);
              const done = m.status === 'completed';
              return (
                <div key={m.id} style={{
                  background: 'var(--white)', border: `1.5px solid ${done ? 'var(--surface-3)' : 'var(--surface-2)'}`,
                  borderRadius: 'var(--r-md)', overflow: 'hidden',
                  borderLeft: done ? '4px solid var(--surface-3)' : '4px solid var(--lime-dark)',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr auto 1fr 120px',
                    gap: '0.75rem', padding: '0.875rem 1.25rem',
                    alignItems: 'center',
                  }}>
                    {/* Time/Stage */}
                    <div>
                      <p style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.85rem', color: done ? 'var(--grey-light)' : 'var(--black)' }}>
                        {done ? 'FT' : fmtTime(m.kickoff)}
                      </p>
                      <p className="caps" style={{ color: 'var(--grey-light)', fontSize: '0.6rem' }}>{m.stage}</p>
                    </div>

                    {/* Home */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <span style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.92rem', color: 'var(--black)', textAlign: 'right' }}>{ht?.name}</span>
                      <Flag code={ht?.flagCode} size={26} />
                    </div>

                    {/* Score / VS */}
                    <div style={{ textAlign: 'center', minWidth: 60 }}>
                      {done ? (
                        <span className="display" style={{ fontSize: '1.5rem', color: 'var(--black)' }}>
                          {m.result.homeScore}–{m.result.awayScore}
                        </span>
                      ) : (
                        <span className="display" style={{ fontSize: '1.25rem', color: 'var(--grey-light)' }}>VS</span>
                      )}
                    </div>

                    {/* Away */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Flag code={at?.flagCode} size={26} />
                      <span style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.92rem', color: 'var(--black)' }}>{at?.name}</span>
                    </div>

                    {/* Stadium / actions */}
                    <div style={{ textAlign: 'right' }}>
                      {done && m.result ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', alignItems: 'flex-end' }}>
                          <span style={{ fontFamily: 'Barlow', fontSize: '0.72rem', fontWeight: 600, color: 'var(--grey)' }}>⚽ {m.result.scorer}</span>
                          <span style={{ fontFamily: 'Barlow', fontSize: '0.72rem', fontWeight: 600, color: 'var(--grey)' }}>🏅 {m.result.motm}</span>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', marginBottom: '0.3rem' }}>
                            <MapPin size={10} strokeWidth={2} color="var(--grey-light)" />
                            <span style={{ fontFamily: 'Barlow', fontSize: '0.72rem', fontWeight: 600, color: 'var(--grey-light)' }}>{m.city}</span>
                          </div>
                          <Link to="/predict" className="caps" style={{
                            color: 'var(--lime-dark)', fontSize: '0.65rem', fontWeight: 700,
                            textDecoration: 'none', letterSpacing: '0.08em',
                            display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end',
                          }}>
                            Predict <ArrowRight size={10} strokeWidth={3} />
                          </Link>
                        </div>
                      )}
                    </div>
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
