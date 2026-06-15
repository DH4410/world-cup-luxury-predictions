import { useState, useEffect } from 'react';
import { TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Leaderboard() {
  const { session, profile, getLeaderboard, getRooms } = useApp();
  const [leaders, setLeaders] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tab, setTab] = useState('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getLeaderboard(), getRooms()]).then(([lb, rms]) => {
      setLeaders(lb); setRooms(rms); setLoading(false);
    });
  }, [session]);

  const myRank = leaders.findIndex(u => u.id === session?.user?.id) + 1;

  const TABS = [
    { val: 'global', label: 'Global', icon: TrendingUp },
    { val: 'rooms',  label: 'My Rooms', icon: Users },
  ];

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>World Cup 2026</p>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 0.95 }}>Rankings</h1>
      </div>

      {/* My stats */}
      {session && profile && (
        <div className="anim-fade-up" style={{ background: 'var(--black)', borderRadius: 'var(--r-xl)', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '0.6rem 1.5rem', background: 'var(--lime)' }}>
            <p className="caps" style={{ color: 'var(--black)' }}>Your Stats</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { val: myRank ? `#${myRank}` : '–', label: 'Global Rank' },
              { val: profile.total_points, label: 'Total Points' },
              { val: profile.exact_scores, label: 'Exact Scores' },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: '1.25rem 1.5rem', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <p className="display" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fff', marginBottom: '0.15rem' }}>{s.val}</p>
                <p className="caps" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--white)', borderRadius: 'var(--r-md)', border: '1.5px solid var(--surface-3)', overflow: 'hidden', width: 'fit-content', marginBottom: '1.5rem' }}>
        {TABS.map((t, i) => {
          const Icon = t.icon;
          return (
            <button key={t.val} onClick={() => setTab(t.val)} className="caps"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.6rem 1.25rem',
                background: tab === t.val ? 'var(--black)' : 'transparent',
                color: tab === t.val ? '#fff' : 'var(--grey-light)',
                border: 'none', borderRight: i === 0 ? '1.5px solid var(--surface-3)' : 'none',
                cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
              }}
            >
              <Icon size={11} strokeWidth={2.5} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Global table */}
      {tab === 'global' && (
        <div className="card-flat">
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.5rem 1fr 5rem 5rem 5rem', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'var(--surface)' }}>
            {['#', 'Player', 'Exact', 'Results', 'Pts'].map(h => (
              <p key={h} className="caps" style={{ color: 'var(--grey-light)', textAlign: h === 'Player' ? 'left' : 'right' }}>{h}</p>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Barlow', color: 'var(--grey-light)' }}>Loading…</p>
            </div>
          ) : leaders.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <p className="display" style={{ fontSize: '2rem', color: 'var(--grey-light)', marginBottom: '0.5rem' }}>No players yet</p>
              <p style={{ fontFamily: 'Barlow', color: 'var(--grey-light)', marginBottom: '1.25rem' }}>Be the first to sign up!</p>
              <Link to="/predict" className="btn btn-lime">Start Predicting <ArrowRight size={13} /></Link>
            </div>
          ) : leaders.map((u, i) => {
            const isSelf = u.id === session?.user?.id;
            return (
              <div key={u.id} style={{
                display: 'grid', gridTemplateColumns: '2.5rem 1fr 5rem 5rem 5rem', gap: '0.5rem',
                padding: '0.875rem 1.25rem', borderBottom: '1.5px solid var(--surface-3)',
                background: isSelf ? 'rgba(200,255,0,0.06)' : 'transparent',
                borderLeft: i === 0 ? '3px solid var(--lime-dark)' : '3px solid transparent',
                alignItems: 'center',
              }}>
                <span className="display" style={{ fontSize: '1.25rem', color: i === 0 ? 'var(--lime-dark)' : i === 1 ? 'var(--grey-light)' : i === 2 ? '#CD7F32' : 'var(--grey-light)' }}>
                  {i + 1}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: i === 0 ? 'var(--lime)' : isSelf ? 'var(--black)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow', fontWeight: 800, fontSize: '0.72rem', color: i === 0 ? 'var(--black)' : isSelf ? 'var(--lime)' : 'var(--grey)', flexShrink: 0 }}>
                    {u.avatar_initials}
                  </div>
                  <p style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.9rem', color: 'var(--black)' }}>
                    {u.username}{isSelf && <span style={{ color: 'var(--grey-light)', fontWeight: 400, fontSize: '0.8rem' }}> (you)</span>}
                  </p>
                </div>
                <p style={{ textAlign: 'right', fontFamily: 'Barlow', fontWeight: 600, fontSize: '0.9rem', color: 'var(--black)' }}>{u.exact_scores}</p>
                <p style={{ textAlign: 'right', fontFamily: 'Barlow', fontWeight: 600, fontSize: '0.9rem', color: 'var(--black)' }}>{u.correct_outcomes}</p>
                <p style={{ textAlign: 'right' }}>
                  <span className="display" style={{ fontSize: '1.35rem', color: i === 0 ? 'var(--lime-dark)' : 'var(--black)' }}>{u.total_points}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Rooms tab */}
      {tab === 'rooms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!session ? (
            <div style={{ padding: '4rem', textAlign: 'center', border: '1.5px dashed var(--surface-3)', borderRadius: 'var(--r-xl)' }}>
              <p className="display" style={{ fontSize: '2rem', color: 'var(--grey-light)' }}>Sign in to see your rooms.</p>
            </div>
          ) : rooms.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', border: '1.5px dashed var(--surface-3)', borderRadius: 'var(--r-xl)' }}>
              <p className="display" style={{ fontSize: '2rem', color: 'var(--grey-light)', marginBottom: '0.5rem' }}>No rooms yet.</p>
              <Link to="/rooms" className="btn btn-dark" style={{ display: 'inline-flex', marginTop: '0.5rem' }}>Go to Rooms <ArrowRight size={13} /></Link>
            </div>
          ) : rooms.map(room => {
            const members = (room.room_members || []).map(m => m.profiles).filter(Boolean).sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
            return (
              <div key={room.id} className="card-flat">
                <div style={{ padding: '1rem 1.25rem', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p className="display" style={{ fontSize: '1.5rem', color: '#fff' }}>{room.name}</p>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'var(--lime)', letterSpacing: '0.1em' }}>{room.code}</span>
                </div>
                {members.map((m, i) => {
                  const isSelf = m.id === session?.user?.id;
                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1.5px solid var(--surface-3)', background: isSelf ? 'rgba(200,255,0,0.05)' : 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span className="display" style={{ fontSize: '1.25rem', minWidth: 20, color: i === 0 ? 'var(--lime-dark)' : 'var(--grey-light)' }}>{i + 1}</span>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: isSelf ? 'var(--lime)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow', fontWeight: 800, fontSize: '0.72rem', color: isSelf ? 'var(--black)' : 'var(--grey)' }}>
                          {m.avatar_initials}
                        </div>
                        <p style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.9rem', color: 'var(--black)' }}>
                          {m.username}{isSelf && <span style={{ color: 'var(--grey-light)', fontWeight: 400 }}> (you)</span>}
                        </p>
                      </div>
                      <span className="display" style={{ fontSize: '1.5rem', color: 'var(--black)' }}>{m.total_points || 0}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
