import { useState, useEffect, useCallback } from 'react';
import { Plus, Hash, Users, ArrowRight, Eye, EyeOff, ChevronLeft, Activity, Copy, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEAMS, MATCHES, flagUrl } from '../data/mockData';

function getTeam(id) { return TEAMS.find(t => t.id === id); }
function getMatch(id) { return MATCHES.find(m => m.id === id); }

function fmtAge(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return Math.floor(diff / 86400000) + 'd ago';
}

function RoomDetail({ room, onBack }) {
  const { session, getRoomPredictions } = useApp();
  const [data, setData] = useState({ members: [], predictions: {} });
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const FEATURED = 'm1';
  const match = getMatch(FEATURED);
  const homeTeam = match ? getTeam(match.homeTeam) : null;
  const awayTeam = match ? getTeam(match.awayTeam) : null;

  useEffect(() => { getRoomPredictions(room.id).then(setData); }, [room.id]);

  function copyCode() {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sorted = [...data.members].sort((a, b) =>
    (b.profiles?.total_points || 0) - (a.profiles?.total_points || 0)
  );
  const activity = (room.room_activity || []).slice(0, 6);

  return (
    <div>
      {/* Room header */}
      <div style={{ background: 'var(--black)', borderRadius: 'var(--r-xl)', padding: '1.75rem 2rem', marginBottom: '1.5rem' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: '1rem', padding: 0, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--lime)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
          <ChevronLeft size={12} strokeWidth={3} /> All Rooms
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="caps" style={{ color: 'var(--lime)', marginBottom: '0.35rem' }}>Private Room</p>
            <h1 className="display" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: '#fff' }}>{room.name}</h1>
          </div>
          <button onClick={copyCode} style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.15)',
            borderRadius: 'var(--r-md)', padding: '0.6rem 1rem', cursor: 'pointer',
            fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.15em', color: '#fff',
            transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--lime)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
          >
            {room.code}
            {copied ? <Check size={14} strokeWidth={2.5} style={{ color: 'var(--lime)' }} /> : <Copy size={14} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.4)' }} />}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: '1.25rem' }} className="grid-cols-responsive">
        {/* Standings */}
        <div className="card-flat">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1.5px solid var(--surface-3)' }}>
            <p className="caps" style={{ color: 'var(--grey)' }}>Standings</p>
          </div>
          {sorted.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Barlow', fontSize: '0.9rem', color: 'var(--grey-light)' }}>Loading…</p>
            </div>
          ) : sorted.map((m, i) => {
            const p = m.profiles;
            const isSelf = m.user_id === session?.user?.id;
            return (
              <div key={m.user_id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.875rem 1.25rem', borderBottom: '1.5px solid var(--surface-3)',
                background: isSelf ? 'rgba(200,255,0,0.06)' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="display" style={{ fontSize: '1.25rem', minWidth: 20, textAlign: 'center', color: i === 0 ? 'var(--lime-dark)' : i === 1 ? 'var(--grey-light)' : i === 2 ? '#CD7F32' : 'var(--grey-light)' }}>{i + 1}</span>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: isSelf ? 'var(--lime)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow', fontWeight: 800, fontSize: '0.72rem', color: isSelf ? 'var(--black)' : 'var(--grey)' }}>
                    {p?.avatar_initials || '?'}
                  </div>
                  <p style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.85rem', color: 'var(--black)' }}>
                    {p?.username || '?'}{isSelf && <span style={{ color: 'var(--grey-light)', fontWeight: 400 }}> (you)</span>}
                  </p>
                </div>
                <p style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.9rem', color: 'var(--black)' }}>{p?.total_points || 0}<span className="caps" style={{ color: 'var(--grey-light)', marginLeft: 2 }}>pts</span></p>
              </div>
            );
          })}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Prediction comparison */}
          <div className="card-flat">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1.5px solid var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p className="caps" style={{ color: 'var(--grey)' }}>Predictions</p>
                {homeTeam && awayTeam && (
                  <p style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: '0.9rem', color: 'var(--black)', marginTop: 2 }}>
                    {homeTeam.name} vs {awayTeam.name}
                  </p>
                )}
              </div>
              <button onClick={() => setRevealed(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface)', border: '1.5px solid var(--surface-3)', borderRadius: 'var(--r-sm)', padding: '0.4rem 0.8rem', cursor: 'pointer', fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--grey)', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--black)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--surface-3)'}
              >
                {revealed ? <EyeOff size={12} strokeWidth={2.5} /> : <Eye size={12} strokeWidth={2.5} />}
                {revealed ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <div>
              {sorted.length === 0 && <div style={{ padding: '1.5rem', textAlign: 'center' }}><p style={{ fontFamily: 'Barlow', color: 'var(--grey-light)', fontSize: '0.9rem' }}>Loading…</p></div>}
              {sorted.map(m => {
                const p = m.profiles;
                const pred = data.predictions[m.user_id]?.[FEATURED];
                const isSelf = m.user_id === session?.user?.id;
                return (
                  <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1.5px solid var(--surface-3)', background: isSelf ? 'rgba(200,255,0,0.04)' : 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: isSelf ? 'var(--lime)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow', fontWeight: 800, fontSize: '0.7rem', color: isSelf ? 'var(--black)' : 'var(--grey)', flexShrink: 0 }}>{p?.avatar_initials || '?'}</div>
                      <span style={{ fontFamily: 'Barlow', fontWeight: 600, fontSize: '0.85rem', color: 'var(--black)' }}>{p?.username}</span>
                    </div>
                    {pred ? (
                      revealed ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <span className="display" style={{ fontSize: '1.5rem' }}>{pred.home_score}–{pred.away_score}</span>
                          {pred.scorer && <span style={{ fontFamily: 'Barlow', fontSize: '0.8rem', fontWeight: 600, color: 'var(--grey)' }}>⚽ {pred.scorer}</span>}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <div style={{ width: 40, height: 14, background: 'var(--surface-2)', borderRadius: 4 }} />
                          <div style={{ width: 60, height: 14, background: 'var(--surface-2)', borderRadius: 4 }} />
                        </div>
                      )
                    ) : (
                      <span className="caps" style={{ color: 'var(--grey-light)' }}>Not yet</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity */}
          <div className="card-flat">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1.5px solid var(--surface-3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={13} strokeWidth={2.5} color="var(--grey)" />
              <p className="caps" style={{ color: 'var(--grey)' }}>Activity</p>
            </div>
            {activity.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center' }}><p style={{ fontFamily: 'Barlow', color: 'var(--grey-light)', fontSize: '0.9rem' }}>No activity yet.</p></div>
            ) : activity.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.875rem 1.25rem', borderBottom: '1.5px solid var(--surface-3)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--lime-dark)', marginTop: 6, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: 'Barlow', fontSize: '0.88rem', color: 'var(--black)', lineHeight: 1.5 }}>{a.message}</p>
                  <p className="caps" style={{ color: 'var(--grey-light)', marginTop: 2 }}>{fmtAge(a.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`.grid-cols-responsive { @media (max-width: 768px) { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function RoomCard({ room, onSelect }) {
  const members = room.room_members || [];
  return (
    <button onClick={() => onSelect(room)} className="card" style={{ padding: '1.5rem', textAlign: 'left', width: '100%', border: '1.5px solid var(--surface-3)', cursor: 'pointer', background: 'var(--white)', borderRadius: 'var(--r-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <div>
          <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>Private Room</p>
          <h3 className="display" style={{ fontSize: '1.5rem', color: 'var(--black)', lineHeight: 1.1 }}>{room.name}</h3>
        </div>
        <ArrowRight size={16} strokeWidth={2.5} color="var(--grey-light)" style={{ marginTop: 4, flexShrink: 0 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Users size={12} strokeWidth={2.5} color="var(--grey-light)" />
          <span style={{ fontFamily: 'Barlow', fontSize: '0.85rem', fontWeight: 600, color: 'var(--grey)' }}>{members.length} member{members.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Hash size={12} strokeWidth={2.5} color="var(--grey-light)" />
          <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: 'var(--grey)' }}>{room.code}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: -6 }}>
        {members.slice(0, 5).map((m, i) => (
          <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-2)', border: '2px solid var(--white)', marginLeft: i > 0 ? -6 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow', fontWeight: 800, fontSize: '0.68rem', color: 'var(--grey)', zIndex: 5 - i }}>
            {m.profiles?.avatar_initials || '?'}
          </div>
        ))}
      </div>
    </button>
  );
}

export default function Rooms() {
  const { session, createRoom, joinRoom, getRooms } = useApp();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getRooms();
    setRooms(data);
    setLoading(false);
  }, [session]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!roomName.trim()) return;
    const room = await createRoom(roomName.trim());
    if (room) { setRoomName(''); setMode(null); await load(); setSelected(room); }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    const room = await joinRoom(joinCode.trim());
    if (room) { setJoinCode(''); setMode(null); await load(); }
  }

  if (selected) {
    const fresh = rooms.find(r => r.id === selected.id) || selected;
    return (
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>
        <RoomDetail room={fresh} onBack={() => setSelected(null)} />
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p className="caps" style={{ color: 'var(--grey-light)', marginBottom: '0.25rem' }}>Compete with friends</p>
        <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 0.95 }}>Rooms</h1>
      </div>

      {/* Actions */}
      {session ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button onClick={() => setMode(mode === 'create' ? null : 'create')} className="btn btn-dark">
            <Plus size={14} strokeWidth={2.5} /> New Room
          </button>
          <button onClick={() => setMode(mode === 'join' ? null : 'join')} className="btn btn-outline">
            <Hash size={14} strokeWidth={2.5} /> Join with Code
          </button>
        </div>
      ) : (
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(200,255,0,0.08)', border: '1.5px solid var(--lime-dark)', borderRadius: 'var(--r-md)', marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: 'Barlow', fontSize: '0.9rem', fontWeight: 600, color: 'var(--black)' }}>Sign in to create or join prediction rooms.</p>
        </div>
      )}

      {mode === 'create' && (
        <div className="card-flat anim-scale-in" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <p className="caps" style={{ color: 'var(--grey)', marginBottom: '0.875rem' }}>New Room Name</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input type="text" className="input" value={roomName} onChange={e => setRoomName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder="e.g. Office Champions" style={{ flex: 1, minWidth: 220 }} />
            <button onClick={handleCreate} className="btn btn-lime">Create <ArrowRight size={14} /></button>
          </div>
        </div>
      )}

      {mode === 'join' && (
        <div className="card-flat anim-scale-in" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <p className="caps" style={{ color: 'var(--grey)', marginBottom: '0.875rem' }}>Enter Room Code</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input type="text" className="input" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleJoin()} placeholder="ABCD-1234" style={{ flex: 1, minWidth: 220, fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700 }} />
            <button onClick={handleJoin} className="btn btn-lime">Join <ArrowRight size={14} /></button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 160, background: 'var(--surface-2)', borderRadius: 'var(--r-lg)', animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : rooms.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {rooms.map(r => <RoomCard key={r.id} room={r} onSelect={setSelected} />)}
        </div>
      ) : (
        <div style={{ padding: '4rem 1.25rem', textAlign: 'center', border: '1.5px dashed var(--surface-3)', borderRadius: 'var(--r-xl)' }}>
          <p className="display" style={{ fontSize: '2rem', color: 'var(--grey-light)', marginBottom: '0.5rem' }}>No rooms yet</p>
          <p style={{ fontFamily: 'Barlow', fontSize: '0.9rem', color: 'var(--grey-light)' }}>
            {session ? 'Create your first room above.' : 'Sign in to create or join rooms.'}
          </p>
        </div>
      )}
    </main>
  );
}
